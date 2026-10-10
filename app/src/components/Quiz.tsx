import { useMemo, useState, type ReactNode } from 'react'
import type { Question } from '../content/schema'
import { ecrire, lire } from '../storage'
import { BarreHaute } from './Entete'
import { Html } from './Html'
import { Coins } from './Plan'
import { bonneReponse, estCorrecte } from './correction'
import { TYPE_QUESTION, deuxChiffres, texteBrut } from './libelles'

interface Score {
  bonnes: number
  total: number
  date: string
}

const LETTRES = 'ABCDEFGH'

function QuestionCarte({
  q,
  position,
  total,
  onRepondue,
}: {
  q: Question
  position: number
  total: number
  onRepondue: (correcte: boolean) => void
}) {
  const [choix, setChoix] = useState<number | boolean | null>(null)
  const [saisie, setSaisie] = useState('')
  const [correcte, setCorrecte] = useState<boolean | null>(null)
  const repondue = correcte !== null

  const valider = (valeur: string | number | boolean) => {
    if (repondue) return
    const ok = estCorrecte(q, valeur)
    setCorrecte(ok)
    onRepondue(ok)
  }

  const etatChoix = (valeur: number | boolean) => {
    if (!repondue) return ''
    if (valeur === q.reponse) return ' choix-correct'
    if (valeur === choix) return ' choix-faux'
    return ' choix-inactif'
  }

  // Pour un QCM, la bonne réponse est désignée par sa lettre.
  const attendue = q.type === 'qcm' ? LETTRES[q.reponse] : bonneReponse(q)

  return (
    <>
      <div className="quiz-meta">
        <span className="kicker">
          {TYPE_QUESTION[q.type]}
          {q.niveau && <span className="niveau"> {'★'.repeat(q.niveau)}</span>}
        </span>
        <span className="kicker kicker-doux">
          {position} / {total}
        </span>
      </div>

      <div className="carte-question plan">
        <Coins />
        {q.titre && (
          <div className="question-titre">
            <Html html={q.titre} inline />
          </div>
        )}
        <div className="enonce">
          <Html html={q.enonce} />
        </div>
        {!q.verifie && <span className="tag-non-verifie">non vérifié</span>}
      </div>

      {q.type === 'qcm' && (
        <div className="liste-choix">
          {q.choix.map((c, i) => (
            <button
              key={i}
              type="button"
              className={`choix${etatChoix(i)}`}
              disabled={repondue}
              onClick={() => {
                setChoix(i)
                valider(i)
              }}
            >
              <span className="choix-lettre">{LETTRES[i]}</span>
              <Html html={c} inline />
            </button>
          ))}
        </div>
      )}

      {q.type === 'vrai_faux' && (
        <div className="liste-vf">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              className={`choix choix-vf${etatChoix(v)}`}
              disabled={repondue}
              onClick={() => {
                setChoix(v)
                valider(v)
              }}
            >
              {v ? 'Vrai' : 'Faux'}
            </button>
          ))}
        </div>
      )}

      {(q.type === 'numerique' || q.type === 'trace') && (
        <form
          className="saisie"
          onSubmit={(e) => {
            e.preventDefault()
            if (saisie.trim()) valider(saisie)
          }}
        >
          <input
            type="text"
            className={repondue ? (correcte ? 'saisie-correcte' : 'saisie-fausse') : undefined}
            inputMode={q.type === 'numerique' ? 'decimal' : 'text'}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={q.type === 'trace' ? 'ex. 42 ou 0x2A' : 'Votre réponse'}
            value={saisie}
            disabled={repondue}
            onChange={(e) => setSaisie(e.target.value)}
            aria-label="Réponse"
          />
          <button type="submit" className="bouton" disabled={repondue || !saisie.trim()}>
            Valider
          </button>
        </form>
      )}

      {repondue && (
        <div className={`verdict ${correcte ? 'verdict-ok' : 'verdict-faux'}`} role="status">
          <div className="verdict-titre">
            {correcte ? (
              'Correct'
            ) : (
              <>
                Incorrect · réponse : <Html html={attendue} inline />
              </>
            )}
          </div>
          <div className="verdict-explication">
            <Html html={q.explication} />
          </div>
          {q.incertain && (
            <p className="verdict-incertain">
              ⚠ <Html html={q.incertain} inline />
            </p>
          )}
          <p className="source">
            Source : {q.source.fichier}, {q.source.emplacement}
          </p>
        </div>
      )}
    </>
  )
}

