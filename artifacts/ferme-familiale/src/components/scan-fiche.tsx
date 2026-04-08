import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Camera, Upload, Loader2, Check, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractedDay {
  jour: string;
  date: string | null;
  alimentationKg: number | null;
  eauLitres: number | null;
  mortalite: number;
  observations: string;
}

interface ExtractedData {
  semaine: number | null;
  periodeDu: string | null;
  periodeAu: string | null;
  effectifDebut: number | null;
  poidsMoyenFinSemaine: number | null;
  jours: ExtractedDay[];
}

interface ScanFicheProps {
  bandeId: number;
  bandeStartDate: string;
  onDataSaved: () => void;
}

const JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

function jourToDate(jourName: string, periodeDu: string | null): string | null {
  if (!periodeDu) return null;
  const start = new Date(periodeDu + "T00:00:00");
  if (isNaN(start.getTime())) return null;
  const jourIndex = JOURS_SEMAINE.indexOf(jourName.toLowerCase());
  if (jourIndex === -1) return null;
  const startDow = (start.getDay() + 6) % 7;
  const diff = jourIndex - startDow;
  const d = new Date(start);
  d.setDate(d.getDate() + (diff >= 0 ? diff : diff + 7));
  return d.toISOString().split("T")[0];
}

export default function ScanFiche({ bandeId, bandeStartDate, onDataSaved }: ScanFicheProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [editData, setEditData] = useState<ExtractedDay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function reset() {
    setPreview(null);
    setExtracted(null);
    setEditData([]);
    setError(null);
    setScanning(false);
    setSaving(false);
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image (JPG, PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setScanning(true);
    setError(null);
    setExtracted(null);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const base = import.meta.env.BASE_URL || "/";
      const resp = await fetch(`${base}api/ocr-fiche`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'analyse");
      }

      const data: ExtractedData = await resp.json();
      setExtracted(data);
      setEditData(data.jours.map(j => ({ ...j })));
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'analyse de l'image");
    } finally {
      setScanning(false);
    }
  }

  function updateDay(index: number, field: keyof ExtractedDay, value: any) {
    setEditData(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  async function handleSave() {
    if (!extracted) return;
    setSaving(true);
    const base = import.meta.env.BASE_URL || "/";
    const bandStart = new Date(bandeStartDate + "T00:00:00");
    let savedCount = 0;
    let errors: string[] = [];

    for (const day of editData) {
      const dateStr = day.date || jourToDate(day.jour, extracted.periodeDu);
      if (!dateStr) {
        errors.push(`Date introuvable pour ${day.jour}`);
        continue;
      }

      const entryDate = new Date(dateStr + "T00:00:00");
      const ageJours = Math.floor((entryDate.getTime() - bandStart.getTime()) / 86400000) + 1;
      if (ageJours < 1) {
        errors.push(`${day.jour} : date antérieure au début de la bande`);
        continue;
      }

      try {
        let dayOk = true;

        if (day.alimentationKg != null && day.alimentationKg > 0) {
          const r = await fetch(`${base}api/bandes/${bandeId}/consommation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date: dateStr, quantiteKg: day.alimentationKg, typeAliment: "Standard" }),
          });
          if (!r.ok) { dayOk = false; errors.push(`${day.jour} : erreur aliment`); }
        }

        if (day.eauLitres != null && day.eauLitres > 0) {
          const r = await fetch(`${base}api/bandes/${bandeId}/consommation-eau`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date: dateStr, ageJours, quantiteLitres: day.eauLitres }),
          });
          if (!r.ok) { dayOk = false; errors.push(`${day.jour} : erreur eau`); }
        }

        if (day.mortalite > 0) {
          const r = await fetch(`${base}api/bandes/${bandeId}/mortalite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date: dateStr, ageJours, decesJour: day.mortalite }),
          });
          if (!r.ok) { dayOk = false; errors.push(`${day.jour} : erreur mortalité`); }
        }

        if (day.observations && day.observations.trim() !== "") {
          const r = await fetch(`${base}api/bandes/${bandeId}/observations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date: dateStr, ageJours, contenu: day.observations }),
          });
          if (!r.ok) { dayOk = false; errors.push(`${day.jour} : erreur observations`); }
        }

        if (dayOk) savedCount++;
      } catch (err: any) {
        errors.push(`${day.jour} : ${err.message}`);
      }
    }

    if (extracted.poidsMoyenFinSemaine && extracted.poidsMoyenFinSemaine > 0 && extracted.periodeAu) {
      const endDate = new Date(extracted.periodeAu + "T00:00:00");
      const ageFinSemaine = Math.floor((endDate.getTime() - bandStart.getTime()) / 86400000) + 1;
      if (ageFinSemaine > 0) {
        try {
          const r = await fetch(`${base}api/bandes/${bandeId}/pesees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date: extracted.periodeAu, ageJours: ageFinSemaine, poidsMoyenG: extracted.poidsMoyenFinSemaine }),
          });
          if (!r.ok) errors.push("Erreur enregistrement poids moyen");
        } catch {}
      }
    }

    setSaving(false);

    if (errors.length > 0) {
      toast({
        title: `${savedCount} jour(s) enregistré(s) avec ${errors.length} erreur(s)`,
        description: errors.join("; "),
        variant: "destructive",
      });
    } else {
      toast({ title: `${savedCount} jour(s) enregistré(s) avec succès` });
    }

    onDataSaved();
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" /> Scanner fiche de suivi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Scanner une fiche de suivi</DialogTitle>
        </DialogHeader>

        {!extracted && !scanning && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Prenez en photo ou importez l'image de la fiche de suivi hebdomadaire remplie par le fermier. 
              L'IA va lire les données et les pré-remplir pour validation avant enregistrement.
            </p>
            <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg">
              <Camera className="h-12 w-12 text-muted-foreground" />
              <div className="flex gap-3">
                <Button onClick={() => fileRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Choisir une image
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG - max 8 Mo</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded text-sm dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center gap-4 p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyse de la fiche en cours...</p>
            {preview && <img src={preview} alt="Fiche" className="max-h-48 rounded border" />}
          </div>
        )}

        {extracted && editData.length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-4">
              {preview && <img src={preview} alt="Fiche" className="max-h-32 rounded border" />}
              <div className="space-y-1 text-sm">
                {extracted.semaine != null && <p>Semaine N° : <strong>{extracted.semaine}</strong></p>}
                {extracted.periodeDu && <p>Période : <strong>{extracted.periodeDu}</strong> au <strong>{extracted.periodeAu}</strong></p>}
                {extracted.effectifDebut != null && <p>Effectif début : <strong>{extracted.effectifDebut}</strong></p>}
                {extracted.poidsMoyenFinSemaine != null && <p>Poids moyen fin semaine : <strong>{extracted.poidsMoyenFinSemaine} g</strong></p>}
              </div>
            </div>

            <p className="text-sm font-medium">Vérifiez et corrigez les données avant de les enregistrer :</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jour</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Aliment (kg)</TableHead>
                  <TableHead>Eau (L)</TableHead>
                  <TableHead>Mortalité</TableHead>
                  <TableHead>Observations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editData.map((day, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium capitalize">{day.jour}</TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        className="w-36 h-8"
                        value={day.date ?? ""}
                        onChange={(e) => updateDay(i, "date", e.target.value || null)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        className="w-20 h-8"
                        value={day.alimentationKg ?? ""}
                        onChange={(e) => updateDay(i, "alimentationKg", e.target.value ? Number(e.target.value) : null)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        className="w-20 h-8"
                        value={day.eauLitres ?? ""}
                        onChange={(e) => updateDay(i, "eauLitres", e.target.value ? Number(e.target.value) : null)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-16 h-8"
                        value={day.mortalite}
                        onChange={(e) => updateDay(i, "mortalite", Number(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8"
                        value={day.observations}
                        onChange={(e) => updateDay(i, "observations", e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded text-sm dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="gap-2">
                  <X className="h-4 w-4" /> Annuler
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Enregistrement..." : "Enregistrer les données"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {extracted && editData.length === 0 && (
          <div className="flex flex-col items-center gap-4 p-8">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
            <p>Aucune donnée n'a pu être extraite de cette image. Essayez avec une photo plus nette.</p>
            <Button onClick={reset} variant="outline">Réessayer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
