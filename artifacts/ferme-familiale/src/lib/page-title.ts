import { getBrandSync } from "./branding";

/**
 * Titre de l'onglet du navigateur. C'est aussi la première chose qu'un lecteur
 * d'écran annonce en arrivant sur une page : il doit dire où l'on se trouve.
 */
export function setPageTitle(page: string) {
  const ferme = getBrandSync().nom;
  document.title = page ? `${page} — ${ferme}` : ferme;
}
