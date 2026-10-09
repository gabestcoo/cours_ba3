// Schéma du contenu, partagé par l'app et par scripts/validate.ts.
// Toute modification de ce fichier est un changement de schéma (voir CLAUDE.md, règle 8).
import { z } from 'zod'
import { COURS, type SlugCours } from './cours.ts'

export { COURS, type SlugCours }

const slugs = COURS.map((c) => c.slug) as [SlugCours, ...SlugCours[]]
export const slugCours = z.enum(slugs)

const texte = z.string().trim().min(1)
// Champ Markdown (avec LaTeX via KaTeX).
const markdown = texte

export const source = z.strictObject({
  fichier: texte, // chemin relatif à la racine du dépôt
  emplacement: texte, // "slide 12", "p. 34", "section 2.3"
})

const incertain = z.string().trim().min(1).nullable()

// Un schéma est un SVG redessiné d'après le cours (jamais une image extraite des sources).
// Il est inséré tel quel dans la page : on n'accepte qu'un SVG « inerte ».
const SVG_INTERDIT: [RegExp, string][] = [
  [/<script/i, 'balise <script> interdite'],
  [/<foreignObject/i, 'balise <foreignObject> interdite'],
  [/<image/i, 'balise <image> interdite (redessiner le schéma en SVG)'],
  [/\son[a-z]+\s*=/i, 'attribut on… interdit'],
  [/(href|src)\s*=\s*["']\s*(?!#)/i, 'lien externe interdit (seuls les liens internes "#…" sont permis)'],
  [/url\(\s*["']?\s*(?!#)/i, 'url(…) externe interdite'],
]

export const schemaSvg = z.strictObject({
  svg: z
    .string()
    .trim()
    .superRefine((svg, ctx) => {
      if (!/^<svg[\s>]/.test(svg) || !/<\/svg>$/.test(svg))
        ctx.addIssue({ code: 'custom', message: 'doit commencer par <svg et finir par </svg>' })
      if (!/viewBox\s*=/.test(svg)) ctx.addIssue({ code: 'custom', message: 'attribut viewBox requis' })
      for (const [motif, message] of SVG_INTERDIT) if (motif.test(svg)) ctx.addIssue({ code: 'custom', message })
    }),
  legende: markdown,
})

const communFiche = {
  id: z.string().regex(/^[a-z0-9]+-s\d{2}-\d{3}$/, 'format attendu : <cours>-sXX-NNN'),
  titre: texte,
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  source,
  verifie: z.boolean(),
  incertain,
  schema: schemaSvg.optional(),
}

export const fiche = z.discriminatedUnion('type', [
  z.strictObject({ ...communFiche, type: z.literal('definition'), corps: markdown }),
  z.strictObject({
    ...communFiche,
    type: z.literal('theoreme'),
    hypotheses: markdown,
    corps: markdown,
    remarques: markdown.optional(),
  }),
  z.strictObject({
    ...communFiche,
    type: z.literal('formule'),
    corps: markdown,
    conditions: markdown.optional(),
  }),
  z.strictObject({
    ...communFiche,
    type: z.literal('methode'),
    etapes: z.array(markdown).min(1),
    exemple: markdown.optional(),
  }),
  z.strictObject({
    ...communFiche,
    type: z.literal('syntaxe'),
    langage: texte,
    syntaxe: texte,
    usage: markdown,
    exemple: texte.optional(), // seulement si la construction a un piège ou un comportement non évident
    piege: markdown.optional(),
  }),
  z.strictObject({
    ...communFiche,
    type: z.literal('resume'),
    corps: markdown,
    points_cles: z.array(markdown).min(1),
  }),
])

const communQuestion = {
  id: z.string().regex(/^[a-z0-9]+-s\d{2}-q\d{3}$/, 'format attendu : <cours>-sXX-qNNN'),
  enonce: markdown,
  explication: markdown,
  source,
  verifie: z.boolean(),
  incertain,
}

// `tolerance: null` est accepté partout pour garder un gabarit de question unique.
const sansTolerance = z.null().optional()

export const question = z.discriminatedUnion('type', [
  z.strictObject({
    ...communQuestion,
    type: z.literal('qcm'),
    choix: z.array(markdown).min(2),
    reponse: z.number().int().nonnegative(),
    tolerance: sansTolerance,
  }),
  z.strictObject({
    ...communQuestion,
    type: z.literal('vrai_faux'),
    reponse: z.boolean(),
    tolerance: sansTolerance,
  }),
  z.strictObject({
    ...communQuestion,
    type: z.literal('numerique'),
    reponse: z.number(),
    tolerance: z.number().nonnegative().nullable().optional(),
  }),
  z.strictObject({
    ...communQuestion,
    type: z.literal('trace'),
    reponse: z.union([z.number(), texte]),
    tolerance: sansTolerance,
  }),
])

export const semaine = z
  .strictObject({
    cours: slugCours,
    semaine: z.number().int().min(1).max(14),
    titre: texte,
    fiches: z.array(fiche),
    quiz: z.array(question).default([]),
  })
  .superRefine((s, ctx) => {
    const prefixe = `${s.cours}-s${String(s.semaine).padStart(2, '0')}-`
    s.fiches.forEach((f, i) => {
      if (!f.id.startsWith(prefixe))
        ctx.addIssue({ code: 'custom', path: ['fiches', i, 'id'], message: `doit commencer par « ${prefixe} »` })
    })
    s.quiz.forEach((q, i) => {
      if (!q.id.startsWith(prefixe))
        ctx.addIssue({ code: 'custom', path: ['quiz', i, 'id'], message: `doit commencer par « ${prefixe} »` })
      if (q.type === 'qcm' && q.reponse >= q.choix.length)
        ctx.addIssue({ code: 'custom', path: ['quiz', i, 'reponse'], message: 'index hors des choix' })
    })
  })

export const mappingProbastat = z.strictObject({
  semaines: z.array(
    z.strictObject({
      semaine: z.number().int().min(1).max(14),
      screenshot: texte,
      exercices: z.array(
        z.strictObject({
          numero: texte,
          localisation: texte,
          sections_polycop: z.array(texte),
          incertain,
        }),
      ),
      statut: z.enum(['a_valider', 'valide']),
    }),
  ),
})

export type Fiche = z.infer<typeof fiche>
export type Question = z.infer<typeof question>
export type Semaine = z.infer<typeof semaine>
export type MappingProbastat = z.infer<typeof mappingProbastat>
