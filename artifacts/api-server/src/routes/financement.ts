import { Router } from "express";
import { db, financementTable, remboursementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logFromRequest } from "./activity-log";
import { requireWriteAccess } from "../lib/middleware";

const router = Router();

const VALID_TYPES = new Set(["apport", "pret"]);

function serializeFinancement(r: any) {
  return {
    id: r.id,
    nom: r.nom,
    montant: parseFloat(r.montant),
    date: r.date,
    type: r.type ?? "apport",
    tauxInteret: parseFloat(r.tauxInteret ?? "0"),
    dateRemboursementPrevue: r.dateRemboursementPrevue ?? null,
    createdAt: r.createdAt,
  };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(financementTable).orderBy(financementTable.createdAt);
  res.json(rows.map(serializeFinancement));
});

router.post("/", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { nom, montant, date, type, tauxInteret, dateRemboursementPrevue } = req.body;
  const finalType = VALID_TYPES.has(type) ? type : "apport";
  const finalTaux = finalType === "pret" ? Number(tauxInteret ?? 0) : 0;
  const finalDateRemb = finalType === "pret" ? (dateRemboursementPrevue || null) : null;
  const rows = await db.insert(financementTable).values({
    nom, montant: String(montant), date,
    type: finalType,
    tauxInteret: String(finalTaux),
    dateRemboursementPrevue: finalDateRemb,
  }).returning();
  const r = rows[0];
  await logFromRequest(req, "Ajout financement", `${nom} | ${finalType === "pret" ? `prêt ${finalTaux}%` : "apport"} | ${montant} FCFA`);
  res.status(201).json(serializeFinancement(r));
});

router.put("/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const { nom, montant, date, type, tauxInteret, dateRemboursementPrevue } = req.body;

  // C2: structured before/after activity log
  const before = (await db.select().from(financementTable).where(eq(financementTable.id, id)))[0];
  if (!before) return res.status(404).json({ message: "Financement introuvable" });

  const finalType = VALID_TYPES.has(type) ? type : "apport";
  const finalTaux = finalType === "pret" ? Number(tauxInteret ?? 0) : 0;
  const finalDateRemb = finalType === "pret" ? (dateRemboursementPrevue || null) : null;

  const rows = await db.update(financementTable).set({
    nom, montant: String(montant), date,
    type: finalType,
    tauxInteret: String(finalTaux),
    dateRemboursementPrevue: finalDateRemb,
  }).where(eq(financementTable.id, id)).returning();
  const r = rows[0];

  // Build structured diff
  const diffs: string[] = [];
  if (before.nom !== r.nom) diffs.push(`nom: "${before.nom}" → "${r.nom}"`);
  if (parseFloat(before.montant) !== parseFloat(r.montant)) diffs.push(`montant: ${parseFloat(before.montant)} → ${parseFloat(r.montant)} FCFA`);
  if (before.date !== r.date) diffs.push(`date: ${before.date} → ${r.date}`);
  if ((before.type ?? "apport") !== r.type) diffs.push(`type: ${before.type ?? "apport"} → ${r.type}`);
  if (parseFloat(before.tauxInteret ?? "0") !== parseFloat(r.tauxInteret ?? "0")) diffs.push(`taux: ${parseFloat(before.tauxInteret ?? "0")}% → ${parseFloat(r.tauxInteret ?? "0")}%`);
  if ((before.dateRemboursementPrevue ?? null) !== (r.dateRemboursementPrevue ?? null)) diffs.push(`date remb. prévue: ${before.dateRemboursementPrevue ?? "—"} → ${r.dateRemboursementPrevue ?? "—"}`);

  const details = diffs.length > 0 ? `[ID ${id}] ${diffs.join(" ; ")}` : `[ID ${id}] aucun changement`;
  await logFromRequest(req, "Modification financement", details);
  res.json(serializeFinancement(r));
});

