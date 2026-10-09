import { semainesDuCours, trouverCours, useSemaine } from '../content/load'
import { FicheCard } from '../components/FicheCard'
import { Html } from '../components/Html'
import { lien } from '../router'
import { Introuvable } from './Introuvable'

interface Props {
  slug: string
  numero: number
  onglet: 'fiches' | 'quiz'
}

export function SemainePage({ slug, numero, onglet }: Props) {
  const cours = trouverCours(slug)
  const meta = cours && semainesDuCours(cours.slug).find((s) => s.semaine === numero)
  const contenu = useSemaine(slug, numero)
  if (!cours || !meta || contenu.etat === 'absente') return <Introuvable />

  const route = { page: 'semaine', cours: cours.slug, semaine: numero } as const

  return (
    <>
      <a className="retour" href={lien({ page: 'cours', cours: cours.slug })}>
        ← {cours.nom}
      </a>
      <p className="sous-titre-page">Semaine {numero}</p>
      <h1 className="titre-page">
        <Html html={meta.titre} inline />
      </h1>

      <nav className="onglets" aria-label="Sections de la semaine">
        <a href={lien({ ...route, onglet: 'fiches' })} aria-current={onglet === 'fiches' ? 'page' : undefined}>
          Fiches ({meta.nbFiches})
        </a>
        <a href={lien({ ...route, onglet: 'quiz' })} aria-current={onglet === 'quiz' ? 'page' : undefined}>
          Quiz ({meta.nbQuiz})
        </a>
      </nav>

      {contenu.etat === 'chargement' && <p className="vide">Chargement…</p>}
      {contenu.etat === 'erreur' && <p className="vide">Impossible de charger cette semaine.</p>}
      {contenu.etat === 'ok' &&
        (onglet === 'fiches' ? (
          <div className="liste-fiches">
            {contenu.semaine.fiches.map((f) => (
              <FicheCard key={f.id} fiche={f} />
            ))}
          </div>
        ) : (
          <p className="vide">Pas encore de quiz pour cette semaine.</p>
        ))}
    </>
  )
}
