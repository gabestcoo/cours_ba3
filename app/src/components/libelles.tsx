import type { Fiche, Question } from '../content/schema'

export const TYPE_FICHE: Record<Fiche['type'], string> = {
  definition: 'Définition',
  theoreme: 'Théorème',
  formule: 'Formule',
  methode: 'Méthode',
  syntaxe: 'Syntaxe',
  resume: 'Résumé',
}

export const TYPE_QUESTION: Record<Question['type'], string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai / Faux',
  numerique: 'Réponse libre',
  trace: 'Trace · réponse libre',
}

const IMPORTANCE = { 1: 'Détail', 2: 'Utile', 3: 'Incontournable' } as const

export function Importance({ niveau }: { niveau: 1 | 2 | 3 }) {
  return (
    <span className="importance" title={IMPORTANCE[niveau]} aria-label={`Importance : ${IMPORTANCE[niveau]}`}>
      {'●'.repeat(niveau)}
      {'○'.repeat(3 - niveau)}
    </span>
  )
}

export const deuxChiffres = (n: number) => String(n).padStart(2, '0')
export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

// Texte brut d'un champ pré-rendu en HTML (pour un aperçu sur une ligne).
export function texteBrut(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('pre, .katex-mathml').forEach((e) => e.remove())
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}
