import { semainesDuCours, trouverCours } from '../content/load'
import { Html } from '../components/Html'
import { lien } from '../router'
import { Introuvable } from './Introuvable'

export function CoursPage({ slug }: { slug: string }) {
  const cours = trouverCours(slug)
  if (!cours) return <Introuvable />
  const semaines = semainesDuCours(cours.slug)

  return (
    <>
      <a className="retour" href={lien({ page: 'accueil' })}>
        ← Cours
      </a>
      <h1 className="titre-page">{cours.nom}</h1>
      <p className="sous-titre-page">{cours.code}</p>
      {semaines.length === 0 ? (
        <p className="vide">Pas encore de contenu pour ce cours.</p>
      ) : (
        <ul className="liste-liens">
          {semaines.map((s) => {
            const nonVerifiees = s.nbNonVerifiees
            return (
              <li key={s.semaine}>
                <a className="ligne-lien" href={lien({ page: 'semaine', cours: cours.slug, semaine: s.semaine, onglet: 'fiches' })}>
                  <span>
                    <span className="ligne-sous-titre">Semaine {s.semaine}</span>
                    <span className="ligne-titre">
                      <Html html={s.titre} inline />
                    </span>
                  </span>
                  <span className="ligne-compte">
                    {s.nbFiches} fiches
                    {nonVerifiees > 0 && <span className="ligne-detail">{nonVerifiees} à vérifier</span>}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
