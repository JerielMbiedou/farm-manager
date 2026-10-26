import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Bouton « déplier / replier » d'un groupe de lignes dans un tableau.
 * La ligne entière reste cliquable à la souris ; ce bouton rend le geste
 * possible au clavier (Tab puis Entrée ou Espace) et aria-expanded annonce
 * l'état du groupe aux lecteurs d'écran.
 */
export function GroupToggle({ collapsed, label, onToggle }: { collapsed: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      aria-label={label}
      // La ligne a son propre onClick : sans stopPropagation, le groupe basculerait deux fois.
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="-m-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );
}
