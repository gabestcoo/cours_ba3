// Affichage commun d'une semaine ou d'un thème : en-tête, onglets Fiches / Quiz, contenu.
import type { EtatUnite } from '../content/load'
import type { Onglet } from '../router'
import { FicheCard } from './FicheCard'
import { Html } from './Html'
import { Quiz } from './Quiz'

interface Props {
  retour: { href: string; texte: string }
  surtitre: string
  titre: string
  nbFiches: number
  nbQuiz: number
  onglet: Onglet
  liens: Record<Onglet, string>
  contenu: EtatUnite
  cleScore: string
}

export function VueUnite({ retour, surtitre, titre, nbFiches, nbQuiz, onglet, liens, contenu, cleScore }: Props) {
  return (
    <>
      <a className="retour" href={retour.href}>
        ← {retour.texte}
      </a>
      <p className="sous-titre-page">{surtitre}</p>
      <h1 className="titre-page">
        <Html html={titre} inline />
      </h1>

      <nav className="onglets" aria-label="Sections">
        <a href={liens.fiches} aria-current={onglet === 'fiches' ? 'page' : undefined}>
          Fiches ({nbFiches})
        </a>
        <a href={liens.quiz} aria-current={onglet === 'quiz' ? 'page' : undefined}>
          Quiz ({nbQuiz})
        </a>
      </nav>

      {contenu.etat === 'chargement' && <p className="vide">Chargement…</p>}
      {contenu.etat === 'erreur' && <p className="vide">Impossible de charger ce contenu.</p>}
      {contenu.etat === 'ok' &&
        (onglet === 'fiches' ? (
          <div className="liste-fiches">
            {contenu.unite.fiches.map((f) => (
              <FicheCard key={f.id} fiche={f} />
            ))}
          </div>
        ) : (
          <Quiz key={cleScore} questions={contenu.unite.quiz} cleScore={cleScore} />
        ))}
    </>
  )
}
