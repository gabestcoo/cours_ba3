import { useEffect, useState } from 'react'
import { Html } from './Html'

// Schéma SVG redessiné d'après le cours (validé et filtré au build), avec sa légende.
// Un bouton permet de l'agrandir en plein écran pour zoomer sur téléphone.
export function Schema({ svg, legende }: { svg: string; legende: string }) {
  const [agrandi, setAgrandi] = useState(false)

  useEffect(() => {
    if (!agrandi) return
    const fermer = (e: KeyboardEvent) => e.key === 'Escape' && setAgrandi(false)
    window.addEventListener('keydown', fermer)
    return () => window.removeEventListener('keydown', fermer)
  }, [agrandi])

  return (
    <figure className="schema">
      <button type="button" className="schema-image" onClick={() => setAgrandi(true)} aria-label="Agrandir le schéma">
        <span dangerouslySetInnerHTML={{ __html: svg }} />
      </button>
      <figcaption>
        <Html html={legende} />
        <p className="schema-note">Schéma redessiné d'après le cours · toucher pour agrandir</p>
      </figcaption>
      {agrandi && (
        <div className="schema-plein-ecran" role="dialog" aria-modal="true" aria-label="Schéma agrandi">
          <button type="button" className="bouton schema-fermer" onClick={() => setAgrandi(false)}>
            Fermer
          </button>
          <div className="schema-zoom" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      )}
    </figure>
  )
}
