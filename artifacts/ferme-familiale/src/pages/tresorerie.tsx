import { useListBandes, useGetMe } from "@workspace/api-client-react";
import { useStockAliments } from "@/lib/stocks-api";
import { formatFCFA } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";

export default function Tresorerie() {
  const { data: bandes, isLoading } = useListBandes();
  const { data: stockData } = useStockAliments();

  if (isLoading) return <div>Chargement...</div>;

  const bandesList = bandes || [];

  const tresorerieData = bandesList.map((b: any) => ({
    nom: b.nom,
    depenses: b.totalDepenses || 0,
    recettes: b.totalRecettes || 0,
    benefice: (b.totalRecettes || 0) - (b.totalDepenses || 0),
  }));

  const totalDepenses = tresorerieData.reduce((s: number, d: any) => s + d.depenses, 0);
  const totalRecettes = tresorerieData.reduce((s: number, d: any) => s + d.recettes, 0);
  const solde = totalRecettes - totalDepenses;

  const coutStockAliments = stockData?.items
    ?.filter((i: any) => i.type === "entree" && i.prixUnitaire)
    ?.reduce((s: number, i: any) => s + i.quantiteKg * i.prixUnitaire, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Prévision de trésorerie</h1>
        <p className="text-muted-foreground mt-1">Vue globale des flux financiers de l'exploitation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-600" /> Total dépenses
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatFCFA(totalDepenses)}</div></CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" /> Total recettes
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatFCFA(totalRecettes)}</div></CardContent>
        </Card>
        <Card className={`border-t-4 ${solde >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Wallet className="h-4 w-4" /> Solde
            </CardTitle>
          </CardHeader>
          <CardContent><div className={`text-2xl font-bold ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(solde)}</div></CardContent>
        </Card>
      </div>

      {tresorerieData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl font-serif">Dépenses vs Recettes par bande</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tresorerieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" />
                <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => formatFCFA(value)} />
                <Legend />
                <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recettes" name="Recettes" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-xl font-serif">Détails par bande</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Bande</TableHead>
                  <TableHead className="text-right">Dépenses</TableHead>
                  <TableHead className="text-right">Recettes</TableHead>
                  <TableHead className="text-right">Résultat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tresorerieData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucune bande</TableCell></TableRow>
                ) : (
                  tresorerieData.map((d: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{d.nom}</TableCell>
                      <TableCell className="text-right text-red-600">{formatFCFA(d.depenses)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatFCFA(d.recettes)}</TableCell>
                      <TableCell className={`text-right font-bold ${d.benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(d.benefice)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {coutStockAliments > 0 && (
        <Card className="bg-muted/30">
          <CardHeader><CardTitle className="text-lg font-serif">Coût des stocks</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Valeur du stock d'aliments</span>
              <span className="font-medium">{formatFCFA(coutStockAliments)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
