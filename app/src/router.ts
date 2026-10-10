// Routage par hash : fonctionne hors ligne et sans configuration serveur.
//   #/                              accueil
//   #/analyse3                      cours
//   #/analyse3/1                    semaine, onglet Résumés (liste des fiches)
//   #/analyse3/1/quiz               semaine, onglet Quiz (quiz et cartes mémo)
//   #/analyse3/1/fiches/3           lecteur, sur la 3ᵉ fiche
//   #/analyse3/1/quiz/jouer         quiz en cours
//   #/analyse3/1/memo               cartes mémo
//   #/softcons/theme/recursion/…    mêmes vues pour un thème d'entraînement
import { useSyncExternalStore } from 'react'

export type Vue =
  | { type: 'fiches' }
  | { type: 'quiz' }
  | { type: 'lecteur'; fiche: number } // index à partir de 0
  | { type: 'jeu' }
  | { type: 'memo' }

export type Onglet = 'fiches' | 'quiz'

export type Route =
  | { page: 'accueil' }
  | { page: 'cours'; cours: string }
  | { page: 'semaine'; cours: string; semaine: number; vue: Vue }
  | { page: 'theme'; cours: string; theme: string; vue: Vue }

function analyserVue([a, b]: string[]): Vue {
  if (a === 'quiz') return b === 'jouer' ? { type: 'jeu' } : { type: 'quiz' }
  if (a === 'memo') return { type: 'memo' }
  if (a === 'fiches') {
    const n = Number(b)
    return Number.isInteger(n) && n >= 1 ? { type: 'lecteur', fiche: n - 1 } : { type: 'fiches' }
  }
  return { type: 'fiches' }
}

export function analyser(hash: string): Route {
  const [cours, deuxieme, ...reste] = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!cours) return { page: 'accueil' }
  if (deuxieme === 'theme' && reste[0]) return { page: 'theme', cours, theme: reste[0], vue: analyserVue(reste.slice(1)) }
  const n = Number(deuxieme)
  if (!deuxieme || !Number.isInteger(n)) return { page: 'cours', cours }
  return { page: 'semaine', cours, semaine: n, vue: analyserVue(reste) }
}

function suffixe(vue: Vue): string {
  switch (vue.type) {
    case 'fiches':
      return ''
    case 'quiz':
      return '/quiz'
    case 'lecteur':
      return `/fiches/${vue.fiche + 1}`
    case 'jeu':
      return '/quiz/jouer'
    case 'memo':
      return '/memo'
  }
}

export function lien(route: Route): string {
  switch (route.page) {
    case 'accueil':
      return '#/'
    case 'cours':
      return `#/${route.cours}`
    case 'semaine':
      return `#/${route.cours}/${route.semaine}${suffixe(route.vue)}`
    case 'theme':
      return `#/${route.cours}/theme/${route.theme}${suffixe(route.vue)}`
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