router.delete("/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const before = (await db.select().from(financementTable).where(eq(financementTable.id, id)))[0];
  await db.delete(financementTable).where(eq(financementTable.id, id));
  const desc = before ? `${before.nom} | ${parseFloat(before.montant)} FCFA | ${before.date}` : `ID: ${id}`;
  await logFromRequest(req, "Suppression financement", desc);
  res.json({ success: true });
});

router.get("/remboursements", async (_req, res) => {
  const rows = await db.select().from(remboursementsTable).orderBy(remboursementsTable.createdAt);
  const financements = await db.select().from(financementTable);

  const investisseurMap: Record<string, { totalInvesti: number; totalRembourse: number }> = {};
  for (const f of financements) {
    const key = f.nom;
    if (!investisseurMap[key]) investisseurMap[key] = { totalInvesti: 0, totalRembourse: 0 };
    investisseurMap[key].totalInvesti += parseFloat(f.montant);
  }
  for (const r of rows) {
    const key = r.investisseurNom;
    if (!investisseurMap[key]) investisseurMap[key] = { totalInvesti: 0, totalRembourse: 0 };
    investisseurMap[key].totalRembourse += parseFloat(r.montant);
  }

  const remboursements = rows.map(r => ({
    id: r.id,
    investisseurNom: r.investisseurNom,
    montant: parseFloat(r.montant),
    date: r.date,
    commentaire: r.commentaire,
    createdAt: r.createdAt,
  }));

  const soldesInvestisseurs = Object.entries(investisseurMap).map(([nom, data]) => ({
    nom,
    totalInvesti: data.totalInvesti,
    totalRembourse: data.totalRembourse,
    soldeRestant: data.totalInvesti - data.totalRembourse,
  }));

  res.json({ remboursements, soldesInvestisseurs });
});

router.post("/remboursements", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { investisseurNom, montant, date, commentaire } = req.body;
  if (!investisseurNom || !date) return res.status(400).json({ error: "Investisseur et date requis" });
  const montantNum = Number(montant);
  if (!Number.isFinite(montantNum) || montantNum <= 0) {
    return res.status(400).json({ error: "Montant invalide" });
  }

  // P6: validate solde
  const financements = await db.select().from(financementTable).where(eq(financementTable.nom, investisseurNom));
  if (financements.length === 0) {
    return res.status(400).json({ error: `Aucun apport enregistré pour "${investisseurNom}"` });
  }
  const totalInvesti = financements.reduce((s, f) => s + parseFloat(f.montant), 0);
  const allRemb = await db.select().from(remboursementsTable).where(eq(remboursementsTable.investisseurNom, investisseurNom));
  const totalRembourse = allRemb.reduce((s, r) => s + parseFloat(r.montant), 0);
  const soldeRestant = totalInvesti - totalRembourse;

  if (montantNum > soldeRestant + 0.01) {
    return res.status(400).json({
      error: `Remboursement de ${montantNum.toLocaleString("fr-FR")} FCFA refusé : dépasse le solde restant dû à ${investisseurNom} (${soldeRestant.toLocaleString("fr-FR")} FCFA).`,
    });
  }

  const rows = await db.insert(remboursementsTable).values({
    investisseurNom,
    montant: String(montantNum),
    date,
    commentaire: commentaire || null,
  }).returning();
  const r = rows[0];
  await logFromRequest(req, "Ajout remboursement", `${investisseurNom} | ${montantNum} FCFA | solde restant: ${(soldeRestant - montantNum).toLocaleString("fr-FR")} FCFA`);
  res.status(201).json({
    id: r.id,
    investisseurNom: r.investisseurNom,
    montant: parseFloat(r.montant),
    date: r.date,
    commentaire: r.commentaire,
    createdAt: r.createdAt,
  });
});

router.delete("/remboursements/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const before = (await db.select().from(remboursementsTable).where(eq(remboursementsTable.id, id)))[0];
  await db.delete(remboursementsTable).where(eq(remboursementsTable.id, id));
  const desc = before ? `${before.investisseurNom} | ${parseFloat(before.montant)} FCFA | ${before.date}` : `ID: ${id}`;
  await logFromRequest(req, "Suppression remboursement", desc);
  res.json({ success: true });
});

export default router;
