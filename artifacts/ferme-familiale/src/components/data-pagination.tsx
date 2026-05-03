import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * BLOC 6 — QW5/QW6 / BLOC 7
 * Composant de pagination réutilisable (côté client ou côté serveur).
 *
 *   <DataPagination page={page} pageSize={pageSize} total={total}
 *                   onPageChange={setPage} onPageSizeChange={setPageSize} />
 */
interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const DEFAULT_OPTIONS = [10, 25, 50, 100];

export function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_OPTIONS,
  className = "",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);

  const goto = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 py-2 text-sm text-muted-foreground ${className}`}
      data-testid="data-pagination"
    >
      <div>
        {total === 0
          ? "Aucun élément"
          : `${start.toLocaleString("fr-FR")} – ${end.toLocaleString("fr-FR")} sur ${total.toLocaleString("fr-FR")}`}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onPageSizeChange && (
          <label className="flex items-center gap-1">
            <span>Par page :</span>
            <select
              className="h-8 rounded border bg-background px-2 text-sm"
              value={pageSize}
              onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              data-testid="select-page-size"
            >
              {pageSizeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => goto(1)} aria-label="Première page" data-testid="btn-page-first">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => goto(safePage - 1)} aria-label="Page précédente" data-testid="btn-page-prev">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 tabular-nums text-foreground">
            Page {safePage} / {totalPages}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => goto(safePage + 1)} aria-label="Page suivante" data-testid="btn-page-next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => goto(totalPages)} aria-label="Dernière page" data-testid="btn-page-last">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
