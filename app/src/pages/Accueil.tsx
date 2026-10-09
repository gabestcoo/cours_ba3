import { COURS } from '../content/cours'
import { semainesDuCours, themesDuCours } from '../content/load'
import { BoutonTheme } from '../components/Entete'
import { Coins } from '../components/Plan'
import { lien } from '../router'

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export function Accueil() {
  return (
    <>
      <header className="entete-accueil">
        <div>
          <div className="kicker kicker-doux">BA3 · EPFL</div>
          <h1 className="titre-accueil">Révision</h1>
        </div>
        <BoutonTheme avecFilet />
      </header>

      <div className="kicker kicker-doux libelle-section">Branches</div>
      <ul className="grille-branches">
        {COURS.map((c) => {
          const semaines = semainesDuCours(c.slug)
          const unites = [...semaines, ...themesDuCours(c.slug)]
          const nbFiches = unites.reduce((n, u) => n + u.nbFiches, 0)
          const nbQuiz = unites.reduce((n, u) => n + u.nbQuiz, 0)
          const vide = semaines.length === 0
          return (
            <li key={c.slug}>
              <a className={`branche plan cliquable${vide ? ' branche-vide' : ''}`} href={lien({ page: 'cours', cours: c.slug })}>
                <Coins />
                <span className="kicker branche-code">{c.code}</span>
                <span className="branche-nom">{c.nom}</span>
                <span className="branche-resume">
                  {vide
                    ? 'Pas encore de contenu'
                    : [pluriel(semaines.length, 'semaine'), pluriel(nbFiches, 'résumé'), nbQuiz > 0 && `${nbQuiz} quiz`]
                        .filter(Boolean)
                        .join(' · ')}
                </span>
                {nbQuiz > 0 && <span className="tag tag-accent branche-tag">Quiz</span>}
              </a>
            </li>
          )
        })}
      </ul>
    </>
  )
}
