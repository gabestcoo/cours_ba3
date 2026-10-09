import { useEffect } from 'react'
import { useRoute } from './router'
import { Accueil } from './pages/Accueil'
import { CoursPage } from './pages/CoursPage'
import { SemainePage } from './pages/SemainePage'

export function App() {
  const route = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.page, route.page !== 'accueil' ? route.cours : null, route.page === 'semaine' ? route.semaine : null])

  return (
    <main className="page">
      {route.page === 'accueil' && <Accueil />}
      {route.page === 'cours' && <CoursPage slug={route.cours} />}
      {route.page === 'semaine' && <SemainePage slug={route.cours} numero={route.semaine} onglet={route.onglet} />}
    </main>
  )
}
