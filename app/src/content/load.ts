// Le contenu est validé et pré-rendu en HTML au build (voir render.ts) :
// les champs Markdown des semaines contiennent déjà du HTML prêt à afficher.
// Les listes n'utilisent qu'un résumé de chaque semaine ; le contenu complet d'une semaine
// est un fichier séparé, chargé à la demande (et mis en cache hors ligne par la PWA).
import { useEffect, useState } from 'react'
import { COURS, type SlugCours } from './cours'
import type { Semaine } from './schema'

export interface MetaSemaine {
  cours: SlugCours
  semaine: number
  titre: string
  nbFiches: number
  nbNonVerifiees: number
  nbQuiz: number
}

const metas = Object.values(
  import.meta.glob<MetaSemaine>('../../../content/*/semaine-*.yaml', {
    eager: true,
    import: 'default',
    query: '?meta',
  }),
).sort((a, b) => a.semaine - b.semaine)

const chargeurs = import.meta.glob<Semaine>('../../../content/*/semaine-*.yaml', { import: 'default' })

const cleFichier = (slug: string, numero: number) =>
  `../../../content/${slug}/semaine-${String(numero).padStart(2, '0')}.yaml`

export function semainesDuCours(slug: SlugCours): MetaSemaine[] {
  return metas.filter((s) => s.cours === slug)
}

export function trouverCours(slug: string) {
  return COURS.find((c) => c.slug === slug)
}

const cache = new Map<string, Semaine>()

export type EtatSemaine =
  | { etat: 'chargement' }
  | { etat: 'absente' }
  | { etat: 'erreur' }
  | { etat: 'ok'; semaine: Semaine }

export function useSemaine(slug: string, numero: number): EtatSemaine {
  const cle = cleFichier(slug, numero)
  const [etat, setEtat] = useState<{ cle: string; valeur: EtatSemaine } | null>(null)

  useEffect(() => {
    const charger = chargeurs[cle]
    if (!charger || cache.has(cle)) return
    let annule = false
    charger()
      .then((s) => {
        cache.set(cle, s)
        if (!annule) setEtat({ cle, valeur: { etat: 'ok', semaine: s } })
      })
      .catch(() => {
        if (!annule) setEtat({ cle, valeur: { etat: 'erreur' } })
      })
    return () => {
      annule = true
    }
  }, [cle])

  const enCache = cache.get(cle)
  if (enCache) return { etat: 'ok', semaine: enCache }
  if (!chargeurs[cle]) return { etat: 'absente' }
  return etat?.cle === cle ? etat.valeur : { etat: 'chargement' }
}
