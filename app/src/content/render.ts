// Rendu du contenu au build (exécuté par Vite sous Node, jamais dans le navigateur) :
// le YAML est validé avec le schéma, puis chaque champ Markdown est converti en HTML
// (KaTeX pour les formules, Shiki pour le code). L'app ne reçoit que du HTML prêt à afficher.
import MarkdownIt from 'markdown-it'
import katexPluginModule from '@vscode/markdown-it-katex'
import katex from 'katex'
import { bundledLanguages, createHighlighter, type BundledLanguage, type Highlighter } from 'shiki'
import { semaine, type Fiche, type Question, type Semaine } from './schema.ts'

type Md = InstanceType<typeof MarkdownIt>

// Module CommonJS : sous Node, l'import par défaut renvoie l'objet `exports` entier.
const katexPlugin =
  (katexPluginModule as unknown as { default?: typeof katexPluginModule }).default ?? katexPluginModule

const THEMES = { light: 'github-light', dark: 'github-dark' } as const

// Alias acceptés dans les blocs de code, en plus des noms et alias de Shiki.
const ALIAS: Record<string, string> = { asm: 'riscv', 'risc-v': 'riscv', sv: 'system-verilog' }

let highlighter: Promise<Highlighter> | null = null
const obtenirHighlighter = () =>
  (highlighter ??= createHighlighter({ themes: Object.values(THEMES), langs: [] }))

function nomLangage(langage: string): BundledLanguage | null {
  const nom = (ALIAS[langage.toLowerCase()] ?? langage.toLowerCase()) as BundledLanguage
  return nom in bundledLanguages ? nom : null
}

function creerMarkdown(h: Highlighter): Md {
  // Le HTML brut est désactivé : le contenu ne passe que par Markdown + KaTeX.
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false }).use(katexPlugin, {
    katex,
    throwOnError: false,
  })
  md.renderer.rules.fence = (tokens, idx) => {
    const t = tokens[idx]
    return blocCode(md, h, t.content, t.info.trim().split(/\s+/)[0] ?? '')
  }
  return md
}

function blocCode(md: Md, h: Highlighter, code: string, langage: string): string {
  const nom = nomLangage(langage)
  const source = code.replace(/\n$/, '')
  if (nom && h.getLoadedLanguages().includes(nom))
    return h.codeToHtml(source, { lang: nom, themes: THEMES, defaultColor: false })
  return `<pre class="code"><code>${md.utils.escapeHtml(source)}</code></pre>`
}

// Langages utilisés par une semaine : on les charge avant le rendu, qui est synchrone.
function langagesUtilises(s: Semaine): BundledLanguage[] {
  const noms = new Set<string>()
  const json = JSON.stringify(s)
  for (const m of json.matchAll(/```([^\s`\\]+)/g)) noms.add(m[1])
  for (const f of s.fiches) if (f.type === 'syntaxe') noms.add(f.langage)
  return [...noms].map(nomLangage).filter((n): n is BundledLanguage => n !== null)
}

export class ErreurContenu extends Error {}

export async function rendreSemaine(donnees: unknown, fichier: string): Promise<Semaine> {
  const r = semaine.safeParse(donnees)
  if (!r.success) {
    const details = r.error.issues.map((i) => `  - ${i.path.join('.')} : ${i.message}`).join('\n')
    throw new ErreurContenu(`Contenu invalide dans ${fichier} :\n${details}`)
  }
  const s = r.data
  const h = await obtenirHighlighter()
  await Promise.all(langagesUtilises(s).map((l) => h.loadLanguage(l)))
  const md = creerMarkdown(h)

  const bloc = (t: string) => md.render(t)
  const ligne = (t: string) => md.renderInline(t)
  const opt = (t: string | undefined) => (t === undefined ? undefined : bloc(t))
  const incertain = (t: string | null) => (t === null ? null : ligne(t))

  const fiche = (f: Fiche): Fiche => {
    const commun = {
      titre: ligne(f.titre),
      incertain: incertain(f.incertain),
      schema: f.schema && { svg: f.schema.svg, legende: bloc(f.schema.legende) },
    }
    switch (f.type) {
      case 'definition':
        return { ...f, ...commun, corps: bloc(f.corps) }
      case 'theoreme':
        return { ...f, ...commun, hypotheses: bloc(f.hypotheses), corps: bloc(f.corps), remarques: opt(f.remarques) }
      case 'formule':
        return { ...f, ...commun, corps: bloc(f.corps), conditions: opt(f.conditions) }
      case 'methode':
        return { ...f, ...commun, etapes: f.etapes.map(bloc), exemple: opt(f.exemple) }
      case 'syntaxe':
        return {
          ...f,
          ...commun,
          syntaxe: blocCode(md, h, f.syntaxe, f.langage),
          usage: bloc(f.usage),
          exemple: f.exemple === undefined ? undefined : blocCode(md, h, f.exemple, f.langage),
          piege: opt(f.piege),
        }
      case 'resume':
        return { ...f, ...commun, corps: bloc(f.corps), points_cles: f.points_cles.map(bloc) }
    }
  }

  const question = (q: Question): Question => {
    const commun = { enonce: bloc(q.enonce), explication: bloc(q.explication), incertain: incertain(q.incertain) }
    return q.type === 'qcm' ? { ...q, ...commun, choix: q.choix.map(ligne) } : { ...q, ...commun }
  }

  return { ...s, titre: ligne(s.titre), fiches: s.fiches.map(fiche), quiz: s.quiz.map(question) }
}
