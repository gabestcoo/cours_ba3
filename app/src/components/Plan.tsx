// Repères « + » centrés sur les 4 coins d'une carte (élément signature du design).
// À placer comme premier enfant d'un élément portant la classe `.plan`.
export function Coins() {
  return (
    <>
      <i className="coin hg" aria-hidden="true" />
      <i className="coin hd" aria-hidden="true" />
      <i className="coin bg" aria-hidden="true" />
      <i className="coin bd" aria-hidden="true" />
    </>
  )
}
