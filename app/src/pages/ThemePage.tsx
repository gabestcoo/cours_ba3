import { themesDuCours, trouverCours, useTheme } from '../content/load'
import { VueUnite } from '../components/VueUnite'
import { lien, type Vue } from '../router'
import { Introuvable } from './Introuvable'

interface Props {
  slug: string
  theme: string
  vue: Vue
}

export function ThemePage({ slug, theme, vue }: Props) {
  const cours = trouverCours(slug)
  const meta = cours && themesDuCours(cours.slug).find((t) => t.theme === theme)
  const contenu = useTheme(slug, theme)
  if (!cours || !meta || contenu.etat === 'absente') return <Introuvable />

  return (
    <VueUnite
      retour={{ href: lien({ page: 'cours', cours: cours.slug }), texte: cours.nom }}
      kicker={`${cours.code} · Entraînement`}
      court="Entraînement"
      titre={meta.titre}
      nbFiches={meta.nbFiches}
      nbQuiz={meta.nbQuiz}
      vue={vue}
      aller={(v) => lien({ page: 'theme', cours: cours.slug, theme, vue: v })}
      contenu={contenu}
      cleScore={`score:${cours.slug}:theme:${theme}`}
      cleMemo={`memo:${cours.slug}:theme:${theme}`}
    />
  )
}
