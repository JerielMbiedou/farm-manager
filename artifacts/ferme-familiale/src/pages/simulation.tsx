import { useState } from "react";
import { formatFCFA } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Simulation() {
  const [nbSujets, setNbSujets] = useState(1000);
  const [prixPoussin, setPrixPoussin] = useState(550);
  const [prixAlimentKg, setPrixAlimentKg] = useState(350);
  const [consommationKgParSujet, setConsommationKgParSujet] = useState(4.5);
  const [tauxMortalite, setTauxMortalite] = useState(5);
  const [prixVenteParPoulet, setPrixVenteParPoulet] = useState(3500);
  const [coutVeterinaire, setCoutVeterinaire] = useState(150);
  const [coutMainOeuvre, setCoutMainOeuvre] = useState(110000);
  const [coutTransport, setCoutTransport] = useState(50000);
  const [autresDepenses, setAutresDepenses] = useState(100000);
  const [dureeJours, setDureeJours] = useState(45);
  const [valeurMateriel, setValeurMateriel] = useState(600000);
  const [loyer, setLoyer] = useState(0);
  const [calculated, setCalculated] = useState(false);

  const sujetsVendus = Math.round(nbSujets * (1 - tauxMortalite / 100));
  const coutPoussins = nbSujets * prixPoussin;
  const coutAliments = nbSujets * consommationKgParSujet * prixAlimentKg;
  const coutVeto = nbSujets * coutVeterinaire;
  const totalDepenses = coutPoussins + coutAliments + coutVeto + coutMainOeuvre + coutTransport + autresDepenses;
  const depreciation = valeurMateriel * 0.10;
  const imprevus = totalDepenses * 0.05;
  const chargesFixes = depreciation + imprevus + loyer;
  const totalCouts = totalDepenses + chargesFixes;
  const totalRecettes = sujetsVendus * prixVenteParPoulet;
  const beneficeNet = totalRecettes - totalCouts;
  const marge = totalRecettes > 0 ? (beneficeNet / totalRecettes * 100) : 0;
  const coutParSujet = nbSujets > 0 ? totalCouts / nbSujets : 0;
  const coutParSujetVendu = sujetsVendus > 0 ? totalCouts / sujetsVendus : 0;
  const seuilRentabilite = prixVenteParPoulet > 0 ? Math.ceil(totalCouts / prixVenteParPoulet) : 0;
  const prixMinVente = sujetsVendus > 0 ? Math.ceil(totalCouts / sujetsVendus) : 0;

  const chartData = [
    { name: "Poussins", value: coutPoussins, color: "#f59e0b" },
    { name: "Aliments", value: coutAliments, color: "#10b981" },
    { name: "Vétérinaire", value: coutVeto, color: "#6366f1" },
    { name: "Main-d'oeuvre", value: coutMainOeuvre, color: "#ec4899" },
    { name: "Transport", value: coutTransport, color: "#8b5cf6" },
    { name: "Autres", value: autresDepenses, color: "#78716c" },
    { name: "Charges fixes", value: chargesFixes, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Simulation de rentabilité</h1>
        <p className="text-muted-foreground mt-1">Estimez les coûts et recettes avant de lancer une bande</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Paramètres de production</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Nombre de sujets</label>
                  <Input type="number" value={nbSujets} onChange={e => setNbSujets(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Durée (jours)</label>
                  <Input type="number" value={dureeJours} onChange={e => setDureeJours(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Prix poussin (FCFA)</label>
                  <Input type="number" value={prixPoussin} onChange={e => setPrixPoussin(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Taux mortalité (%)</label>
                  <Input type="number" value={tauxMortalite} onChange={e => setTauxMortalite(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Coûts estimés</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Prix aliment / kg (FCFA)</label>
                  <Input type="number" value={prixAlimentKg} onChange={e => setPrixAlimentKg(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Consommation kg / sujet</label>
                  <Input type="number" step="0.1" value={consommationKgParSujet} onChange={e => setConsommationKgParSujet(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Coût vétérinaire / sujet</label>
                  <Input type="number" value={coutVeterinaire} onChange={e => setCoutVeterinaire(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Main-d'oeuvre totale</label>
                  <Input type="number" value={coutMainOeuvre} onChange={e => setCoutMainOeuvre(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Transport</label>
                  <Input type="number" value={coutTransport} onChange={e => setCoutTransport(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Autres dépenses</label>
                  <Input type="number" value={autresDepenses} onChange={e => setAutresDepenses(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Valeur matériel fixe</label>
                  <Input type="number" value={valeurMateriel} onChange={e => setValeurMateriel(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Loyer</label>
                  <Input type="number" value={loyer} onChange={e => setLoyer(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Recettes estimées</CardTitle></CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium">Prix de vente par poulet (FCFA)</label>
                <Input type="number" value={prixVenteParPoulet} onChange={e => setPrixVenteParPoulet(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full gap-2" size="lg" onClick={() => setCalculated(true)}>
            <Calculator className="h-5 w-5" /> Calculer la rentabilité
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <Card className={`border-t-4 ${beneficeNet >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                {beneficeNet >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                Bénéfice net estimé
              </CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${beneficeNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(beneficeNet)}</div></CardContent>
            </Card>
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Marge</CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>{marge.toFixed(1)}%</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Résumé financier</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Sujets au départ</span><span className="font-medium">{nbSujets}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Sujets vendus (estimés)</span><span className="font-medium">{sujetsVendus}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Coût total production</span><span className="font-medium text-red-600">{formatFCFA(totalDepenses)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Charges fixes</span><span className="font-medium text-red-600">{formatFCFA(chargesFixes)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground font-semibold">Coût total</span><span className="font-bold text-red-600">{formatFCFA(totalCouts)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Recettes totales</span><span className="font-medium text-green-600">{formatFCFA(totalRecettes)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Coût par sujet</span><span className="font-medium">{formatFCFA(coutParSujet)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Coût par sujet vendu</span><span className="font-medium">{formatFCFA(coutParSujetVendu)}</span></div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader><CardTitle className="text-lg font-serif flex items-center gap-2"><Target className="h-5 w-5" /> Seuil de rentabilité</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Poulets minimum à vendre</span>
                <span className="font-bold">{seuilRentabilite} poulets</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Prix minimum de vente</span>
                <span className="font-bold">{formatFCFA(prixMinVente)} / poulet</span>
              </div>
              {seuilRentabilite > sujetsVendus && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4" /> Le seuil de rentabilité dépasse le nombre de sujets vendus estimés
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Répartition des coûts</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatFCFA(value)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
