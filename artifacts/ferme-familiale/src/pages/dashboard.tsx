import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFCFA } from "@/lib/format";
import { Wallet, Receipt, Construction, Bird, AlertTriangle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) return <div>Chargement du tableau de bord...</div>;
  if (error || !summary) return <div className="text-destructive">Erreur de chargement des données.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de l'exploitation familiale</p>
        </div>
      </div>

      {summary.alerteDepassementBudget && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">Attention: Les dépenses de construction ont dépassé le budget prévu (devis).</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-secondary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investi
            </CardTitle>
            <Wallet className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalFinance)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dépenses Construction
            </CardTitle>
            <Construction className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalDepenseConstruction)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {formatFCFA(summary.totalDevis)} (Devis)
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-accent shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Caisse Disponible
            </CardTitle>
            <Receipt className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.caisseDisponible)}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sidebar-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bandes Actives
            </CardTitle>
            <Bird className="h-4 w-4 text-sidebar-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.bandesActives.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {summary.nombreBandes} au total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Dépenses par catégorie (Bandes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {summary.depensesParCategorie && summary.depensesParCategorie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.depensesParCategorie}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="categorie" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      fontSize={12}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      fontSize={12}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatFCFA(value), "Montant"]}
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                    />
                    <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Résumé des bandes actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.bandesActives.length > 0 ? (
                summary.bandesActives.map(bande => (
                  <div key={bande.id} className="flex flex-col space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{bande.nom}</span>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {bande.sujetsVivants} sujets
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs block">Coût prod.</span>
                        <span className="font-medium">{formatFCFA(bande.coutProduction)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Recettes</span>
                        <span className="font-medium">{formatFCFA(bande.totalRecettes)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune bande active
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
