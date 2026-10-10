import { semainesDuCours, trouverCours, useSemaine } from '../content/load'
import { VueUnite } from '../components/VueUnite'
import { lien, type Vue } from '../router'
import { Introuvable } from './Introuvable'

interface Props {
  slug: string
  numero: number
  vue: Vue
}

export function SemainePage({ slug, numero, vue }: Props) {
  const cours = trouverCours(slug)
  const meta = cours && semainesDuCours(cours.slug).find((s) => s.semaine === numero)
  const contenu = useSemaine(slug, numero)
  if (!cours || !meta || contenu.etat === 'absente') return <Introuvable />

  return (
    <VueUnite
      retour={{ href: lien({ page: 'cours', cours: cours.slug }), texte: cours.nom }}
      kicker={`${cours.code} · Semaine ${numero}`}
      court={`Semaine ${numero}`}
      titre={meta.titre}
      nbFiches={meta.nbFiches}
      nbQuiz={meta.nbQuiz}
      vue={vue}
      aller={(v) => lien({ page: 'semaine', cours: cours.slug, semaine: numero, vue: v })}
      contenu={contenu}
      cleScore={`score:${cours.slug}:${numero}`}
      cleMemo={`memo:${cours.slug}:${numero}`}
    />
  )
}
