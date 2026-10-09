// Liste des cours, sans dépendance à Zod (importée par l'app dans le navigateur).
export const COURS = [
  { slug: 'algebra', code: 'MATH-310', nom: 'Algebra', dossier: 'algebra' },
  { slug: 'analyse3', code: 'MATH-203', nom: 'Analyse III', dossier: 'analyse_III' },
  { slug: 'probastat', code: 'MATH-232', nom: 'Probabilités et statistique', dossier: 'proba_stat' },
  { slug: 'softcons', code: 'CS-214', nom: 'Software Construction', dossier: 'software_construction' },
  { slug: 'comparch', code: 'CS-200', nom: 'Computer Architecture', dossier: 'computer_architecture' },
] as const

export type SlugCours = (typeof COURS)[number]['slug']
