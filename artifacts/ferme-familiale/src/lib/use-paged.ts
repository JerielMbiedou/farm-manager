import { useMemo, useState } from "react";

/**
 * BLOC B12-B13 — Hook de pagination côté client.
 * Découpe un tableau trié en pages, retourne tout ce qu'il faut pour
 * brancher <DataPagination /> et rendre la slice paginée.
 */
export function usePaged<T>(items: T[], defaultPageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return { paginated, page: safePage, pageSize, total, setPage, setPageSize };
}
