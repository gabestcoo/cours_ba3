import { lien } from '../router'

export function Introuvable() {
  return (
    <>
      <h1 className="titre-page">Page introuvable</h1>
      <p className="vide">
        <a href={lien({ page: 'accueil' })}>Retour à l'accueil</a>
      </p>
    </>
  )
}
