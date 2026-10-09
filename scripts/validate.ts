// Vérifie que tous les fichiers de content/ respectent le schéma.
// Lecture seule : ce script ne modifie jamais rien.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument } from 'yaml'
import type { z } from 'zod'
import { COURS, mappingProbastat, semaine } from '../app/src/content/schema.ts'

const racine = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dossierContenu = join(racine, 'content')
const dossiersInterdits = ['app', 'content', 'scripts', 'node_modules', 'dist']

const erreurs: string[] = []
const idsVus = new Map<string, string>()
let nbFichiers = 0

const erreur = (fichier: string, chemin: string, message: string) =>
  erreurs.push(`${fichier}${chemin ? ` → ${chemin}` : ''} : ${message}`)

const formatChemin = (path: PropertyKey[]) =>
  path.map((p) => (typeof p === 'number' ? `[${p}]` : `.${String(p)}`)).join('').replace(/^\./, '')

function signalerZod(fichier: string, e: z.ZodError) {
  for (const issue of e.issues) erreur(fichier, formatChemin(issue.path), issue.message)
}

// Un fichier source doit exister, être dans le dossier du cours et ne pas faire partie de l'app.
function verifierSource(fichier: string, chemin: string, cheminSource: string, dossierCours?: string) {
  const absolu = resolve(racine, cheminSource)
  const rel = relative(racine, absolu)
  if (rel.startsWith('..') || dossiersInterdits.includes(rel.split(sep)[0])) {
    erreur(fichier, chemin, `« ${cheminSource} » n'est pas un fichier source du dépôt`)
  } else if (dossierCours && rel.split(sep)[0] !== dossierCours) {
    erreur(fichier, chemin, `« ${cheminSource} » n'est pas dans le dossier du cours (${dossierCours}/)`)
  } else if (!existsSync(absolu)) {
    erreur(fichier, chemin, `fichier introuvable : « ${cheminSource} »`)
  }
}

function enregistrerId(fichier: string, chemin: string, id: string) {
  const deja = idsVus.get(id)
  if (deja) erreur(fichier, chemin, `id « ${id} » déjà utilisé dans ${deja}`)
  else idsVus.set(id, fichier)
}

function lireYaml(fichier: string): unknown {
  const doc = parseDocument(readFileSync(join(racine, fichier), 'utf8'))
  for (const e of doc.errors) erreur(fichier, '', `YAML invalide : ${e.message}`)
  return doc.errors.length ? undefined : doc.toJS()
}

function validerSemaine(fichier: string, slug: string, numero: number) {
  const donnees = lireYaml(fichier)
  if (donnees === undefined) return
  const r = semaine.safeParse(donnees)
  if (!r.success) return signalerZod(fichier, r.error)

  const s = r.data
  if (s.cours !== slug) erreur(fichier, 'cours', `vaut « ${s.cours} » mais le fichier est dans content/${slug}/`)
  if (s.semaine !== numero) erreur(fichier, 'semaine', `vaut ${s.semaine} mais le fichier s'appelle semaine-${String(numero).padStart(2, '0')}.yaml`)

  const dossierCours = COURS.find((c) => c.slug === slug)?.dossier
  s.fiches.forEach((f, i) => {
    enregistrerId(fichier, `fiches[${i}].id`, f.id)
    verifierSource(fichier, `fiches[${i}].source.fichier`, f.source.fichier, dossierCours)
  })
  s.quiz.forEach((q, i) => {
    enregistrerId(fichier, `quiz[${i}].id`, q.id)
    verifierSource(fichier, `quiz[${i}].source.fichier`, q.source.fichier, dossierCours)
  })
}

function validerMapping(fichier: string) {
  const donnees = lireYaml(fichier)
  if (donnees === undefined) return
  const r = mappingProbastat.safeParse(donnees)
  if (!r.success) return signalerZod(fichier, r.error)
  r.data.semaines.forEach((s, i) => verifierSource(fichier, `semaines[${i}].screenshot`, s.screenshot, 'proba_stat'))
}

const slugs = new Set<string>(COURS.map((c) => c.slug))

for (const entree of readdirSync(dossierContenu, { recursive: true, withFileTypes: true })) {
  if (!entree.isFile()) continue
  const fichier = relative(racine, join(entree.parentPath, entree.name)).split(sep).join('/')
  const m = fichier.match(/^content\/([^/]+)\/(.+)$/)
  const slug = m?.[1] ?? ''
  const nom = m?.[2] ?? ''
  const semaineMatch = nom.match(/^semaine-(\d{2})\.yaml$/)

  if (!slugs.has(slug)) {
    erreur(fichier, '', `dossier de cours inconnu (attendu : ${[...slugs].join(', ')})`)
  } else if (semaineMatch) {
    nbFichiers++
    validerSemaine(fichier, slug, Number(semaineMatch[1]))
  } else if (slug === 'probastat' && nom === 'mapping.yaml') {
    nbFichiers++
    validerMapping(fichier)
  } else {
    erreur(fichier, '', 'fichier inattendu (attendu : semaine-XX.yaml, ou probastat/mapping.yaml)')
  }
}

if (erreurs.length) {
  console.error(`✗ ${erreurs.length} erreur(s) :\n`)
  for (const e of erreurs) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`✓ ${nbFichiers} fichier(s) valide(s), ${idsVus.size} id(s) unique(s).`)
