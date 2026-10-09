// Correction des réponses aux questions de quiz.
import type { Question } from '../content/schema'

// Lit un nombre écrit en décimal (virgule ou point), en hexadécimal (0x…) ou en binaire (0b…).
function lireNombre(texte: string): number | null {
  const t = texte.trim().toLowerCase().replace(/[\s_']/g, '')
  if (!t) return null
  const signe = t.startsWith('-') ? -1 : 1
  const corps = t.replace(/^[-+]/, '')
  let n: number
  if (/^0x[0-9a-f]+$/.test(corps)) n = parseInt(corps.slice(2), 16)
  else if (/^0b[01]+$/.test(corps)) n = parseInt(corps.slice(2), 2)
  else if (/^\d+([.,]\d+)?$/.test(corps)) n = Number(corps.replace(',', '.'))
  else return null
  return signe * n
}

const echapper = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const normaliser = (t: string) => t.trim().toLowerCase().replace(/\s+/g, '')

export function estCorrecte(q: Question, saisie: string | number | boolean): boolean {
  switch (q.type) {
    case 'qcm':
    case 'vrai_faux':
      return saisie === q.reponse
    case 'numerique': {
      const n = lireNombre(String(saisie))
      return n !== null && Math.abs(n - q.reponse) <= (q.tolerance ?? 1e-9)
    }
    case 'trace': {
      const n = lireNombre(String(saisie))
      const attendu = typeof q.reponse === 'number' ? q.reponse : lireNombre(q.reponse)
      if (n !== null && attendu !== null) return n === attendu
      return typeof q.reponse === 'string' && normaliser(String(saisie)) === normaliser(q.reponse)
    }
  }
}

export function bonneReponse(q: Question): string {
  switch (q.type) {
    case 'qcm':
      return q.choix[q.reponse]
    case 'vrai_faux':
      return q.reponse ? 'Vrai' : 'Faux'
    case 'numerique':
      return q.tolerance ? `${q.reponse} (± ${q.tolerance})` : String(q.reponse)
    case 'trace':
      return `<code>${echapper(String(q.reponse))}</code>`
  }
}
