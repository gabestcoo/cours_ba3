import 'katex/dist/katex.min.css'

// Affiche un champ de contenu pré-rendu au build (Markdown + KaTeX + Shiki → HTML).
export function Html({ html, inline = false }: { html: string; inline?: boolean }) {
  return inline ? (
    <span className="md" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
