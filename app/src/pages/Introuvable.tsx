import { BarreHaute } from '../components/Entete'
import { lien } from '../router'

export function Introuvable() {
  return (
    <>
      <BarreHaute href={lien({ page: 'accueil' })} texte="Accueil" />
      <h1 className="titre-branche">Page introuvable</h1>
      <p className="vide">Cette page n'existe pas (ou plus).</p>
    </>
  )
}
