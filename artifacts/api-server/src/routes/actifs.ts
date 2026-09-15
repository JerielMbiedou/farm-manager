import { Router } from "express";
import { db, actifsTable, bandeActifsTable, bandesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireWriteAccess } from "../lib/middleware";
import { logFromRequest } from "./activity-log";

const router = Router();

const VALID_TYPES = new Set(["terrain", "batiment", "materiel"]);

// P5: Compute residual value for an asset based on usage by closed bandes.
// On cumule le montant réellement imputé à chaque bande terminée : soit le montant
// fixe saisi, soit valeur × (taux/100) × fractionUtilisee.
async function computeAmortissementContext(actifsById: Map<number, { valeur: number; taux: number }>) {
  const bandes = await db.select().from(bandesTable);
  const closedBandeIds = new Set(bandes.filter(b => b.statut === "terminee").map(b => b.id));
  const allAlloc = await db.select().from(bandeActifsTable);
  const parActif = new Map<number, { usage: number; amortissement: number }>();
  for (const a of allAlloc) {
    if (!closedBandeIds.has(a.bandeId)) continue;
    const actif = actifsById.get(a.actifId);
    if (!actif) continue;
    const fraction = parseFloat(a.fractionUtilisee ?? "1");
    const fixe = a.montantFixe === null || a.montantFixe === undefined ? null : parseFloat(a.montantFixe);
    const montant = fixe !== null && Number.isFinite(fixe)
      ? fixe
      : actif.valeur * (actif.taux / 100) * fraction;
    const courant = parActif.get(a.actifId) ?? { usage: 0, amortissement: 0 };
    courant.usage += fraction;
    courant.amortissement += montant;
    parActif.set(a.actifId, courant);
  }
  return parActif;
}

router.get("/", async (_req, res) => {
  const actifs = await db.select().from(actifsTable).orderBy(actifsTable.dateAcquisition);
  const actifsById = new Map(actifs.map(a => [a.id, {
    valeur: parseFloat(a.valeur),
    taux: parseFloat(a.tauxAmortissementAnnuel),
  }]));
  const parActif = await computeAmortissementContext(actifsById);

  const result = actifs.map(a => {
    const valeur = parseFloat(a.valeur);
    const taux = parseFloat(a.tauxAmortissementAnnuel);
    const cumul = parActif.get(a.id) ?? { usage: 0, amortissement: 0 };
    const nbBandesUtilisees = cumul.usage;
    // Somme des montants imputés aux bandes terminées (capée à la valeur de l'actif)
    const amortissementCumule = Math.min(valeur, cumul.amortissement);
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