// Écran de résultat, partagé avec les cartes mémo.
export function Resultat({
  kicker,
  bonnes,
  total,
  ligne,
  lignes,
  children,
}: {
  kicker: string
  bonnes: number
  total: number
  ligne: string
  lignes: { titre: string; ok: boolean }[]
  children: ReactNode
}) {
  return (
    <div className="resultat">
      <div className="kicker">{kicker}</div>
      <div className="plaque-score plan">
        <Coins />
        <div className="score">
          <span className="score-valeur">{bonnes}</span>
          <span className="score-total">/ {total}</span>
        </div>
        <div className="score-ligne">{ligne}</div>
        <div className="bande-score" style={{ gridTemplateColumns: `repeat(${lignes.length}, 1fr)` }}>
          {lignes.map((l, i) => (
            <span key={i} className={l.ok ? 'ok' : 'ko'} />
          ))}
        </div>
      </div>
      <ol className="liste-resultat">
        {lignes.map((l, i) => (
          <li key={i}>
            <span className="liste-numero-doux">{deuxChiffres(i + 1)}</span>
            <span className="resultat-titre">{l.titre}</span>
            <span className={l.ok ? 'marque-ok' : 'marque-ko'}>{l.ok ? '✓' : '✗'}</span>
          </li>
        ))}
      </ol>
      <div className="actions">{children}</div>
    </div>
  )
}

interface PropsQuiz {
  questions: Question[]
  cleScore: string
  kickerFin: string
  retour: string
}

export function Quiz({ questions, cleScore, kickerFin, retour }: PropsQuiz) {
  const [serie, setSerie] = useState<Question[]>(questions)
  const [index, setIndex] = useState(0)
  const [tour, setTour] = useState(0)
  const [resultats, setResultats] = useState<Record<string, boolean>>({})
  const apercus = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, q.titre ? texteBrut(q.titre) : texteBrut(q.enonce)])),
    [questions],
  )

  const termine = index >= serie.length
  const q = serie[index]
  const repondue = q !== undefined && q.id in resultats
  const ratees = serie.filter((x) => resultats[x.id] === false)
  const bonnes = serie.filter((x) => resultats[x.id] === true).length

  const recommencer = (nouvelle: Question[]) => {
    setSerie(nouvelle)
    setIndex(0)
    setResultats({})
    setTour(tour + 1)
    window.scrollTo(0, 0)
  }

  const suivante = () => {
    setIndex(index + 1)
    window.scrollTo(0, 0)
  }

  if (termine) {
    return (
      <>
        <BarreHaute href={retour} texte="Retour" />
        <Resultat
          kicker={kickerFin}
          bonnes={bonnes}
          total={serie.length}
          ligne={bonnes > 1 ? 'bonnes réponses' : 'bonne réponse'}
          lignes={serie.map((x) => ({ titre: apercus[x.id], ok: resultats[x.id] === true }))}
        >
          {ratees.length > 0 && (
            <button type="button" className="bouton bouton-large actions-pleine" onClick={() => recommencer(ratees)}>
              Refaire les {ratees.length} ratée{ratees.length > 1 ? 's' : ''}
            </button>
          )}
          <a className="bouton bouton-secondaire bouton-large" href={retour}>
            Retour
          </a>
          <button type="button" className="bouton bouton-large" onClick={() => recommencer(questions)}>
            Recommencer
          </button>
        </Resultat>
      </>
    )
  }

  return (
    <>
      <BarreHaute href={retour} texte="Quitter" />
      <div className="progression">
        <div style={{ width: `${(index / serie.length) * 100}%` }} />
      </div>
      {serie.length < questions.length && <p className="note-ratees">Questions ratées seulement</p>}
      <QuestionCarte
        key={`${tour}-${q.id}`}
        q={q}
        position={index + 1}
        total={serie.length}
        onRepondue={(ok) => {
          const nouveaux = { ...resultats, [q.id]: ok }
          setResultats(nouveaux)
          // Le score n'est enregistré que pour une série complète.
          if (index === serie.length - 1 && serie.length === questions.length) {
            const score: Score = {
              bonnes: Object.values(nouveaux).filter(Boolean).length,
              total: serie.length,
              date: new Date().toISOString(),
            }
            ecrire(cleScore, score)
          }
        }}
      />
      {repondue && (
        <button type="button" className="bouton bouton-large bouton-suivant" onClick={suivante}>
          {index === serie.length - 1 ? 'Voir le résultat' : 'Question suivante'}
        </button>
      )}
    </>
  )
}

export function dernierScore(cleScore: string): Score | null {
  return lire<Score | null>(cleScore, null)
}
