// Lecteur de fiches : une fiche par écran, on passe à la suivante en glissant horizontalement.
// L'index courant est reflété dans l'URL (history.replaceState, sans polluer l'historique).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Fiche } from '../content/schema'
import { BarreHaute } from './Entete'
import { FicheContenu } from './FicheContenu'
import { Icone } from './Icone'

interface Props {
  fiches: Fiche[]
  depart: number
  retour: { href: string; texte: string }
  lienFiche: (index: number) => string
  fin: { href: string; texte: string }
}

export function LecteurFiches({ fiches, depart, retour, lienFiche, fin }: Props) {
  const total = fiches.length
  const [index, setIndex] = useState(() => Math.min(Math.max(depart, 0), total - 1))
  const pager = useRef<HTMLDivElement>(null)

  // À l'ouverture : se placer sur la fiche demandée, sans animation.
  useLayoutEffect(() => {
    const p = pager.current
    if (p) p.scrollLeft = index * p.clientWidth
  }, [])

  const aller = (i: number, doux = true) => {
    const p = pager.current
    if (p) p.scrollTo({ left: i * p.clientWidth, behavior: doux ? 'smooth' : 'auto' })
  }

  const surDefilement = () => {
    const p = pager.current
    if (!p || p.clientWidth === 0) return
    const i = Math.round(p.scrollLeft / p.clientWidth)
    if (i !== index && i >= 0 && i < total) {
      setIndex(i)
      history.replaceState(null, '', lienFiche(i))
    }
  }

  // Flèches du clavier (ordinateur).
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && index < total - 1) aller(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) aller(index - 1)
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [index, total])

  // Garder la fiche courante alignée si la largeur change (rotation, redimensionnement).
  useEffect(() => {
    const p = pager.current
    if (!p) return
    const obs = new ResizeObserver(() => {
      p.scrollLeft = Math.round(p.scrollLeft / p.clientWidth) * p.clientWidth
    })
    obs.observe(p)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="lecteur">
      <div className="lecteur-haut">
        <BarreHaute href={retour.href} texte={retour.texte} />
        <div className="indicateur">
          <div className="indicateur-segments">
            {fiches.map((f, i) => (
              <button
                key={f.id}
                type="button"
                className="segment"
                aria-label={`Aller à la fiche ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => aller(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <span className="kicker kicker-doux">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      <div className="pager" ref={pager} onScroll={surDefilement}>
        {fiches.map((f, i) => (
          <div className="page-fiche" key={f.id}>
            <FicheContenu fiche={f} position={i + 1} total={total} />
            {i < total - 1 ? (
              <p className="indice-glisser">
                Glisser pour la fiche suivante <Icone nom="fleche-droite" taille={16} />
              </p>
            ) : (
              <a className="bouton bouton-large" href={fin.href}>
                {fin.texte}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
