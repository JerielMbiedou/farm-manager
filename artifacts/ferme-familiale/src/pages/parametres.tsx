import { useState, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RotateCcw, Database, Download, PlayCircle } from "lucide-react";

type Parametre = {
  id: number;
  cle: string;
  valeur: string;
  description: string;
  categorie: string;
  updatedAt: string;
};

const CATEGORY_ORDER = [
  "Identité de la ferme",
  "Phases d'élevage",
  "Charges fixes",
  "Alertes",
  "Indice de conversion",
  "Budget construction",
  "Calendrier vaccinal",
  "Sauvegarde",
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Identité de la ferme": "Nom, contacts et devise affichés dans les en-têtes et les rapports PDF",
  "Phases d'élevage": "Bornes en jours qui définissent les phases démarrage / croissance / finition",
  "Charges fixes": "Taux utilisés pour calculer les charges fixes des bandes de poulets",
  "Alertes": "Seuils de déclenchement des alertes sur le tableau de bord et les fiches de bandes",
  "Indice de conversion": "Bornes pour qualifier l'indice de conversion alimentaire (IC)",
  "Budget construction": "Montants par défaut si aucun devis n'a été saisi",
  "Calendrier vaccinal": "Programme de vaccination appliqué automatiquement aux nouvelles bandes",
  "Sauvegarde": "Configuration de la sauvegarde automatique nocturne de la base de données",
};

const UNIT_LABELS: Record<string, string> = {
  taux_depreciation_materiel: "%",
  taux_imprevus: "%",
  seuil_mortalite_alerte_jour: "%",
  seuil_mortalite_alerte_jour_demarrage: "%",
  seuil_mortalite_alerte_jour_finition: "%",
  seuil_mortalite_alerte_cumul: "%",
  seuil_poids_alerte: "%",
  seuil_alerte_solde_caisse: "FCFA",
  budget_batiment_defaut: "FCFA",
  budget_carburant_defaut: "FCFA",
  phase_demarrage_min: "j",
  phase_demarrage_max: "j",
  phase_croissance_min: "j",
  phase_croissance_max: "j",
  phase_finition_min: "j",
  phase_finition_max: "j",
  duree_bande_cible: "j",
  backup_heure: "h",
  backup_retention_jours: "j",
};

export default function Parametres() {
  const { data: user } = useGetMe();
  const { toast } = useToast();
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Array<{ name: string; date: string; size: number }>>([]);
  const [backupRunning, setBackupRunning] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadParametres();
  }, []);

  useEffect(() => {
    if (isAdmin) loadBackups();
  }, [isAdmin]);

  async function loadBackups() {
    try {
      const res = await fetch(`${baseUrl}/backups`, { credentials: "include" });
      if (res.ok) setBackups(await res.json());
    } catch {}
  }

  async function triggerBackup() {
    setBackupRunning(true);
    try {
      const res = await fetch(`${baseUrl}/backups/run`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast({ title: "Sauvegarde créée" });
        loadBackups();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur", description: err.error || "Échec de la sauvegarde", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur de connexion", variant: "destructive" });
    } finally {
      setBackupRunning(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
  }

  async function loadParametres() {
    try {
      const res = await fetch(`${baseUrl}/parametres`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setParametres(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function saveParametre(cle: string) {
    const newValue = editedValues[cle];
    if (newValue === undefined) return;

    setSaving(cle);
    try {
      const res = await fetch(`${baseUrl}/parametres/${cle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ valeur: newValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        setParametres(prev => prev.map(p => p.cle === cle ? updated : p));
        setEditedValues(prev => {
          const next = { ...prev };
          delete next[cle];
          return next;
        });
        toast({ title: "Paramètre mis à jour" });
      } else {
        const err = await res.json();
        toast({ title: "Erreur", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur de connexion", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  function resetEdit(cle: string) {
    setEditedValues(prev => {
      const next = { ...prev };
      delete next[cle];
      return next;
    });
  }

  function getDisplayValue(p: Parametre) {
    return editedValues[p.cle] !== undefined ? editedValues[p.cle] : p.valeur;
  }

  function isModified(cle: string) {
    return editedValues[cle] !== undefined;
  }

  const grouped: Record<string, Parametre[]> = {};
  for (const p of parametres) {
    if (!grouped[p.categorie]) grouped[p.categorie] = [];
    grouped[p.categorie].push(p);
  }

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? "Valeurs et formules configurables de l'application" : "Consultation des valeurs et formules de l'application"}
        </p>
      </div>

      {sortedCategories.map(cat => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              {cat}
            </CardTitle>
            {CATEGORY_DESCRIPTIONS[cat] && (
              <CardDescription>{CATEGORY_DESCRIPTIONS[cat]}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grouped[cat].map(p => (
                <div key={p.cle} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{p.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">{p.cle}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin ? (
                      <>
                        <div className="relative">
                          <Input
                            className="w-40 text-right pr-12"
                            value={getDisplayValue(p)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === p.valeur) {
                                resetEdit(p.cle);
                              } else {
                                setEditedValues(prev => ({ ...prev, [p.cle]: val }));
                              }
                            }}
                          />
                          {UNIT_LABELS[p.cle] && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {UNIT_LABELS[p.cle]}
                            </span>
                          )}
                        </div>
                        {isModified(p.cle) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resetEdit(p.cle)}
                              disabled={saving === p.cle}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveParametre(p.cle)}
                              disabled={saving === p.cle}
                            >
                              <Save className="h-3.5 w-3.5 mr-1" />
                              {saving === p.cle ? "..." : "Enregistrer"}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                        {p.valeur}
                        {UNIT_LABELS[p.cle] && (
                          <span className="text-muted-foreground ml-1">{UNIT_LABELS[p.cle]}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              Sauvegardes automatiques
            </CardTitle>
            <CardDescription>
              Une sauvegarde complète de la base est créée chaque nuit à 02:00. Les 7 dernières sont conservées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <a
                href={`${baseUrl}/backups/sql-dump`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent transition-colors"
                title="Télécharge un dump SQL natif PostgreSQL (restaurable avec psql)"
              >
                <Download className="h-4 w-4" /> Dump SQL natif
              </a>
              <Button onClick={triggerBackup} disabled={backupRunning} size="sm" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                {backupRunning ? "Sauvegarde en cours…" : "Lancer une sauvegarde JSON"}
              </Button>
            </div>
            {backups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune sauvegarde disponible pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {backups.map(b => (
                  <div key={b.name} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(b.date).toLocaleString("fr-FR")} • {formatSize(b.size)}
                      </div>
                    </div>
                    <a
                      href={`${baseUrl}/backups/${b.name}/download`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" /> Télécharger
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
