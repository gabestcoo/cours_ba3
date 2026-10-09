// Thème clair / sombre : suit le système par défaut, le bouton peut le forcer.
// Le choix forcé est enregistré dans localStorage (`rev:v1:theme`) et appliqué sur
// <html data-theme="clair|sombre">, que le CSS lit en priorité sur prefers-color-scheme.
import { useSyncExternalStore } from 'react'
import { ecrire, lire } from './storage'

export type Theme = 'clair' | 'sombre'

const COULEURS: Record<Theme, string> = { clair: '#f2f2f3', sombre: '#15181b' }
const EVENEMENT = 'rev-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')
const systeme = (): Theme => (media().matches ? 'sombre' : 'clair')

function appliquer(force: Theme | null) {
  const racine = document.documentElement
  if (force) racine.dataset.theme = force
  else delete racine.dataset.theme
  // La barre du navigateur suit le thème affiché.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const mediaMeta = meta.media.includes('dark') ? 'sombre' : 'clair'
    meta.content = COULEURS[force ?? mediaMeta]
  }
}

// Appelé dans main.tsx avant le premier rendu, pour éviter un flash du mauvais thème.
export function initialiserTheme() {
  appliquer(lire<Theme | null>('theme', null))
}

export function themeAffiche(): Theme {
  return (document.documentElement.dataset.theme as Theme | undefined) ?? systeme()
}

// Bascule le thème affiché. Si le nouveau thème est celui du système, on cesse de le forcer.
export function basculerTheme() {
  const nouveau: Theme = themeAffiche() === 'sombre' ? 'clair' : 'sombre'
  const force = nouveau === systeme() ? null : nouveau
  ecrire('theme', force)
  appliquer(force)
  window.dispatchEvent(new Event(EVENEMENT))
}

const abonner = (cb: () => void) => {
  const m = media()
  m.addEventListener('change', cb)
  window.addEventListener(EVENEMENT, cb)
  return () => {
    m.removeEventListener('change', cb)
    window.removeEventListener(EVENEMENT, cb)
  }
}

export function useThemeAffiche(): Theme {
  return useSyncExternalStore(abonner, themeAffiche)
}
