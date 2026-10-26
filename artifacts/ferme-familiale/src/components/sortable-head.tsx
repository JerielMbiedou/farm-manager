import type { ReactNode } from "react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ARIA_SORT: Record<string, "ascending" | "descending"> = { "▲": "ascending", "▼": "descending" };

/**
 * En-tête de colonne triable. Le tri est un vrai bouton (Tab puis Entrée ou
 * Espace) au lieu d'un clic sur la cellule, et aria-sort annonce l'ordre
 * courant aux lecteurs d'écran. `icon` est la flèche renvoyée par
 * useSortable().sortIcon(colonne) : ↕ inactif, ▲ croissant, ▼ décroissant.
 */
export function SortableHead({ icon, onSort, className, children, ...rest }: {
  icon: string;
  onSort: () => void;
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <TableHead className={className} aria-sort={ARIA_SORT[icon]} {...rest}>
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1 rounded-sm -mx-1 px-1 py-1 font-[inherit] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
        <span aria-hidden="true" className="text-xs text-muted-foreground">{icon}</span>
      </button>
    </TableHead>
  );
}
