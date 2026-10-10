import { useEffect } from 'react'
import { useRoute } from './router'
import { Accueil } from './pages/Accueil'
import { CoursPage } from './pages/CoursPage'
import { SemainePage } from './pages/SemainePage'
import { ThemePage } from './pages/ThemePage'

export function App() {
  const route = useRoute()

  // Remonter en haut à chaque changement d'écran (le lecteur gère son propre défilement).
  const ecran =
    route.page === 'semaine' || route.page === 'theme'
      ? `${route.page}:${route.cours}:${route.page === 'semaine' ? route.semaine : route.theme}:${route.vue.type}`
      : `${route.page}:${route.page === 'cours' ? route.cours : ''}`
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  return (
    <main className="page">
      {route.page === 'accueil' && <Accueil />}
      {route.page === 'cours' && <CoursPage slug={route.cours} />}
      {route.page === 'semaine' && <SemainePage slug={route.cours} numero={route.semaine} vue={route.vue} />}
      {route.page === 'theme' && <ThemePage slug={route.cours} theme={route.theme} vue={route.vue} />}
    </main>
  )
}
