import { useGetComparaisonBandes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import { BarChart3, Target, Download } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useSortable } from "@/lib/use-sortable";
import { legendeLisible } from "@/lib/chart-legende";
import { SortableHead } from "@/components/sortable-head";

export default function ComparaisonBandes() {
  const { data: bandes, isLoading, error } = useGetComparaisonBandes();

  const items = (bandes || []) as unknown as Array<Record<string, unknown>>;
  const { sorted, toggleSort, sortIcon } = useSortable(items, "nom" as keyof Record<string, unknown>, "asc");

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (error) return <div className="text-destructive p-4">Erreur de chargement des données de comparaison.</div>;

  // BLOC 7 — Export CSV du tableau comparatif
  const handleExportCSV = () => {
    const headers = ["Bande", "Sujets départ", "Mortalité (%)", "Vendus", "Durée (j)", "Coût/sujet", "Prix vente moy.", "Bénéfice net", "Seuil (nb poulets)", "Prix min seuil"];
    const rows = sorted.map((b) => [
      b.nom, b.sujetsDepart, b.tauxMortalite, b.totalVendus, b.dureeJours,
      b.coutParSujet, b.prixVenteMoyen, b.beneficeNet, b.seuilNombrePoulets, b.seuilPrixMin,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comparaison-bandes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartData = items.map(b => ({
    nom: b.nom as string,
    coutParSujet: b.coutParSujet as number,
    prixVenteMoyen: b.prixVenteMoyen as number,
    beneficeNet: b.beneficeNet as number,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Comparaison des bandes</h1>
        <p className="text-muted-foreground mt-1">Analyse comparative des performances entre bandes</p>
      </div>

      {items.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune bande terminée pour comparer. Les données apparaîtront après la clôture de la première bande.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  Coût / sujet vs Prix de vente moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="nom" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(value: number) => [formatFCFA(value)]} />
                      <Legend formatter={legendeLisible} />
                      <Bar dataKey="coutParSujet" fill="hsl(var(--destructive))" name="Coût/sujet" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="prixVenteMoyen" fill="hsl(var(--primary))" name="Prix vente moy." radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  Bénéfice net par bande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="nom" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(value: number) => [formatFCFA(value), "Bénéfice"]} />
                      <Bar dataKey="beneficeNet" fill="hsl(var(--chart-2))" name="Bénéfice net" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tableau comparatif</CardTitle>
              <Button size="sm" variant="outline" onClick={handleExportCSV} data-testid="export-csv">
                <Download className="h-4 w-4 mr-2" /> Exporter CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <SortableHead icon={sortIcon("nom")} onSort={() => toggleSort("nom")}>Bande</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("sujetsDepart")} onSort={() => toggleSort("sujetsDepart")}>Sujets départ</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("tauxMortalite")} onSort={() => toggleSort("tauxMortalite")}>Mortalité</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("totalVendus")} onSort={() => toggleSort("totalVendus")}>Vendus</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("dureeJours")} onSort={() => toggleSort("dureeJours")}>Durée (j)</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("coutParSujet")} onSort={() => toggleSort("coutParSujet")}>Coût/sujet</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("prixVenteMoyen")} onSort={() => toggleSort("prixVenteMoyen")}>Prix vente moy.</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("beneficeNet")} onSort={() => toggleSort("beneficeNet")}>Bénéfice net</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("seuilNombrePoulets")} onSort={() => toggleSort("seuilNombrePoulets")}>Seuil (nb poulets)</SortableHead>
                      <SortableHead className="text-right" icon={sortIcon("seuilPrixMin")} onSort={() => toggleSort("seuilPrixMin")}>Prix min seuil</SortableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((b) => (
                      <TableRow key={b.id as number}>
                        <TableCell className="font-medium">{b.nom as string}</TableCell>
                        <TableCell className="text-right">{b.sujetsDepart as number}</TableCell>
                        <TableCell className={`text-right ${(b.tauxMortalite as number) > 5 ? "text-red-600 font-medium" : ""}`}>
                          {b.tauxMortalite as number}%
                        </TableCell>
                        <TableCell className="text-right">{b.totalVendus as number}</TableCell>
                        <TableCell className="text-right">{b.dureeJours as number}</TableCell>
                        <TableCell className="text-right">{formatFCFA(b.coutParSujet as number)}</TableCell>
                        <TableCell className="text-right">{formatFCFA(b.prixVenteMoyen as number)}</TableCell>
                        <TableCell className={`text-right font-bold ${(b.beneficeNet as number) >= 0 ? "text-green-700" : "text-red-600"}`}>
                          {formatFCFA(b.beneficeNet as number)}
                        </TableCell>
                        <TableCell className="text-right">{b.seuilNombrePoulets as number}</TableCell>
                        <TableCell className="text-right">{formatFCFA(b.seuilPrixMin as number)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
