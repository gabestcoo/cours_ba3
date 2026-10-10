// Cartes mémo générées à partir des fiches (aucun contenu nouveau) :
// recto = titre de la fiche, verso = son contenu principal et ses 3 premiers points clés.
import { useMemo, useState } from 'react'
import type { Fiche } from '../content/schema'
import { ecrire, lire } from '../storage'
import { BarreHaute } from './Entete'
import { Html } from './Html'
import { Coins } from './Plan'
import { Resultat } from './Quiz'
import { TYPE_FICHE, texteBrut } from './libelles'

function Verso({ fiche }: { fiche: Fiche }) {
  switch (fiche.type) {
    case 'theoreme':
      return (
        <>
          <Html html={fiche.hypotheses} />
          <Html html={fiche.corps} />
        </>
      )
    case 'methode':
      return (
        <ol className="verso-liste">
          {fiche.etapes.map((e, i) => (
            <li key={i}>
              <Html html={e} />
            </li>
          ))}
        </ol>
      )
    case 'syntaxe':
      return (
        <>
          <Html html={fiche.syntaxe} />
          <Html html={fiche.usage} />
        </>
      )
    case 'resume':
      return (
        <>
          <Html html={fiche.corps} />
          <ul className="verso-liste">
            {fiche.points_cles.slice(0, 3).map((p, i) => (
              <li key={i}>
                <Html html={p} />
              </li>
            ))}
          </ul>
        </>
      )
    default:
      return <Html html={fiche.corps} />
  }
}

interface Props {
  fiches: Fiche[]
  cleMemo: string
  kickerFin: string
  retour: string
}

export function CartesMemo({ fiches, cleMemo, kickerFin, retour }: Props) {
  const [serie, setSerie] = useState<Fiche[]>(fiches)
  const [index, setIndex] = useState(0)
  const [retournee, setRetournee] = useState(false)
  const [connues, setConnues] = useState<Record<string, boolean>>({})
  const aRevoirAvant = useMemo(() => lire<string[]>(cleMemo, []), [cleMemo])

  const termine = index >= serie.length
  const fiche = serie[index]

  const repondre = (sait: boolean) => {
    const nouvelles = { ...connues, [fiche.id]: sait }
    setConnues(nouvelles)
    setRetournee(false)
    setIndex(index + 1)
    window.scrollTo(0, 0)
    if (index === serie.length - 1) {
      // On retient les cartes « à revoir » de la dernière série.
      ecrire(cleMemo, serie.filter((f) => !nouvelles[f.id]).map((f) => f.id))
    }
  }

  const recommencer = (nouvelle: Fiche[]) => {
    setSerie(nouvelle)
    setIndex(0)
    setConnues({})
    setRetournee(false)
  }

  if (termine) {
    const nbConnues = serie.filter((f) => connues[f.id]).length
    const aRevoir = serie.filter((f) => !connues[f.id])
    return (
      <>
        <BarreHaute href={retour} texte="Retour" />
        <Resultat
          kicker={kickerFin}
          bonnes={nbConnues}
          total={serie.length}
          ligne={`cartes connues · ${aRevoir.length} à revoir`}
          lignes={serie.map((f) => ({ titre: texteBrut(f.titre), ok: connues[f.id] === true }))}
        >
          {aRevoir.length > 0 && (
            <button type="button" className="bouton bouton-large actions-pleine" onClick={() => recommencer(aRevoir)}>
              Revoir les {aRevoir.length} carte{aRevoir.length > 1 ? 's' : ''}
            </button>
          )}
          <a className="bouton bouton-secondaire bouton-large" href={retour}>
            Retour
          </a>
          <button type="button" className="bouton bouton-large" onClick={() => recommencer(fiches)}>
            Recommencer
          </button>
        </Resultat>
      </>
    )
  }

  const aRevoirInitiales = fiches.filter((f) => aRevoirAvant.includes(f.id))

  return (
    <>
      <BarreHaute href={retour} texte="Quitter" />
      <div className="progression">
        <div style={{ width: `${(index / serie.length) * 100}%` }} />
      </div>
      <div className="quiz-meta">
        <span className="kicker">Cartes mémo</span>
        <span className="kicker kicker-doux">
          {index + 1} / {serie.length}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        className={`carte-memo plan${retournee ? ' carte-memo-verso' : ''}`}
        onClick={() => setRetournee(!retournee)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setRetournee(!retournee)
          }
        }}
        aria-label={retournee ? 'Revenir au recto' : 'Retourner la carte'}
      >
        <Coins />
        <span className="kicker">
          {retournee ? 'Verso' : 'Recto'} · {TYPE_FICHE[fiche.type]}
        </span>
        {retournee ? (
          <>
            <div className="memo-titre-petit">
              <Html html={fiche.titre} inline />
            </div>
            <div className="memo-verso">
              <Verso fiche={fiche} />
            </div>
          </>
        ) : (
          <>
            <div className="memo-titre">
              <Html html={fiche.titre} inline />
            </div>
            <div className="memo-indice">Touchez pour retourner</div>
          </>
        )}
      </div>

      <div className="actions actions-2">
        <button type="button" className="bouton bouton-secondaire bouton-large" onClick={() => repondre(false)}>
          À revoir
        </button>
        <button type="button" className="bouton bouton-large" onClick={() => repondre(true)}>
          Je sais
        </button>
      </div>

      {index === 0 && serie.length === fiches.length && aRevoirInitiales.length > 0 && (
        <button type="button" className="lien-discret" onClick={() => recommencer(aRevoirInitiales)}>
          Seulement les {aRevoirInitiales.length} carte{aRevoirInitiales.length > 1 ? 's' : ''} à revoir de la
          dernière fois
        </button>
      )}
    </>
  )
}
