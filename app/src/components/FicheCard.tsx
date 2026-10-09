import type { Fiche } from '../content/schema'
import { Html } from './Html'

const LIBELLES: Record<Fiche['type'], string> = {
  definition: 'Définition',
  theoreme: 'Théorème',
  formule: 'Formule',
  methode: 'Méthode',
  syntaxe: 'Syntaxe',
  resume: 'Résumé',
}

const IMPORTANCE = { 1: 'Détail', 2: 'Utile', 3: 'Incontournable' } as const

function Section({ titre, texte }: { titre?: string; texte: string | undefined }) {
  if (!texte) return null
  return (
    <section className="fiche-section">
      {titre && <h4>{titre}</h4>}
      <Html html={texte} />
    </section>
  )
}

function Liste({ titre, items, ordonnee }: { titre: string; items: string[]; ordonnee?: boolean }) {
  const L = ordonnee ? 'ol' : 'ul'
  return (
    <section className="fiche-section">
      <h4>{titre}</h4>
      <L className="fiche-liste">
        {items.map((item, i) => (
          <li key={i}>
            <Html html={item} />
          </li>
        ))}
      </L>
    </section>
  )
}

function Corps({ fiche }: { fiche: Fiche }) {
  switch (fiche.type) {
    case 'definition':
      return <Section texte={fiche.corps} />
    case 'theoreme':
      return (
        <>
          <Section titre="Hypothèses" texte={fiche.hypotheses} />
          <Section titre="Énoncé" texte={fiche.corps} />
          <Section titre="Remarques" texte={fiche.remarques} />
        </>
      )
    case 'formule':
      return (
        <>
          <Section texte={fiche.corps} />
          <Section titre="Conditions" texte={fiche.conditions} />
        </>
      )
    case 'methode':
      return (
        <>
          <Liste titre="Étapes" items={fiche.etapes} ordonnee />
          <Section titre="Exemple" texte={fiche.exemple} />
        </>
      )
    case 'syntaxe':
      return (
        <>
          <Section titre="Syntaxe" texte={fiche.syntaxe} />
          <Section titre="Usage" texte={fiche.usage} />
          <Section titre="Exemple" texte={fiche.exemple} />
          <Section titre="Piège" texte={fiche.piege} />
        </>
      )
    case 'resume':
      return (
        <>
          <Section texte={fiche.corps} />
          <Liste titre="Points clés" items={fiche.points_cles} />
        </>
      )
  }
}

export function FicheCard({ fiche }: { fiche: Fiche }) {
  const nomFichier = fiche.source.fichier.split('/').pop()
  return (
    <article className={`fiche fiche-${fiche.type}`} id={fiche.id}>
      <header className="fiche-entete">
        <div className="fiche-meta">
          <span className="chip">{LIBELLES[fiche.type]}</span>
          <span
            className={`importance importance-${fiche.importance}`}
            title={IMPORTANCE[fiche.importance]}
            aria-label={`Importance : ${IMPORTANCE[fiche.importance]}`}
          >
            {'●'.repeat(fiche.importance)}
            {'○'.repeat(3 - fiche.importance)}
          </span>
          {!fiche.verifie && <span className="badge-non-verifie">non vérifié</span>}
        </div>
        <h3>
          <Html html={fiche.titre} inline />
        </h3>
      </header>

      {fiche.incertain && (
        <div className="avertissement" role="note">
          <strong>⚠ Contenu incertain.</strong> <Html html={fiche.incertain} inline />
        </div>
      )}

      <Corps fiche={fiche} />

      <footer className="fiche-source" title={fiche.source.fichier}>
        Source : {nomFichier}, {fiche.source.emplacement}
      </footer>
    </article>
  )
}
