import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFCFA } from "@/lib/format";
import { Wallet, Receipt, Construction, Bird, AlertTriangle, Syringe, Skull, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Chargement du tableau de bord...</div>;
  if (error || !summary) return <div className="text-destructive">Erreur de chargement des données.</div>;

  const s = summary as Record<string, unknown>;
  const prochainesVaccinations = (s.prochainesVaccinations as Array<{ bandeNom: string; vaccinNom: string; datePrevue: string; enRetard: boolean }>) || [];
  const previsions = s.previsions as { coutProductionEstime: number; beneficeProbable: number; dureeMoyenneJours: number } | null;
  const totalRembourse = (s.totalRembourse as number) || 0;

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
        <Card className="border-t-4 border-t-accent shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Caisse disponible</CardTitle>
            <Receipt className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.caisseDisponible)}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-secondary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total investi</CardTitle>
            <Wallet className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalFinance)}</div>
            {totalRembourse > 0 && <p className="text-xs text-muted-foreground mt-1">Remboursé : {formatFCFA(totalRembourse)}</p>}
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses construction</CardTitle>
            <Construction className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalDepenseConstruction)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {formatFCFA(summary.totalDevis)} (devis)</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sidebar-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bandes actives</CardTitle>
            <Bird className="h-4 w-4 text-sidebar-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.bandesActives.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {summary.nombreBandes} au total</p>
          </CardContent>
        </Card>
      </div>

      {prochainesVaccinations.length > 0 && (
        <Card className="shadow-sm border-l-4 border-l-orange-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Syringe className="h-5 w-5 text-orange-500" />
              Prochaines vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prochainesVaccinations.map((v, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-md text-sm ${v.enRetard ? "bg-red-50 border border-red-200 text-red-800" : "bg-muted/30"}`}>
                  <div>
                    <span className="font-medium">{v.vaccinNom}</span>
                    <span className="text-muted-foreground ml-2">({v.bandeNom})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{v.datePrevue}</span>
                    {v.enRetard && <span className="text-xs font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">EN RETARD</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-muted-foreground" />
              Bandes actives - Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.bandesActives.length > 0 ? (
                (summary.bandesActives as Array<Record<string, unknown>>).map((bande: Record<string, unknown>) => (
                  <Link key={bande.id as number} href={`/bandes/${bande.id}`}>
                    <div className="flex flex-col space-y-2 p-3 bg-muted/30 rounded-lg border hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{bande.nom as string}</span>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {bande.sujetsVivants as number} sujets
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block">Coût prod.</span>
                          <span className="font-medium">{formatFCFA(bande.coutProduction as number)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Recettes</span>
                          <span className="font-medium">{formatFCFA(bande.totalRecettes as number)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Mortalité</span>
                          <span className={`font-medium ${(bande.tauxMortalite as number) > 5 ? "text-red-600" : ""}`}>
                            {bande.tauxMortalite as number}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">Aucune bande active</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {previsions && (
            <Card className="shadow-sm border-l-4 border-l-blue-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Prévisions (prochaine bande)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-muted-foreground text-xs block">Coût estimé</span>
                    <span className="font-bold text-lg">{formatFCFA(previsions.coutProductionEstime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Bénéfice probable</span>
                    <span className={`font-bold text-lg ${previsions.beneficeProbable >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatFCFA(previsions.beneficeProbable)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Durée moyenne</span>
                    <span className="font-bold text-lg">{previsions.dureeMoyenneJours}j</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Dépenses par catégorie (Bandes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {summary.depensesParCategorie && summary.depensesParCategorie.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.depensesParCategorie}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="categorie" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip formatter={(value: number) => [formatFCFA(value), "Montant"]} cursor={{ fill: "hsl(var(--muted)/0.5)" }} />
                      <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Aucune donnée disponible</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
