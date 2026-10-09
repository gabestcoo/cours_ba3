import { COURS } from '../content/cours'
import { semainesDuCours } from '../content/load'
import { lien } from '../router'

export function Accueil() {
  return (
    <>
      <h1 className="titre-page">Révision BA3</h1>
      <ul className="liste-liens">
        {COURS.map((c) => {
          const n = semainesDuCours(c.slug).length
          return (
            <li key={c.slug}>
              <a className="ligne-lien" href={lien({ page: 'cours', cours: c.slug })}>
                <span>
                  <span className="ligne-titre">{c.nom}</span>
                  <span className="ligne-sous-titre">{c.code}</span>
                </span>
                <span className="ligne-compte">{n === 0 ? 'vide' : `${n} sem.`}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </>
  )
}
