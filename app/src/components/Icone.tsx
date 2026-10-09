// Icônes Lucide (trait 1.5), en SVG inline pour éviter une dépendance.
const TRACES = {
  'chevron-gauche': <path d="m15 18-6-6 6-6" />,
  'chevron-droite': <path d="m9 18 6-6-6-6" />,
  'fleche-droite': <path d="M5 12h14M13 6l6 6-6 6" />,
  lune: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  soleil: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
}

export type NomIcone = keyof typeof TRACES

export function Icone({ nom, taille = 18, className }: { nom: NomIcone; taille?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRACES[nom]}
    </svg>
  )
}
