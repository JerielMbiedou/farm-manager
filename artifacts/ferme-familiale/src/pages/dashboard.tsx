import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatFCFA } from "@/lib/format";
import { Graphique, resumeValeurs } from "@/components/graphique";
import { Wallet, Receipt, Construction, Bird, AlertTriangle, Syringe, TrendingUp, ArrowRight, Check, Calendar, Scale, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "wouter";
import SaisieRapide from "@/components/saisie-rapide";
import JournalDuJour from "@/components/journal-du-jour";
import { useState } from "react";

type ProchaineVacc = {
  bandeId: number;
  bandeNom: string;
  vaccinId: number;
  vaccinNom: string;
  datePrevue: string;
  enRetard: boolean;
};

type AlerteMortalite = {
  bandeNom: string;
  tauxJour: number;
  seuilApplicable: number;
  date: string;
  ageJours: number;
};

type BandeActiveCard = {
  id: number;
  nom: string;
  dateDeDepart: string;
  statut: string;
  sujetsDepart: number;
  sujetsVivants: number;
  coutProduction: number;
  totalRecettes: number;
  beneficeEstime: number;
  tauxMortalite: number;
  totalDeces: number;
  totalVendus: number;
  ageActuelJours: number | null;
  joursAvantAbattage: number | null;
  dernierPoidsMoyen: number | null;
  dateDernierePesee: string | null;
  icActuel: number | null;
  icStatus: string | null;
  gmqGrams: number | null;
  mortDernieres24h: number;
};

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [journalBande, setJournalBande] = useState<BandeActiveCard | null>(null);

  if (isLoading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Chargement du tableau de bord...</span>
    </div>
  );
  if (error || !summary) return <div className="text-destructive">Erreur de chargement des données.</div>;

  const s = summary as unknown as Record<string, unknown>;
  const prochainesVaccinations = (s.prochainesVaccinations as ProchaineVacc[]) || [];
  const previsions = s.previsions as { coutProductionEstime: number; beneficeProbable: number; dureeMoyenneJours: number } | null;
  const totalRembourse = (s.totalRembourse as number) || 0;
  const alerteMortaliteActive = (s.alerteMortaliteActive as AlerteMortalite | null) || null;
  const alerteSoldeBas = !!s.alerteSoldeBas;
  const seuilSoldeCaisse = (s.seuilSoldeCaisse as number) || 0;
  const bandesActives = (summary.bandesActives as unknown as BandeActiveCard[]) || [];

  const markVaccinDone = async (bandeId: number, vaccinId: number) => {
    try {
      const base = import.meta.env.BASE_URL || "/";
      const today = new Date().toISOString().split("T")[0];
      const r = await fetch(`${base}api/bandes/${bandeId}/vaccinations/${vaccinId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fait: "oui", dateFait: today }),
      });
      if (!r.ok) throw new Error("Erreur API");
      toast({ title: "Vaccination marquée comme faite" });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    } catch {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre exploitation avicole</p>
      </div>

      {(alerteMortaliteActive || alerteSoldeBas || summary.alerteDepassementBudget) && (
        <div className="space-y-2">
          {alerteMortaliteActive && (
            <div className="bg-card shadow-sm px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-destructive" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Alerte mortalité — Bande {alerteMortaliteActive.bandeNom}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  Taux journalier de {alerteMortaliteActive.tauxJour} % à J{alerteMortaliteActive.ageJours} ({alerteMortaliteActive.date}) — seuil applicable : {alerteMortaliteActive.seuilApplicable} %.
                </p>
              </div>
            </div>
          )}
          {alerteSoldeBas && (
            <div className="bg-card shadow-sm px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-orange-700" aria-hidden="true" />
              <p className="font-medium text-sm">
                Solde caisse bas : {formatFCFA(summary.caisseDisponible)} (seuil {formatFCFA(seuilSoldeCaisse)}).
              </p>
            </div>
          )}
          {summary.alerteDepassementBudget && (
            <div className="bg-card shadow-sm px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              <p className="font-medium text-sm">Attention : les dépenses de construction ont dépassé le budget prévu (devis).</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Caisse disponible</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${alerteSoldeBas ? "text-orange-700" : "text-foreground"}`}>{formatFCFA(summary.caisseDisponible)}</div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total investi</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalFinance)}</div>
            {totalRembourse > 0 && <p className="text-xs text-muted-foreground mt-1">Remboursé : {formatFCFA(totalRembourse)}</p>}
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses construction</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Construction className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary.totalDepenseConstruction)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {formatFCFA(summary.totalDevis)} (devis)</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bandes actives</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Bird className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.bandesActives.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {summary.nombreBandes} au total</p>
          </CardContent>
        </Card>
      </div>

      {prochainesVaccinations.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-md bg-orange-100 flex items-center justify-center">
                <Syringe className="h-4 w-4 text-orange-700" />
              </div>
              Prochaines vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Liste groupée : lignes séparées par un filet ; le retard se lit au badge et à la date en rouge. */}
            <div className="divide-y">
              {prochainesVaccinations.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{v.vaccinNom}</span>
                    <span className="text-muted-foreground ml-2">({v.bandeNom})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs ${v.enRetard ? "text-destructive font-medium" : "text-muted-foreground"}`}>{v.datePrevue}</span>
                    {v.enRetard && <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">En retard</span>}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => markVaccinDone(v.bandeId, v.vaccinId)}
                    >
                      <Check className="h-3 w-3" /> Fait aujourd'hui
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SaisieRapide />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bird className="h-5 w-5 text-primary" />
              Bandes actives — Production
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {bandesActives.length > 0 ? (
                bandesActives.map((bande) => {
                  const icColor = bande.icStatus === "bon" ? "text-green-700"
                    : bande.icStatus === "moyen" ? "text-orange-700"
                    : bande.icStatus === "mauvais" ? "text-red-600"
                    : "text-muted-foreground";
                  return (
                  <Link key={bande.id} href={`/bandes/${bande.id}`}>
                    <div className="flex flex-col space-y-2 p-3 bg-muted/20 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold truncate">{bande.nom}</span>
                          {bande.ageActuelJours != null && (
                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">J{bande.ageActuelJours}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="h-7 px-2 bg-green-700 hover:bg-green-800 text-white text-xs gap-1"
                            data-testid={`button-saisir-journee-${bande.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setJournalBande(bande);
                            }}
                          >
                            📋 Saisir la journée
                          </Button>
                          <span className="text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                            {bande.sujetsVivants} sujets
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block">Coût prod.</span>
                          <span className="font-medium">{formatFCFA(bande.coutProduction)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Recettes</span>
                          <span className="font-medium">{formatFCFA(bande.totalRecettes)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Mortalité</span>
                          <span className={`font-medium ${bande.tauxMortalite > 5 ? "text-red-600" : "text-green-700"}`}>
                            {bande.tauxMortalite} %
                            {bande.mortDernieres24h > 0 && (
                              <span className="text-xs text-red-600 ml-1">(+{bande.mortDernieres24h}/24h)</span>
                            )}
                          </span>
                        </div>
                      </div>
                      {(bande.dernierPoidsMoyen != null || bande.icActuel != null || bande.joursAvantAbattage != null) && (
                        <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-muted">
                          <div className="flex items-center gap-1">
                            <Scale className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Poids</span>
                              <span className="font-medium">
                                {bande.dernierPoidsMoyen != null ? `${Math.round(bande.dernierPoidsMoyen)} g` : "—"}
                                {bande.gmqGrams != null && <span className="text-muted-foreground ml-1">({bande.gmqGrams}g/j)</span>}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">IC</span>
                              <span className={`font-medium ${icColor}`}>
                                {bande.icActuel != null ? bande.icActuel : "—"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Abattage</span>
                              <span className="font-medium">
                                {bande.joursAvantAbattage != null ? (bande.joursAvantAbattage > 0 ? `J-${bande.joursAvantAbattage}` : "Maintenant") : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Bird className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune bande active</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {journalBande && (
          <JournalDuJour
            bande={{
              id: journalBande.id,
              nom: journalBande.nom,
              dateDeDepart: journalBande.dateDeDepart,
              statut: journalBande.statut,
            }}
            open={!!journalBande}
            onOpenChange={(o) => { if (!o) setJournalBande(null); }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            }}
          />
        )}

        <div className="space-y-6">
          {previsions && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-blue-50/50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  Prévisions (prochaine bande)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Coût estimé</span>
                    <span className="font-bold text-lg">{formatFCFA(previsions.coutProductionEstime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Bénéfice probable</span>
                    <span className={`font-bold text-lg ${previsions.beneficeProbable >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {formatFCFA(previsions.beneficeProbable)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Durée moyenne</span>
                    <span className="font-bold text-lg">{previsions.dureeMoyenneJours} j</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base">Dépenses par catégorie (Bandes)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px]">
                {summary.depensesParCategorie && summary.depensesParCategorie.length > 0 ? (
                  <Graphique className="h-full" resume={resumeValeurs("Dépenses par catégorie", summary.depensesParCategorie.map((d: any) => ({ nom: d.categorie, valeur: d.montant })), formatFCFA)}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.depensesParCategorie}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="categorie" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={11} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip formatter={(value: number) => [formatFCFA(value), "Montant"]} cursor={{ fill: "hsl(var(--muted)/0.5)" }} />
                        <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Graphique>
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
