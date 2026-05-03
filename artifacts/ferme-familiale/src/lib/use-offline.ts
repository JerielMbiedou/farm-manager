import { useEffect, useState } from "react";

/**
 * BLOC 6 — QW10 / BLOC 10
 * Hook qui suit l'état de connexion réseau du navigateur.
 * Renvoie `true` quand l'utilisateur est hors-ligne.
 */
export function useOffline(): boolean {
  const getInitial = () =>
    typeof navigator !== "undefined" && "onLine" in navigator
      ? !navigator.onLine
      : false;

  const [offline, setOffline] = useState<boolean>(getInitial);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return offline;
}
