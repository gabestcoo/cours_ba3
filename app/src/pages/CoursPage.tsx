import { semainesDuCours, themesDuCours, trouverCours } from '../content/load'
import { BarreHaute } from '../components/Entete'
import { Html } from '../components/Html'
import { Icone } from '../components/Icone'
import { lien } from '../router'
import { Introuvable } from './Introuvable'

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`
const deuxChiffres = (n: number) => String(n).padStart(2, '0')

// « S3, S6–S14 » : les semaines 1 à 14 qui n'ont pas encore de contenu.
function semainesManquantes(presentes: number[]): string {
  const plages: string[] = []
  let debut: number | null = null
  for (let n = 1; n <= 15; n++) {
    const manque = n <= 14 && !presentes.includes(n)
    if (manque && debut === null) debut = n
    if (!manque && debut !== null) {
      plages.push(debut === n - 1 ? `S${debut}` : `S${debut}–S${n - 1}`)
      debut = null
    }
  }
  return plages.join(', ')
}

export function CoursPage({ slug }: { slug: string }) {
  const cours = trouverCours(slug)
  if (!cours) return <Introuvable />
  const semaines = semainesDuCours(cours.slug)
  const themes = themesDuCours(cours.slug)
  const unites = [...semaines, ...themes]
  const nbFiches = unites.reduce((n, u) => n + u.nbFiches, 0)
  const nbQuiz = unites.reduce((n, u) => n + u.nbQuiz, 0)
  const manquantes = semainesManquantes(semaines.map((s) => s.semaine))

  return (
    <>
      <BarreHaute href={lien({ page: 'accueil' })} texte="Accueil" />
      <header className="entete-page">
        <div className="kicker">{cours.code}</div>
        <h1 className="titre-branche">{cours.nom}</h1>
        <p className="sous-titre">
          {semaines.length === 0
            ? 'Pas encore de contenu'
            : [pluriel(semaines.length, 'semaine'), pluriel(nbFiches, 'résumé'), nbQuiz > 0 && `${nbQuiz} quiz`]
                .filter(Boolean)
                .join(' · ')}
        </p>
      </header>

      <ul className="liste-semaines">
        {semaines.map((s) => (
          <li key={s.semaine}>
            <a
              className="ligne-semaine cliquable"
              href={lien({ page: 'semaine', cours: cours.slug, semaine: s.semaine, vue: { type: 'fiches' } })}
            >
              <span className="numero-semaine">S{deuxChiffres(s.semaine)}</span>
              <span className="ligne-corps">
                <span className="ligne-titre">
                  <Html html={s.titre} inline />
                </span>
                <span className="ligne-tags">
                  <span className="tag">{pluriel(s.nbFiches, 'résumé')}</span>
                  {s.nbQuiz > 0 && <span className="tag tag-accent">{s.nbQuiz} quiz</span>}
                  {s.nbNonVerifiees > 0 && <span className="tag">{s.nbNonVerifiees} à vérifier</span>}
                </span>
              </span>
              <Icone nom="chevron-droite" taille={16} />
            </a>
          </li>
        ))}
        {themes.map((t) => (
          <li key={t.theme}>
            <a className="ligne-semaine cliquable" href={lien({ page: 'theme', cours: cours.slug, theme: t.theme, vue: { type: 'quiz' } })}>
              <span className="numero-semaine numero-theme">{t.nbQuiz}</span>
              <span className="ligne-corps">
                <span className="kicker kicker-ligne">Entraînement</span>
                <span className="ligne-titre">
                  <Html html={t.titre} inline />
                </span>
                <span className="ligne-tags">
                  <span className="tag tag-accent">{t.nbQuiz} quiz</span>
                  {t.nbFiches > 0 && <span className="tag">{pluriel(t.nbFiches, 'résumé')}</span>}
                </span>
              </span>
              <Icone nom="chevron-droite" taille={16} />
            </a>
          </li>
        ))}
      </ul>
      {manquantes && <p className="note-fin">Autres semaines ({manquantes}) : pas encore de contenu.</p>}
    </>
  )
}
