// Contenu d'une fiche, tel qu'affiché dans le lecteur (une fiche par écran).
import type { ReactNode } from 'react'
import type { Fiche } from '../content/schema'
import { Html } from './Html'
import { Importance, TYPE_FICHE, deuxChiffres } from './libelles'
import { Coins } from './Plan'
import { Schema } from './Schema'

function Bloc({ titre, html }: { titre: string; html: string | undefined }) {
  if (!html) return null
  return (
    <section className="fiche-bloc">
      <div className="kicker kicker-doux">{titre}</div>
      <Html html={html} />
    </section>
  )
}

function Carte({ children }: { children: ReactNode }) {
  return (
    <div className="carte-fiche plan">
      <Coins />
      {children}
    </div>
  )
}

function ListeNumerotee({ titre, items }: { titre: string; items: string[] }) {
  return (
    <section className="fiche-bloc">
      <div className="kicker kicker-doux">{titre}</div>
      <ol className="liste-numerotee">
        {items.map((item, i) => (
          <li key={i}>
            <span className="liste-numero">{deuxChiffres(i + 1)}</span>
            <Html html={item} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function Corps({ fiche }: { fiche: Fiche }) {
  switch (fiche.type) {
    case 'definition':
      return (
        <Carte>
          <Html html={fiche.corps} />
        </Carte>
      )
    case 'theoreme':
      return (
        <>
          <section className="fiche-bloc">
            <div className="kicker kicker-doux">Hypothèses</div>
            <div className="hypotheses">
              <Html html={fiche.hypotheses} />
            </div>
          </section>
          <Carte>
            <Html html={fiche.corps} />
          </Carte>
          <Bloc titre="Remarques" html={fiche.remarques} />
        </>
      )
    case 'formule':
      return (
        <>
          <Carte>
            <Html html={fiche.corps} />
          </Carte>
          <Bloc titre="Conditions" html={fiche.conditions} />
        </>
      )
    case 'methode':
      return (
        <>
          <ListeNumerotee titre="Étapes" items={fiche.etapes} />
          <Bloc titre="Exemple" html={fiche.exemple} />
        </>
      )
    case 'syntaxe':
      return (
        <>
          <Carte>
            <Html html={fiche.syntaxe} />
            <Html html={fiche.usage} />
          </Carte>
          <Bloc titre="Exemple" html={fiche.exemple} />
          <Bloc titre="Piège" html={fiche.piege} />
        </>
      )
    case 'resume':
      return (
        <>
          <Carte>
            <Html html={fiche.corps} />
          </Carte>
          <ListeNumerotee titre="Points clés" items={fiche.points_cles} />
        </>
      )
  }
}

export function FicheContenu({ fiche, position, total }: { fiche: Fiche; position: number; total: number }) {
  return (
    <article className="fiche-contenu" id={fiche.id}>
      <div className="fiche-meta-ligne">
        <span className="kicker">
          {TYPE_FICHE[fiche.type]} <Importance niveau={fiche.importance} />
        </span>
        <span className="kicker kicker-doux">
          {position} / {total}
        </span>
      </div>
      <h1 className="titre-fiche">
        <Html html={fiche.titre} inline />
      </h1>
      {!fiche.verifie && <span className="tag-non-verifie">non vérifié</span>}

      {fiche.incertain && (
        <div className="bandeau-incertain" role="note">
          <span className="bandeau-signe">⚠</span>
          <Html html={fiche.incertain} inline />
        </div>
      )}

      <Corps fiche={fiche} />

      {fiche.schema && <Schema svg={fiche.schema.svg} legende={fiche.schema.legende} />}

      <p className="source" title={fiche.source.fichier}>
        Source : {fiche.source.fichier}, {fiche.source.emplacement}
      </p>
    </article>
  )
}
