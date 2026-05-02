import { Router } from "express";
import { db, actifsTable, bandeActifsTable, bandesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireWriteAccess } from "../lib/middleware";
import { logFromRequest } from "./activity-log";

const router = Router();

const VALID_TYPES = new Set(["terrain", "batiment", "materiel"]);

// P5: Compute residual value for an asset based on usage by closed bandes.
// amortissement = valeur × (taux/100) × nombre de bandes terminées qui ont utilisé l'actif (pondéré par fractionUtilisee)
async function computeAmortissementContext() {
  const bandes = await db.select().from(bandesTable);
  const closedBandeIds = new Set(bandes.filter(b => b.statut === "terminee").map(b => b.id));
  const allAlloc = await db.select().from(bandeActifsTable);
  const usageByActif = new Map<number, number>();
  for (const a of allAlloc) {
    if (!closedBandeIds.has(a.bandeId)) continue;
    const fraction = parseFloat(a.fractionUtilisee ?? "1");
    usageByActif.set(a.actifId, (usageByActif.get(a.actifId) ?? 0) + fraction);
  }
  return usageByActif;
}

router.get("/", async (_req, res) => {
  const actifs = await db.select().from(actifsTable).orderBy(actifsTable.dateAcquisition);
  const usageByActif = await computeAmortissementContext();

  const result = actifs.map(a => {
    const valeur = parseFloat(a.valeur);
    const taux = parseFloat(a.tauxAmortissementAnnuel);
    const nbBandesUtilisees = usageByActif.get(a.id) ?? 0;
    // Amortissement = valeur × (taux/100) × nb bandes terminées (capé à valeur)
    const amortissementBrut = valeur * (taux / 100) * nbBandesUtilisees;
    const amortissementCumule = Math.min(valeur, amortissementBrut);
    const valeurResiduelle = Math.max(0, valeur - amortissementCumule);
    return {
      ...a,
      valeur,
      tauxAmortissementAnnuel: taux,
      nbBandesUtilisees: Math.round(nbBandesUtilisees * 100) / 100,
      amortissementCumule: Math.round(amortissementCumule),
      valeurResiduelle: Math.round(valeurResiduelle),
    };
  });
  res.json(result);
});

router.post("/", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { nom, type, valeur, tauxAmortissementAnnuel, dateAcquisition, description } = req.body;
  if (!nom || !type || !valeur || !dateAcquisition) return res.status(400).json({ message: "Champs requis manquants" });
  if (!VALID_TYPES.has(type)) return res.status(400).json({ message: "Type d'actif invalide (terrain, batiment ou materiel)" });
  const rows = await db.insert(actifsTable).values({
    nom, type, valeur: String(valeur), tauxAmortissementAnnuel: String(tauxAmortissementAnnuel ?? 0), dateAcquisition, description
  }).returning();
  await logFromRequest(req, "Ajout actif", `${nom} (${type}) | ${valeur} FCFA`);
  res.status(201).json({ ...rows[0], valeur: parseFloat(rows[0].valeur), tauxAmortissementAnnuel: parseFloat(rows[0].tauxAmortissementAnnuel) });
});

router.put("/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const { nom, type, valeur, tauxAmortissementAnnuel, dateAcquisition, description } = req.body;
  if (type && !VALID_TYPES.has(type)) return res.status(400).json({ message: "Type d'actif invalide (terrain, batiment ou materiel)" });
  const rows = await db.update(actifsTable).set({ nom, type, valeur: String(valeur), tauxAmortissementAnnuel: String(tauxAmortissementAnnuel), dateAcquisition, description }).where(eq(actifsTable.id, id)).returning();
  if (rows.length === 0) return res.status(404).json({ message: "Actif introuvable" });
  await logFromRequest(req, "Modification actif", `[ID ${id}] ${nom}`);
  res.json({ ...rows[0], valeur: parseFloat(rows[0].valeur), tauxAmortissementAnnuel: parseFloat(rows[0].tauxAmortissementAnnuel) });
});

router.delete("/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const before = (await db.select().from(actifsTable).where(eq(actifsTable.id, id)))[0];
  await db.delete(bandeActifsTable).where(eq(bandeActifsTable.actifId, id));
  await db.delete(actifsTable).where(eq(actifsTable.id, id));
  await logFromRequest(req, "Suppression actif", before ? `${before.nom} (${before.type})` : `ID: ${id}`);
  res.json({ success: true });
});

router.get("/:id/bande-allocations", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(bandeActifsTable).where(eq(bandeActifsTable.actifId, id));
  res.json(rows);
});

export default router;
