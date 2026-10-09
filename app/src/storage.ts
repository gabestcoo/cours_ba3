// Accès à localStorage avec des clés versionnées (`rev:v1:...`).
// localStorage peut être indisponible (navigation privée, stockage bloqué) : on n'échoue jamais.
const PREFIXE = 'rev:v1:'

export function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(PREFIXE + cle)
    return brut === null ? defaut : (JSON.parse(brut) as T)
  } catch {
    return defaut
  }
}

export function ecrire<T>(cle: string, valeur: T): void {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur))
  } catch {
    // stockage indisponible : on ignore
  }
}
