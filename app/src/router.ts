// Routage par hash : fonctionne hors ligne et sans configuration serveur.
//   #/                     accueil
//   #/analyse3             cours
//   #/analyse3/1           semaine (onglet fiches)
//   #/analyse3/1/quiz      semaine (onglet quiz)
//   #/softcons/theme/recursion        thème (onglet fiches)
//   #/softcons/theme/recursion/quiz   thème (onglet quiz)
import { useSyncExternalStore } from 'react'

export type Onglet = 'fiches' | 'quiz'

export type Route =
  | { page: 'accueil' }
  | { page: 'cours'; cours: string }
  | { page: 'semaine'; cours: string; semaine: number; onglet: Onglet }
  | { page: 'theme'; cours: string; theme: string; onglet: Onglet }

export function analyser(hash: string): Route {
  const [cours, semaine, onglet, ongletTheme] = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!cours) return { page: 'accueil' }
  if (semaine === 'theme' && onglet)
    return { page: 'theme', cours, theme: onglet, onglet: ongletTheme === 'quiz' ? 'quiz' : 'fiches' }
  const n = Number(semaine)
  if (!semaine || !Number.isInteger(n)) return { page: 'cours', cours }
  return { page: 'semaine', cours, semaine: n, onglet: onglet === 'quiz' ? 'quiz' : 'fiches' }
}

export function lien(route: Route): string {
  switch (route.page) {
    case 'accueil':
      return '#/'
    case 'cours':
      return `#/${route.cours}`
    case 'semaine':
      return `#/${route.cours}/${route.semaine}${route.onglet === 'quiz' ? '/quiz' : ''}`
    case 'theme':
      return `#/${route.cours}/theme/${route.theme}${route.onglet === 'quiz' ? '/quiz' : ''}`
  }
}

const abonner = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(abonner, () => window.location.hash)
  return analyser(hash)
}
