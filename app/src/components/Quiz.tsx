import { useState } from 'react'
import type { Question } from '../content/schema'
import { ecrire, lire } from '../storage'
import { Html } from './Html'
import { bonneReponse, estCorrecte } from './correction'

interface Score {
  bonnes: number
  total: number
  date: string
}

function QuestionCarte({ q, onRepondue }: { q: Question; onRepondue: (correcte: boolean) => void }) {
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

  const classeChoix = (valeur: number | boolean) => {
    if (!repondue) return 'choix'
    if (valeur === q.reponse) return 'choix choix-correct'
    if (valeur === choix) return 'choix choix-faux'
    return 'choix choix-inactif'
  }

  const nomFichier = q.source.fichier.split('/').pop()

  return (
    <article className="fiche question">
      <div className="fiche-meta">
        {!q.verifie && <span className="badge-non-verifie">non vérifié</span>}
      </div>
      {q.incertain && (
        <div className="avertissement" role="note">
          <strong>⚠ Contenu incertain.</strong> <Html html={q.incertain} inline />
        </div>
      )}
      {q.titre && (
        <h3 className="question-titre">
          <Html html={q.titre} inline />
          {q.niveau && <span className="question-niveau"> {'★'.repeat(q.niveau)}</span>}
        </h3>
      )}
      <Html html={q.enonce} />

      {q.type === 'qcm' && (
        <div className="liste-choix">
          {q.choix.map((c, i) => (
            <button
              key={i}
              type="button"
              className={classeChoix(i)}
              disabled={repondue}
              onClick={() => {
                setChoix(i)
                valider(i)
              }}
            >
              <Html html={c} inline />
            </button>
          ))}
        </div>
      )}

      {q.type === 'vrai_faux' && (
        <div className="liste-choix liste-choix-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              className={classeChoix(v)}
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
          <strong>{correcte ? '✓ Correct' : '✗ Incorrect'}</strong>
          {!correcte && (
            <>
              {' '}
              — réponse attendue : <Html html={bonneReponse(q)} inline />
            </>
          )}
        </div>
      )}

      {repondue && (
        <section className="fiche-section">
          <h4>Explication</h4>
          <Html html={q.explication} />
        </section>
      )}

      <footer className="fiche-source" title={q.source.fichier}>
        Source : {nomFichier}, {q.source.emplacement}
      </footer>
    </article>
  )
}

export function Quiz({ questions, cleScore }: { questions: Question[]; cleScore: string }) {
  const [serie, setSerie] = useState<Question[]>(questions)
  const [index, setIndex] = useState(0)
  const [tour, setTour] = useState(0)
  const [resultats, setResultats] = useState<Record<string, boolean>>({})
  const [dernier, setDernier] = useState<Score | null>(() => lire<Score | null>(cleScore, null))

  if (questions.length === 0) return <p className="vide">Pas encore de quiz.</p>

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
  }

  if (termine) {
    return (
      <div className="fiche fin-quiz">
        <h3>
          Score : {bonnes} / {serie.length}
        </h3>
        <div className="actions">
          {ratees.length > 0 && (
            <button type="button" className="bouton" onClick={() => recommencer(ratees)}>
              Refaire les {ratees.length} ratée{ratees.length > 1 ? 's' : ''}
            </button>
          )}
          <button type="button" className="bouton bouton-secondaire" onClick={() => recommencer(questions)}>
            Recommencer tout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="progression">
        <span>
          Question {index + 1} / {serie.length}
          {serie.length < questions.length && ' (ratées)'}
        </span>
        {dernier && index === 0 && !repondue && (
          <span className="dernier-score">
            Dernier score : {dernier.bonnes} / {dernier.total}
          </span>
        )}
      </div>
      <QuestionCarte
        key={`${tour}-${q.id}`}
        q={q}
        onRepondue={(ok) => {
          const nouveaux = { ...resultats, [q.id]: ok }
          setResultats(nouveaux)
          // Le score n'est enregistré que pour une série complète.
          if (index === serie.length - 1 && serie.length === questions.length) {
            const score = {
              bonnes: Object.values(nouveaux).filter(Boolean).length,
              total: serie.length,
              date: new Date().toISOString(),
            }
            ecrire(cleScore, score)
            setDernier(score)
          }
        }}
      />
      {repondue && (
        <button type="button" className="bouton bouton-suivant" onClick={() => setIndex(index + 1)}>
          {index === serie.length - 1 ? 'Voir le score' : 'Question suivante →'}
        </button>
      )}
    </div>
  )
}
