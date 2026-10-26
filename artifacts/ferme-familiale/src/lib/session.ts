import { useGetMe } from "@workspace/api-client-react";

/**
 * L'utilisateur connecté, lu de la même façon par la page de connexion et par
 * les gardes des pages.
 *
 * Avant, la connexion renvoyait vers le tableau de bord dès qu'un utilisateur
 * était en cache, tandis que la garde renvoyait vers la connexion dès que la
 * dernière vérification avait échoué. Quand une vérification échouait avec un
 * utilisateur encore en cache (serveur qui redémarre pendant un déploiement,
 * réveil de Render, réseau coupé), les deux se renvoyaient la page sans fin et
 * l'application restait bloquée.
 *
 * Règle unique : seule une réponse 401 dit « pas connecté ». Une autre erreur
 * garde l'utilisateur en cache ; sans utilisateur, la page de connexion reste
 * affichée sans redirection.
 */
export function useSession() {
  const me = useGetMe();
  const status = (me.error as { status?: number } | null)?.status;
  const user = me.isError && status === 401 ? undefined : me.data;
  return {
    user,
    /** Vrai pendant la toute première vérification seulement. Les vérifications
     *  suivantes (retour sur l'onglet…) ne doivent pas faire disparaître le
     *  formulaire de connexion en cours de saisie. */
    enCours: me.isLoading,
  };
}
