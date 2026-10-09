// Le contenu est validé et pré-rendu en HTML au build (voir render.ts) :
// les champs Markdown des semaines et des thèmes contiennent déjà du HTML prêt à afficher.
// Les listes n'utilisent qu'un résumé de chaque fichier ; le contenu complet est un fichier
// séparé, chargé à la demande (et mis en cache hors ligne par la PWA).
import { useEffect, useState } from 'react'
import { COURS, type SlugCours } from './cours'
import type { Unite } from './schema'

interface MetaCommune {
  cours: SlugCours
  titre: string
  nbFiches: number
  nbNonVerifiees: number
  nbQuiz: number
}
export interface MetaSemaine extends MetaCommune {
  semaine: number
}
export interface MetaTheme extends MetaCommune {
  theme: string
}

const metas = Object.values(
  import.meta.glob<MetaSemaine>('../../../content/*/semaine-*.yaml', {
    eager: true,
    import: 'default',
    query: '?meta',
  }),
).sort((a, b) => a.semaine - b.semaine)

const metasThemes = Object.values(
  import.meta.glob<MetaTheme>('../../../content/*/theme-*.yaml', {
    eager: true,
    import: 'default',
    query: '?meta',
  }),
)

const chargeurs = {
  ...import.meta.glob<Unite>('../../../content/*/semaine-*.yaml', { import: 'default' }),
  ...import.meta.glob<Unite>('../../../content/*/theme-*.yaml', { import: 'default' }),
}

const cleSemaine = (slug: string, numero: number) =>
  `../../../content/${slug}/semaine-${String(numero).padStart(2, '0')}.yaml`
const cleTheme = (slug: string, theme: string) => `../../../content/${slug}/theme-${theme}.yaml`

export function semainesDuCours(slug: SlugCours): MetaSemaine[] {
  return metas.filter((s) => s.cours === slug)
}

export function themesDuCours(slug: SlugCours): MetaTheme[] {
  return metasThemes.filter((t) => t.cours === slug)
}

export function trouverCours(slug: string) {
  return COURS.find((c) => c.slug === slug)
}

const cache = new Map<string, Unite>()

export type EtatUnite =
  | { etat: 'chargement' }
  | { etat: 'absente' }
  | { etat: 'erreur' }
  | { etat: 'ok'; unite: Unite }

export const useSemaine = (slug: string, numero: number) => useUnite(cleSemaine(slug, numero))
export const useTheme = (slug: string, theme: string) => useUnite(cleTheme(slug, theme))

function useUnite(cle: string): EtatUnite {
  const [etat, setEtat] = useState<{ cle: string; valeur: EtatUnite } | null>(null)

  useEffect(() => {
    const charger = chargeurs[cle]
    if (!charger || cache.has(cle)) return
    let annule = false
    charger()
      .then((s) => {
        cache.set(cle, s)
        if (!annule) setEtat({ cle, valeur: { etat: 'ok', unite: s } })
      })
      .catch(() => {
        if (!annule) setEtat({ cle, valeur: { etat: 'erreur' } })
      })
    return () => {
      annule = true
    }
  }, [cle])

  const enCache = cache.get(cle)
  if (enCache) return { etat: 'ok', unite: enCache }
  if (!chargeurs[cle]) return { etat: 'absente' }
  return etat?.cle === cle ? etat.valeur : { etat: 'chargement' }
}
