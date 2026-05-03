import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFCFA } from "@/lib/format";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DataPagination } from "@/components/data-pagination";
import { useSortable } from "@/lib/use-sortable";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface CaisseEntry {
  date: string;
  type: "entree" | "sortie";
  categorie: string;
  designation: string;
  montant: number;
  soldeApres: number;
}

async function fetchHistoriqueCaisse(): Promise<{ entries: CaisseEntry[]; soldeCourant: number }> {
  const res = await fetch(`${BASE}/api/dashboard/historique-caisse`, { credentials: "include" });
  if (!res.ok) throw new Error("Erreur chargement historique caisse");
  return res.json();
}

export default function HistoriqueCaisse() {
  const { data, isLoading } = useQuery({ queryKey: ["historique-caisse"], queryFn: fetchHistoriqueCaisse });
  const [dateFilter, setDateFilter] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // BLOC 7 — Tri colonne (par défaut : date décroissante = plus récent en haut)
  const allEntries = data?.entries ?? [];
  const filtered = useMemo<CaisseEntry[]>(() =>
    allEntries.filter(e => {
      if (dateFilter && !e.date.startsWith(dateFilter)) return false;
      if (catFilter !== "all" && e.categorie !== catFilter) return false;
      return true;
    }),
  [allEntries, dateFilter, catFilter]);

  const { sorted, toggleSort, sortIcon } = useSortable<CaisseEntry>(filtered, "date", "desc");

  // Pagination client (les données arrivent en un seul payload)
  const total = sorted.length;
  const safePage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
  const start = (safePage - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!data) return <div className="text-destructive">Erreur de chargement</div>;

  const categories: string[] = Array.from(new Set(allEntries.map(e => e.categorie))).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Historique de caisse</h1>
        <p className="text-muted-foreground mt-1">Journal complet des mouvements financiers</p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Solde courant</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${data.soldeCourant >= 0 ? "text-green-700" : "text-red-600"}`}>
            {formatFCFA(data.soldeCourant)}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-wrap">
        <Input type="month" placeholder="Filtrer par mois" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="w-48" />
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("date")} data-testid="th-date">Date <span className="text-xs text-muted-foreground">{sortIcon("date")}</span></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("type")}>Type <span className="text-xs text-muted-foreground">{sortIcon("type")}</span></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("categorie")}>Catégorie <span className="text-xs text-muted-foreground">{sortIcon("categorie")}</span></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("designation")}>Désignation <span className="text-xs text-muted-foreground">{sortIcon("designation")}</span></TableHead>
              <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("montant")}>Montant <span className="text-xs text-muted-foreground">{sortIcon("montant")}</span></TableHead>
              <TableHead className="text-right">Solde après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun mouvement.</TableCell></TableRow>
            ) : (
              paginated.map((e, i) => (
                <TableRow key={start + i} data-testid={`caisse-row-${start + i}`}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${e.type === "entree" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {e.type === "entree" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {e.type === "entree" ? "Entrée" : "Sortie"}
                    </span>
                  </TableCell>
                  <TableCell>{e.categorie}</TableCell>
                  <TableCell>{e.designation}</TableCell>
                  <TableCell className={`text-right font-medium ${e.type === "entree" ? "text-green-700" : "text-red-600"}`}>
                    {e.type === "entree" ? "+" : "-"}{formatFCFA(e.montant)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${e.soldeApres >= 0 ? "" : "text-red-600"}`}>
                    {formatFCFA(e.soldeApres)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <DataPagination
          page={safePage}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="border-t"
        />
      </div>
    </div>
  );
}
