import { themesDuCours, trouverCours, useTheme } from '../content/load'
import { VueUnite } from '../components/VueUnite'
import { lien, type Onglet } from '../router'
import { Introuvable } from './Introuvable'

interface Props {
  slug: string
  theme: string
  onglet: Onglet
}

export function ThemePage({ slug, theme, onglet }: Props) {
  const cours = trouverCours(slug)
  const meta = cours && themesDuCours(cours.slug).find((t) => t.theme === theme)
  const contenu = useTheme(slug, theme)
  if (!cours || !meta || contenu.etat === 'absente') return <Introuvable />

  const route = { page: 'theme', cours: cours.slug, theme } as const

  return (
    <VueUnite
      retour={{ href: lien({ page: 'cours', cours: cours.slug }), texte: cours.nom }}
      surtitre="Entraînement"
      titre={meta.titre}
      nbFiches={meta.nbFiches}
      nbQuiz={meta.nbQuiz}
      onglet={onglet}
      liens={{ fiches: lien({ ...route, onglet: 'fiches' }), quiz: lien({ ...route, onglet: 'quiz' }) }}
      contenu={contenu}
      cleScore={`score:${cours.slug}:theme:${theme}`}
    />
  )
}
