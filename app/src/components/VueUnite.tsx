// Affichage commun d'une semaine ou d'un thème : onglets Résumés / Quiz, lecteur de fiches,
// quiz en cours et cartes mémo, selon la vue demandée par l'URL.
import type { EtatUnite } from '../content/load'
import type { Unite } from '../content/schema'
import type { Vue } from '../router'
import { CartesMemo } from './CartesMemo'
import { BarreHaute } from './Entete'
import { Html } from './Html'
import { Icone } from './Icone'
import { LecteurFiches } from './LecteurFiches'
import { Coins } from './Plan'
import { Quiz, dernierScore } from './Quiz'
import { Importance, TYPE_FICHE, TYPE_QUESTION, deuxChiffres, pluriel } from './libelles'

interface Props {
  retour: { href: string; texte: string }
  kicker: string // « CS-200 · Semaine 1 »
  court: string // « Semaine 1 », pour les retours depuis le lecteur, le quiz et les cartes
  titre: string
  nbFiches: number
  nbQuiz: number
  vue: Vue
  aller: (vue: Vue) => string
  contenu: EtatUnite
  cleScore: string
  cleMemo: string
}

function ListeFiches({ unite, aller }: { unite: Unite; aller: Props['aller'] }) {
  return (
    <ol className="liste-fiches">
      {unite.fiches.map((f, i) => (
        <li key={f.id}>
          <a className="ligne-fiche cliquable" href={aller({ type: 'lecteur', fiche: i })}>
            <span className="liste-numero-doux">{deuxChiffres(i + 1)}</span>
            <span className="ligne-corps">
              <span className="ligne-fiche-meta">
                {TYPE_FICHE[f.type]}
                <Importance niveau={f.importance} />
                {f.incertain && <span className="meta-incertain">⚠ incertain</span>}
              </span>
              <span className="ligne-titre">
                <Html html={f.titre} inline />
              </span>
            </span>
            <Icone nom="chevron-droite" taille={14} className="ligne-chevron" />
          </a>
        </li>
      ))}
    </ol>
  )
}

function OngletQuiz({ unite, aller, cleScore }: { unite: Unite; aller: Props['aller']; cleScore: string }) {
  const n = unite.quiz.length
  // Types présents, sans distinguer « trace » de la réponse libre.
  const presents = new Set(unite.quiz.map((q) => (q.type === 'trace' ? 'numerique' : q.type)))
  const types = (['qcm', 'vrai_faux', 'numerique'] as const).filter((t) => presents.has(t)).map((t) => TYPE_QUESTION[t])
  const score = dernierScore(cleScore)
  return (
    <div className="cartes-quiz">
      {n > 0 ? (
        <a className="carte-action plan cliquable" href={aller({ type: 'jeu' })}>
          <Coins />
          <span className="kicker">Quiz</span>
          <span className="carte-action-titre">{pluriel(n, 'question')}</span>
          <span className="carte-action-texte">{types.join(' · ')}</span>
          {score && (
            <span className="carte-action-texte">
              Dernier score : {score.bonnes} / {score.total}
            </span>
          )}
          <span className="bouton carte-action-bouton">Commencer</span>
        </a>
      ) : (
        <div className="bloc-vide">Pas encore de quiz pour cette semaine.</div>
      )}
      {unite.fiches.length > 0 && (
        <a className="carte-action cliquable" href={aller({ type: 'memo' })}>
          <span className="kicker">Cartes mémo</span>
          <span className="carte-action-titre">{pluriel(unite.fiches.length, 'carte')}</span>
          <span className="carte-action-texte">Titre au recto, contenu de la fiche au verso.</span>
        </a>
      )}
    </div>
  )
}

export function VueUnite(props: Props) {
  const { retour, kicker, court, titre, nbFiches, nbQuiz, vue, aller, contenu, cleScore, cleMemo } = props
  const unite = contenu.etat === 'ok' ? contenu.unite : null
  const retourUnite = (onglet: 'fiches' | 'quiz') => ({ href: aller({ type: onglet }), texte: court })

  if (unite && vue.type === 'lecteur' && unite.fiches.length > 0) {
    return (
      <LecteurFiches
        fiches={unite.fiches}
        depart={vue.fiche}
        retour={retourUnite('fiches')}
        lienFiche={(i) => aller({ type: 'lecteur', fiche: i })}
        fin={
          unite.quiz.length > 0
            ? { href: aller({ type: 'jeu' }), texte: 'Passer au quiz →' }
            : { href: aller({ type: 'memo' }), texte: 'Cartes mémo →' }
        }
      />
    )
  }
  if (unite && vue.type === 'jeu' && unite.quiz.length > 0) {
    return (
      <Quiz
        questions={unite.quiz}
        cleScore={cleScore}
        kickerFin={`Quiz terminé · ${kicker}`}
        retour={aller({ type: 'quiz' })}
      />
    )
  }
  if (unite && vue.type === 'memo' && unite.fiches.length > 0) {
    return (
      <CartesMemo
        fiches={unite.fiches}
        cleMemo={cleMemo}
        kickerFin={`Cartes mémo · ${kicker}`}
        retour={aller({ type: 'quiz' })}
      />
    )
  }

  const onglet = vue.type === 'quiz' || vue.type === 'jeu' || vue.type === 'memo' ? 'quiz' : 'fiches'

  return (
    <>
      <BarreHaute href={retour.href} texte={retour.texte} />
      <header className="entete-page">
        <div className="kicker">{kicker}</div>
        <h1 className="titre-fiche">
          <Html html={titre} inline />
        </h1>
      </header>

      <nav className="onglets" aria-label="Sections">
        <a href={aller({ type: 'fiches' })} aria-current={onglet === 'fiches' ? 'page' : undefined}>
          Résumés · {nbFiches}
        </a>
        <a href={aller({ type: 'quiz' })} aria-current={onglet === 'quiz' ? 'page' : undefined}>
          Quiz · {nbQuiz}
        </a>
      </nav>

      {contenu.etat === 'chargement' && <p className="vide">Chargement…</p>}
      {contenu.etat === 'erreur' && <p className="vide">Impossible de charger ce contenu.</p>}
      {unite &&
        (onglet === 'fiches' ? (
          <ListeFiches unite={unite} aller={aller} />
        ) : (
          <OngletQuiz unite={unite} aller={aller} cleScore={cleScore} />
        ))}
    </>
  )
}
