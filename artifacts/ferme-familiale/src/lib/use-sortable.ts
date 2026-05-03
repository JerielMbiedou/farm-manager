import { useMemo, useState, useCallback } from "react";

/**
 * BLOC 6 — QW9 / BLOC 7
 * Hook générique de tri pour les tableaux.
 *
 * Usage :
 *   const { sorted, sortKey, sortDir, toggleSort } = useSortable(rows, "date", "desc");
 *   <TableHead onClick={() => toggleSort("date")}>Date {sortIcon("date")}</TableHead>
 */
export type SortDirection = "asc" | "desc";

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  // Dates ISO — on compare en string : ça reste l'ordre lexico-chronologique correct
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") {
    return na - nb;
  }
  return String(a).localeCompare(String(b), "fr", { numeric: true });
}

export function useSortable<T extends Record<string, any>>(
  rows: T[] | undefined | null,
  initialKey: keyof T | null = null,
  initialDir: SortDirection = "asc",
) {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey);
  const [sortDir, setSortDir] = useState<SortDirection>(initialDir);

  const toggleSort = useCallback((key: keyof T) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const sorted = useMemo(() => {
    const arr = rows ? [...rows] : [];
    if (!sortKey) return arr;
    arr.sort((a, b) => {
      const r = compare(a[sortKey], b[sortKey]);
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const sortIcon = (key: keyof T) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "▲" : "▼";
  };

  return { sorted, sortKey, sortDir, toggleSort, sortIcon };
}
