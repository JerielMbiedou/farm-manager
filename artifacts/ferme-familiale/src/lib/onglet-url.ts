import { useLocation } from "wouter";

/**
 * Onglet courant lu dans l'adresse plutôt qu'en mémoire : il survit à un
 * rechargement, on peut envoyer un lien vers lui (« Bande 3 › Mortalité ») et
 * le bouton Retour du téléphone revient à l'onglet précédent au lieu de
 * quitter la page. L'onglet par défaut garde l'adresse de base.
 */
export function useOngletUrl<T extends string>(base: string, defaut: T, valides: readonly T[]): [T, (onglet: string) => void] {
  const [location, navigate] = useLocation();
  const reste = location.startsWith(base) ? location.slice(base.length).replace(/^\//, "") : "";
  const segment = reste.split("/")[0] as T;
  const onglet = valides.includes(segment) ? segment : defaut;
  const changer = (v: string) => navigate(v === defaut ? base : `${base}/${v}`);
  return [onglet, changer];
}
