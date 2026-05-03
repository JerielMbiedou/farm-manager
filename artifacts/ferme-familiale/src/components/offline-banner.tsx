import { useEffect, useState } from "react";
import { WifiOff, CloudUpload } from "lucide-react";
import { useOffline } from "@/lib/use-offline";
import { subscribeQueueSize, replayQueue } from "@/lib/offline-queue";
import { useToast } from "@/hooks/use-toast";

/**
 * BLOC 6 — QW10 / BLOC 10
 * Bandeau persistant qui informe l'utilisateur de son état de connexion
 * et du nombre d'opérations en attente de synchronisation.
 */
export function OfflineBanner() {
  const offline = useOffline();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => subscribeQueueSize(setPending), []);

  // Quand on revient en ligne avec des éléments en file → toast de synchro
  useEffect(() => {
    if (!offline && pending > 0 && !syncing) {
      setSyncing(true);
      replayQueue()
        .then(r => {
          if (r.sent > 0) {
            toast({ title: "Synchronisation effectuée", description: `${r.sent} opération(s) envoyée(s)` });
          }
          if (r.failed > 0) {
            toast({ title: "Synchro partielle", description: `${r.failed} opération(s) rejetée(s) par le serveur`, variant: "destructive" });
          }
        })
        .finally(() => setSyncing(false));
    }
  }, [offline, pending, syncing, toast]);

  if (!offline && pending === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full text-sm px-4 py-2 flex items-center justify-center gap-2 ${
        offline
          ? "bg-amber-100 text-amber-900 border-b border-amber-300"
          : "bg-blue-100 text-blue-900 border-b border-blue-300"
      }`}
      data-testid="offline-banner"
    >
      {offline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            Mode hors-ligne — vos saisies sont enregistrées localement
            {pending > 0 ? ` (${pending} en attente)` : ""}.
          </span>
        </>
      ) : (
        <>
          <CloudUpload className="h-4 w-4 animate-pulse" />
          <span>Synchronisation en cours… ({pending} en attente)</span>
        </>
      )}
    </div>
  );
}
