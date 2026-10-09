import { basculerTheme, useThemeAffiche } from '../theme'
import { Icone } from './Icone'

export function BoutonTheme({ avecFilet = false }: { avecFilet?: boolean }) {
  const theme = useThemeAffiche()
  return (
    <button
      type="button"
      className={`bouton-theme${avecFilet ? ' bouton-theme-filet' : ''}`}
      onClick={basculerTheme}
      aria-label={theme === 'sombre' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <Icone nom={theme === 'sombre' ? 'soleil' : 'lune'} />
    </button>
  )
}

// Barre haute des pages intérieures : lien retour à gauche, bouton thème à droite.
export function BarreHaute({ href, texte }: { href: string; texte: string }) {
  return (
    <div className="barre-haute">
      <a className="retour" href={href}>
        <Icone nom="chevron-gauche" taille={20} />
        {texte}
      </a>
      <BoutonTheme />
    </div>
  )
}
