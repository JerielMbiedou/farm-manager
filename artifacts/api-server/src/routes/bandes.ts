import { Router } from "express";
import { db, bandesTable, bandeDepensesTable, bandeVentesTable, chargesFixesTable, depensesVenteTable, mortaliteJournaliereTable, peseesTable, consommationAlimentTable, vaccinationsTable, consommationEauTable, traitementsTable, observationsJournalTable, bandeActifsTable, actifsTable, stockAlimentsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logFromRequest } from "./activity-log";
import { getParam, getParamStr, getVaccinationSchedule, REFERENCE_WEIGHT_CURVE } from "../lib/parametres";
import { ai } from "@workspace/integrations-gemini-ai";
import { validateBody, normalizeDesignation } from "../lib/validate";
import {
  bandeCreateSchema,
  bandeUpdateSchema,
  depenseCreateSchema,
  venteCreateSchema,
  mortaliteCreateSchema,
  peseeCreateSchema,
} from "../lib/schemas";

const router = Router();

const READ_ONLY_ROLES = new Set(["lecteur", "investisseur"]);

async function requireWriteAccess(req: any, res: any): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ message: "Non authentifié" }); return false; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const role = users[0]?.role;
  if (!role || READ_ONLY_ROLES.has(role)) { res.status(403).json({ message: "Accès en lecture seule" }); return false; }
  return true;
}

async function assertBandeWritable(bandeId: number, res: any): Promise<boolean> {
  const rows = await db.select({ statut: bandesTable.statut }).from(bandesTable).where(eq(bandesTable.id, bandeId));
  if (rows.length === 0) { res.status(404).json({ message: "Bande introuvable" }); return false; }
  if (rows[0].statut === "terminee") { res.status(409).json({ message: "Bande clôturée — rouvrez-la pour la modifier" }); return false; }
  return true;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function getBandeDetail(id: number) {
  const bandeRows = await db.select().from(bandesTable).where(eq(bandesTable.id, id));
  if (bandeRows.length === 0) return null;
  const bande = bandeRows[0];

  const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, id));
  const ventes = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, id));
  const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, id));
  const depensesVente = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, id));

  // Compute nombreDeces from the actual mortalite table (avoids drift from denormalized column)
  const mortaliteSumRows = await db
    .select({ total: sql<number>`COALESCE(SUM(${mortaliteJournaliereTable.decesJour}), 0)` })
    .from(mortaliteJournaliereTable)
    .where(eq(mortaliteJournaliereTable.bandeId, id));
  const nombreDeces = Number(mortaliteSumRows[0]?.total ?? 0);

  // Keep the denormalized column in sync silently
  if (nombreDeces !== bande.nombreDeces) {
    await db.update(bandesTable).set({ nombreDeces }).where(eq(bandesTable.id, id));
  }

  const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
  const totalRecettes = ventes.reduce((s, v) => s + v.quantiteVendue * parseFloat(v.prixUnitaire), 0);
  const totalVendus = ventes.reduce((s, v) => s + v.quantiteVendue, 0);

  const tauxDepreciation = await getParam("taux_depreciation_materiel", 10);
  const tauxImprevus = await getParam("taux_imprevus", 5);
  const valeurMateriel = parseFloat(bande.valeurMaterielFixe);
  const valeurPerdueMateriel = valeurMateriel * (tauxDepreciation / 100);
  const imprevus = totalDepenses * (tauxImprevus / 100);
  const loyer = chargesRows.length > 0 ? parseFloat(chargesRows[0].loyer) : 0;
  const chargesFixesTotal = valeurPerdueMateriel + imprevus + loyer;

  const sujetsRestants = bande.sujetsDepart - nombreDeces - totalVendus;
  const totalDepensesVente = depensesVente.reduce((s, d) => s + parseFloat(d.montant), 0);
  const beneficeNetSansCharges = totalRecettes - totalDepenses - totalDepensesVente;
  const beneficeNet = totalRecettes - totalDepenses - chargesFixesTotal - totalDepensesVente;
  const sujetsVivants = bande.sujetsDepart - nombreDeces;
  const coutTotalProduction = totalDepenses + chargesFixesTotal;
  // Coût par sujet « départ » = coût réel par poussin acheté (référence métier)
  const coutParSujetDepart = bande.sujetsDepart > 0 ? coutTotalProduction / bande.sujetsDepart : 0;
  // Coût par sujet « vivant » = coût absorbé par les survivants (vue rentabilité)
  const coutParSujetVivant = sujetsVivants > 0 ? coutTotalProduction / sujetsVivants : 0;
  // Compatibilité : ancien champ `coutParSujet` = coutParSujetDepart (corrigé)
  const coutParSujet = coutParSujetDepart;

  return {
    id: bande.id,
    numero: bande.numero,
    nom: bande.nom,
    sujetsDepart: bande.sujetsDepart,
    nombreDeces,
    totalVendus,
    sujetsRestants,
    valeurMaterielFixe: valeurMateriel,
    statut: bande.statut,
    dateCloture: bande.dateCloture,
    totalDepenses,
    totalRecettes,
    chargesFixesTotal,
    beneficeNet,
    beneficeNetSansCharges,
    coutParSujet,
    coutParSujetDepart,
    coutParSujetVivant,
    dateDeDepart: bande.dateDeDepart,
    createdAt: bande.createdAt,
  };
}

router.post("/:id/cloture", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const dateCloture = (req.body?.dateCloture as string) || new Date().toISOString().split("T")[0];
  if (!ISO_DATE_RE.test(dateCloture) || isNaN(new Date(dateCloture).getTime())) {
    return res.status(400).json({ message: "Date de clôture invalide (format AAAA-MM-JJ attendu)" });
  }
  const updated = await db.update(bandesTable)
    .set({ statut: "terminee", dateCloture })
    .where(and(eq(bandesTable.id, id), eq(bandesTable.statut, "active")))
    .returning({ nom: bandesTable.nom, sujetsDepart: bandesTable.sujetsDepart, nombreDeces: bandesTable.nombreDeces });
  if (updated.length === 0) {
    const exists = await db.select({ id: bandesTable.id }).from(bandesTable).where(eq(bandesTable.id, id));
    if (exists.length === 0) return res.status(404).json({ message: "Bande introuvable" });
    return res.status(409).json({ message: "Bande déjà terminée" });
  }
  // Cohérence sujets : départ - décès - vendus
  const ventesRow = await db.select({ sum: sql<number>`COALESCE(SUM(${bandeVentesTable.quantiteVendue}), 0)` }).from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, id));
  const totalVendus = Number(ventesRow[0]?.sum ?? 0);
  const sujetsRestants = updated[0].sujetsDepart - updated[0].nombreDeces - totalVendus;
  let warning: string | null = null;
  if (sujetsRestants !== 0) {
    warning = sujetsRestants > 0
      ? `${sujetsRestants} sujet(s) non comptabilisé(s) (départ ${updated[0].sujetsDepart} − décès ${updated[0].nombreDeces} − vendus ${totalVendus}). Vérifiez les ventes et mortalités.`
      : `${Math.abs(sujetsRestants)} sujet(s) en excès dans les ventes (départ ${updated[0].sujetsDepart} − décès ${updated[0].nombreDeces} − vendus ${totalVendus}). Vérifiez les saisies.`;
  }
  await logFromRequest(req, "Clôture bande", `${updated[0].nom} clôturée au ${dateCloture}${warning ? ` — ${warning}` : ""}`);
  const detail = await getBandeDetail(id);
  res.json({ ...detail, warning, coherence: { sujetsDepart: updated[0].sujetsDepart, nombreDeces: updated[0].nombreDeces, totalVendus, sujetsRestants } });
});

router.post("/:id/reouvrir", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const updated = await db.update(bandesTable)
    .set({ statut: "active", dateCloture: null })
    .where(and(eq(bandesTable.id, id), eq(bandesTable.statut, "terminee")))
    .returning({ nom: bandesTable.nom });
  if (updated.length === 0) {
    const exists = await db.select({ id: bandesTable.id }).from(bandesTable).where(eq(bandesTable.id, id));
    if (exists.length === 0) return res.status(404).json({ message: "Bande introuvable" });
    return res.status(409).json({ message: "Bande déjà active" });
  }
  await logFromRequest(req, "Réouverture bande", updated[0].nom);
  const detail = await getBandeDetail(id);
  res.json(detail);
});

router.get("/designations-suggestions", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT
      designation,
      categorie,
      COUNT(*)::int AS frequence,
      ROUND(AVG(prix_unitaire::numeric), 0)::float AS prix_moyen
    FROM bande_depenses
    WHERE designation IS NOT NULL AND TRIM(designation) <> ''
    GROUP BY designation, categorie
    ORDER BY frequence DESC, designation ASC
  `);
  const aggregated: Array<{ designation: string; categorie: string | null; prixMoyen: number; frequence: number }> =
    (rows as any).rows.map((r: any) => ({
      designation: r.designation,
      categorie: r.categorie ?? null,
      prixMoyen: Number(r.prix_moyen ?? 0),
      frequence: Number(r.frequence ?? 0),
    }));

  const SEED: Array<{ designation: string; categorie: string; prixMoyen: number }> = [
    { designation: "Désinfectant", categorie: "nettoyage", prixMoyen: 10000 },
    { designation: "Javel", categorie: "nettoyage", prixMoyen: 2500 },
    { designation: "Détergent", categorie: "nettoyage", prixMoyen: 2000 },
    { designation: "Chaux vive", categorie: "nettoyage", prixMoyen: 5000 },
    { designation: "Savon", categorie: "nettoyage", prixMoyen: 1500 },
  ];
  const seen = new Set(aggregated.map(a => a.designation.toLowerCase().trim()));
  for (const s of SEED) {
    if (!seen.has(s.designation.toLowerCase().trim())) {
      aggregated.push({ ...s, frequence: 0 });
    }
  }
  res.json(aggregated);
});

router.get("/", async (req, res) => {
  const rows = await db.select().from(bandesTable).orderBy(bandesTable.numero);
  res.json(rows.map(r => ({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    dateDeDepart: r.dateDeDepart,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
  })));
});

router.post("/", validateBody(bandeCreateSchema), async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { nom, dateDeDepart, sujetsDepart, nombreDeces, valeurMaterielFixe, statut } = req.body;
  const maxRows = await db.select({ max: sql<number>`COALESCE(MAX(${bandesTable.numero}), 0)` }).from(bandesTable);
  const numero = Number(maxRows[0]?.max ?? 0) + 1;
  const rows = await db.insert(bandesTable).values({
    numero,
    nom,
    dateDeDepart: dateDeDepart ?? new Date().toISOString().split("T")[0],
    sujetsDepart,
    nombreDeces: nombreDeces ?? 0,
    valeurMaterielFixe: String(valeurMaterielFixe ?? 0),
    statut: statut ?? "active",
  }).returning();
  const r = rows[0];
  await logFromRequest(req, "Création bande", `${nom} - ${sujetsDepart} sujets`);
  res.status(201).json({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    dateDeDepart: r.dateDeDepart,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
  });
});

router.get("/reference-poids", async (_req, res) => {
  res.json(REFERENCE_WEIGHT_CURVE);
});

router.get("/historique-moyennes", async (_req, res) => {
  const allBandes = await db.select().from(bandesTable).where(eq(bandesTable.statut, "terminee"));
  if (allBandes.length === 0) {
    res.json({ nbBandes: 0 });
    return;
  }

  let totalSujets = 0;
  let totalDeces = 0;
  let totalAlimentKg = 0;
  let totalEauL = 0;
  let alimentDemarrage = 0;
  let alimentCroissance = 0;
  let alimentFinition = 0;
  let eauDemarrage = 0;
  let eauCroissance = 0;
  let eauFinition = 0;
  let decesDemarrage = 0;
  let decesCroissance = 0;
  let decesFinition = 0;
  let totalDureeJours = 0;
  let bandesAvecAliment = 0;
  let bandesAvecEau = 0;
  let bandesAvecMort = 0;
  let poidsFinaux: number[] = [];

  for (const bande of allBandes) {
    totalSujets += bande.sujetsDepart;
    totalDeces += bande.nombreDeces;

    const aliment = await db.select().from(consommationAlimentTable).where(eq(consommationAlimentTable.bandeId, bande.id)).orderBy(consommationAlimentTable.date);
    if (aliment.length > 0) {
      bandesAvecAliment++;
      const startDate = new Date(bande.dateDeDepart + "T00:00:00");
      for (const a of aliment) {
        const kg = parseFloat(a.quantiteKg);
        totalAlimentKg += kg;
        const entryDate = new Date(a.date + "T00:00:00");
        const ageJours = Math.floor((entryDate.getTime() - startDate.getTime()) / 86400000) + 1;
        if (ageJours <= 15) alimentDemarrage += kg;
        else if (ageJours <= 28) alimentCroissance += kg;
        else alimentFinition += kg;
      }
    }

    const eau = await db.select().from(consommationEauTable).where(eq(consommationEauTable.bandeId, bande.id));
    if (eau.length > 0) {
      bandesAvecEau++;
      for (const e of eau) {
        const litres = parseFloat(e.quantiteLitres);
        totalEauL += litres;
        const age = e.ageJours;
        if (age <= 15) eauDemarrage += litres;
        else if (age <= 28) eauCroissance += litres;
        else eauFinition += litres;
      }
    }

    const mort = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bande.id));
    if (mort.length > 0) {
      bandesAvecMort++;
      let maxAge = 0;
      for (const m of mort) {
        const deces = m.decesJour;
        const age = m.ageJours;
        if (age > maxAge) maxAge = age;
        if (age <= 15) decesDemarrage += deces;
        else if (age <= 28) decesCroissance += deces;
        else decesFinition += deces;
      }
      totalDureeJours += maxAge;
    }

    const pesees = await db.select().from(peseesTable).where(eq(peseesTable.bandeId, bande.id)).orderBy(peseesTable.ageJours);
    if (pesees.length > 0) {
      const dernierPoids = parseFloat(pesees[pesees.length - 1].poidsMoyenG);
      poidsFinaux.push(dernierPoids);
    }
  }

  const n = allBandes.length;
  const avgAlimentParSujet = totalSujets > 0 ? totalAlimentKg / totalSujets : 4.5;
  const avgEauParSujet = totalSujets > 0 ? totalEauL / totalSujets : 15;
  const avgTauxMortalite = totalSujets > 0 ? (totalDeces / totalSujets) * 100 : 5;
  const avgDuree = bandesAvecMort > 0 ? Math.round(totalDureeJours / bandesAvecMort) : 45;
  const avgPoidsFinalG = poidsFinaux.length > 0 ? Math.round(poidsFinaux.reduce((a, b) => a + b, 0) / poidsFinaux.length) : 2000;

  const alimentParSujetDemarrage = totalSujets > 0 ? alimentDemarrage / totalSujets : 0.5;
  const alimentParSujetCroissance = totalSujets > 0 ? alimentCroissance / totalSujets : 1.5;
  const alimentParSujetFinition = totalSujets > 0 ? alimentFinition / totalSujets : 2.5;

  const eauParSujetDemarrage = totalSujets > 0 ? eauDemarrage / totalSujets : 2;
  const eauParSujetCroissance = totalSujets > 0 ? eauCroissance / totalSujets : 5;
  const eauParSujetFinition = totalSujets > 0 ? eauFinition / totalSujets : 8;

  res.json({
    nbBandes: n,
    avgSujetsDepart: Math.round(totalSujets / n),
    avgTauxMortalite: Math.round(avgTauxMortalite * 10) / 10,
    avgDureeJours: avgDuree,
    avgPoidsFinalG,
    aliment: {
      totalParSujet: Math.round(avgAlimentParSujet * 100) / 100,
      demarrage: { parSujet: Math.round(alimentParSujetDemarrage * 100) / 100, totalKg: Math.round(alimentDemarrage), pctTotal: totalAlimentKg > 0 ? Math.round(alimentDemarrage / totalAlimentKg * 100) : 0 },
      croissance: { parSujet: Math.round(alimentParSujetCroissance * 100) / 100, totalKg: Math.round(alimentCroissance), pctTotal: totalAlimentKg > 0 ? Math.round(alimentCroissance / totalAlimentKg * 100) : 0 },
      finition: { parSujet: Math.round(alimentParSujetFinition * 100) / 100, totalKg: Math.round(alimentFinition), pctTotal: totalAlimentKg > 0 ? Math.round(alimentFinition / totalAlimentKg * 100) : 0 },
    },
    eau: {
      totalParSujet: Math.round(avgEauParSujet * 100) / 100,
      demarrage: { parSujet: Math.round(eauParSujetDemarrage * 100) / 100 },
      croissance: { parSujet: Math.round(eauParSujetCroissance * 100) / 100 },
      finition: { parSujet: Math.round(eauParSujetFinition * 100) / 100 },
    },
    mortalite: {
      demarrage: totalDeces > 0 ? Math.round(decesDemarrage / totalDeces * 100) : 0,
      croissance: totalDeces > 0 ? Math.round(decesCroissance / totalDeces * 100) : 0,
      finition: totalDeces > 0 ? Math.round(decesFinition / totalDeces * 100) : 0,
    },
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const detail = await getBandeDetail(id);
  if (!detail) {
    res.status(404).json({ error: "Bande introuvable" });
    return;
  }
  res.json(detail);
});

router.put("/:id", validateBody(bandeUpdateSchema), async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  const { nom, dateDeDepart, sujetsDepart, nombreDeces, valeurMaterielFixe, statut } = req.body;
  const updates: Record<string, unknown> = {};
  if (nom !== undefined) updates.nom = nom;
  if (dateDeDepart !== undefined) updates.dateDeDepart = dateDeDepart;
  if (sujetsDepart !== undefined) updates.sujetsDepart = sujetsDepart;
  if (nombreDeces !== undefined) updates.nombreDeces = nombreDeces;
  if (valeurMaterielFixe !== undefined) updates.valeurMaterielFixe = String(valeurMaterielFixe);
  if (statut !== undefined) updates.statut = statut;
  const rows = await db.update(bandesTable).set(updates).where(eq(bandesTable.id, id)).returning();
  const r = rows[0];
  await logFromRequest(req, "Modification bande", `${r.nom}`);
  res.json({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    dateDeDepart: r.dateDeDepart,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
  });
});

router.delete("/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  await db.delete(bandesTable).where(eq(bandesTable.id, id));
  await logFromRequest(req, "Suppression bande", `ID: ${id}`);
  res.json({ success: true });
});

router.get("/:id/depenses", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bandeId));
  res.json(rows.map(r => ({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  })));
});

router.post("/:id/depenses", validateBody(depenseCreateSchema), async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const { date, designation, categorie, quantite, prixUnitaire } = req.body;
  const dateValue = (typeof date === "string" && ISO_DATE_RE.test(date)) ? date : new Date().toISOString().split("T")[0];
  const designationNorm = normalizeDesignation(designation);
  const rows = await db.insert(bandeDepensesTable).values({
    bandeId,
    date: dateValue,
    designation: designationNorm,
    categorie,
    quantite: String(quantite),
    prixUnitaire: String(prixUnitaire),
  }).returning();
  const r = rows[0];
  await logFromRequest(req, "Ajout dépense bande", `${designation} - ${parseFloat(r.quantite) * parseFloat(r.prixUnitaire)} FCFA`);
  res.status(201).json({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  });
});

router.put("/:id/depenses/:depenseId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const depenseId = parseInt(req.params.depenseId);
  const { date, designation, categorie, quantite, prixUnitaire } = req.body;
  const updates: Record<string, unknown> = {
    designation: normalizeDesignation(designation),
    categorie,
    quantite: String(quantite),
    prixUnitaire: String(prixUnitaire),
  };
  if (date !== undefined && typeof date === "string" && ISO_DATE_RE.test(date)) updates.date = date;
  const rows = await db.update(bandeDepensesTable).set(updates).where(eq(bandeDepensesTable.id, depenseId)).returning();
  const r = rows[0];
  res.json({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  });
});

router.delete("/:id/depenses/:depenseId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const depenseId = parseInt(req.params.depenseId);
  await db.delete(bandeDepensesTable).where(eq(bandeDepensesTable.id, depenseId));
  await logFromRequest(req, "Suppression dépense bande", `ID: ${depenseId}`);
  res.json({ success: true });
});

router.get("/:id/ventes", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, bandeId));
  res.json(rows.map(r => ({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    quantiteVendue: r.quantiteVendue,
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: r.quantiteVendue * parseFloat(r.prixUnitaire),
  })));
});

router.post("/:id/ventes", validateBody(venteCreateSchema), async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const { date, quantiteVendue, prixUnitaire } = req.body;
  const rows = await db.insert(bandeVentesTable).values({
    bandeId,
    date,
    quantiteVendue,
    prixUnitaire: String(prixUnitaire),
  }).returning();
  const r = rows[0];
  await logFromRequest(req, "Ajout vente bande", `${quantiteVendue} sujets à ${prixUnitaire} FCFA`);
  res.status(201).json({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    quantiteVendue: r.quantiteVendue,
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: r.quantiteVendue * parseFloat(r.prixUnitaire),
  });
});

router.put("/:id/ventes/:venteId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const venteId = parseInt(req.params.venteId);
  const { date, quantiteVendue, prixUnitaire } = req.body;
  const rows = await db.update(bandeVentesTable).set({
    date,
    quantiteVendue,
    prixUnitaire: String(prixUnitaire),
  }).where(eq(bandeVentesTable.id, venteId)).returning();
  const r = rows[0];
  res.json({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    quantiteVendue: r.quantiteVendue,
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: r.quantiteVendue * parseFloat(r.prixUnitaire),
  });
});

router.delete("/:id/ventes/:venteId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const venteId = parseInt(req.params.venteId);
  await db.delete(bandeVentesTable).where(eq(bandeVentesTable.id, venteId));
  await logFromRequest(req, "Suppression vente bande", `ID: ${venteId}`);
  res.json({ success: true });
});

router.get("/:id/charges-fixes", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const bandeRows = await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId));
  if (bandeRows.length === 0) {
    res.status(404).json({ error: "Bande introuvable" });
    return;
  }
  const bande = bandeRows[0];

  const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, bandeId));
  let chargesRow = chargesRows[0];
  if (!chargesRow) {
    const inserted = await db.insert(chargesFixesTable).values({ bandeId, loyer: "0" }).returning();
    chargesRow = inserted[0];
  }

  const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bandeId));
  const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
  const tauxDep = await getParam("taux_depreciation_materiel", 10);
  const tauxImp = await getParam("taux_imprevus", 5);
  const valeurPerdueMateriel = parseFloat(bande.valeurMaterielFixe) * (tauxDep / 100);
  const imprevus = totalDepenses * (tauxImp / 100);
  const loyer = parseFloat(chargesRow.loyer);
  const total = valeurPerdueMateriel + imprevus + loyer;

  res.json({
    id: chargesRow.id,
    bandeId,
    valeurPerdueMateriel,
    imprévus: imprevus,
    loyer,
    total,
  });
});

router.put("/:id/charges-fixes", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const bandeId = parseInt(req.params.id);
  const { loyer } = req.body;

  const bandeRows = await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId));
  if (bandeRows.length === 0) {
    res.status(404).json({ error: "Bande introuvable" });
    return;
  }
  const bande = bandeRows[0];

  const existing = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, bandeId));
  let chargesRow;
  if (existing.length === 0) {
    const inserted = await db.insert(chargesFixesTable).values({ bandeId, loyer: String(loyer ?? 0) }).returning();
    chargesRow = inserted[0];
  } else {
    const updated = await db.update(chargesFixesTable).set({ loyer: String(loyer ?? 0) }).where(eq(chargesFixesTable.bandeId, bandeId)).returning();
    chargesRow = updated[0];
  }

  const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bandeId));
  const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
  const tauxDep2 = await getParam("taux_depreciation_materiel", 10);
  const tauxImp2 = await getParam("taux_imprevus", 5);
  const valeurPerdueMateriel = parseFloat(bande.valeurMaterielFixe) * (tauxDep2 / 100);
  const imprevus = totalDepenses * (tauxImp2 / 100);
  const loyerVal = parseFloat(chargesRow.loyer);
  const total = valeurPerdueMateriel + imprevus + loyerVal;

  res.json({ id: chargesRow.id, bandeId, valeurPerdueMateriel, imprévus: imprevus, loyer: loyerVal, total });
});

router.get("/:id/depenses-vente", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, bandeId));
  res.json(rows.map(r => ({
    id: r.id,
    bandeId: r.bandeId,
    designation: r.designation,
    montant: parseFloat(r.montant),
  })));
});

router.post("/:id/depenses-vente", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const bandeId = parseInt(req.params.id);
  const { designation, montant } = req.body;
  const rows = await db.insert(depensesVenteTable).values({ bandeId, designation, montant: String(montant) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, bandeId: r.bandeId, designation: r.designation, montant: parseFloat(r.montant) });
});

router.put("/:id/depenses-vente/:depenseId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const depenseId = parseInt(req.params.depenseId);
  const { designation, montant } = req.body;
  const rows = await db.update(depensesVenteTable).set({ designation, montant: String(montant) }).where(eq(depensesVenteTable.id, depenseId)).returning();
  const r = rows[0];
  res.json({ id: r.id, bandeId: r.bandeId, designation: r.designation, montant: parseFloat(r.montant) });
});

router.delete("/:id/depenses-vente/:depenseId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const depenseId = parseInt(req.params.depenseId);
  await db.delete(depensesVenteTable).where(eq(depensesVenteTable.id, depenseId));
  res.json({ success: true });
});

router.get("/:id/mortalite", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bandeId)).orderBy(mortaliteJournaliereTable.ageJours);
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  if (!bande) { res.status(404).json({ error: "Bande introuvable" }); return; }

  // Seuils dépendants de l'âge : démarrage J0–J21 vs finition ≥ J22
  const seuilDemarrage = await getParam("seuil_mortalite_alerte_jour_demarrage", 1);
  const seuilFinition = await getParam("seuil_mortalite_alerte_jour_finition", 0.5);
  let decesCumules = 0;
  const data = rows.map(r => {
    const vivantsDebutJournee = bande.sujetsDepart - decesCumules;
    const tauxJour = vivantsDebutJournee > 0 ? (r.decesJour / vivantsDebutJournee) * 100 : 0;
    decesCumules += r.decesJour;
    const tauxMortalite = bande.sujetsDepart > 0 ? (decesCumules / bande.sujetsDepart) * 100 : 0;
    const seuilApplicable = r.ageJours <= 21 ? seuilDemarrage : seuilFinition;
    return {
      id: r.id,
      bandeId: r.bandeId,
      date: r.date,
      ageJours: r.ageJours,
      decesJour: r.decesJour,
      decesCumules,
      tauxJour: Math.round(tauxJour * 100) / 100,
      tauxMortalite: Math.round(tauxMortalite * 100) / 100,
      seuilApplicable,
      alerteRouge: tauxJour > seuilApplicable,
    };
  });
  res.json(data);
});

router.post("/:id/mortalite", validateBody(mortaliteCreateSchema), async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const { date, ageJours, decesJour } = req.body;
  const { row: r, totalDeces } = await db.transaction(async (tx) => {
    const inserted = await tx.insert(mortaliteJournaliereTable).values({ bandeId, date, ageJours, decesJour: decesJour ?? 0 }).returning();
    const sumRows = await tx.select({ total: sql<number>`COALESCE(SUM(${mortaliteJournaliereTable.decesJour}), 0)` }).from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bandeId));
    const total = Number(sumRows[0]?.total ?? 0);
    await tx.update(bandesTable).set({ nombreDeces: total }).where(eq(bandesTable.id, bandeId));
    return { row: inserted[0], totalDeces: total };
  });

  // Calcule l'alerte pour la nouvelle entrée
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  const seuilDemarrage = await getParam("seuil_mortalite_alerte_jour_demarrage", 1);
  const seuilFinition = await getParam("seuil_mortalite_alerte_jour_finition", 0.5);
  const decesAvant = totalDeces - r.decesJour;
  const vivantsDebutJournee = (bande?.sujetsDepart ?? 0) - decesAvant;
  const tauxJour = vivantsDebutJournee > 0 ? (r.decesJour / vivantsDebutJournee) * 100 : 0;
  const seuilApplicable = r.ageJours <= 21 ? seuilDemarrage : seuilFinition;
  const alerteRouge = tauxJour > seuilApplicable;

  await logFromRequest(req, "Ajout mortalité", `${decesJour} décès - Bande ID: ${bandeId}${alerteRouge ? " — ALERTE" : ""}`);
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours, decesJour: r.decesJour,
    tauxJour: Math.round(tauxJour * 100) / 100, seuilApplicable, alerteRouge,
  });
});

router.delete("/:id/mortalite/:mortaliteId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  const mortaliteId = parseInt(req.params.mortaliteId);
  const existing = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.id, mortaliteId));
  if (existing.length > 0) {
    const bandeId = existing[0].bandeId;
    await db.delete(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.id, mortaliteId));
    // Recompute from source of truth
    const sumRows = await db.select({ total: sql<number>`COALESCE(SUM(${mortaliteJournaliereTable.decesJour}), 0)` }).from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bandeId));
    await db.update(bandesTable).set({ nombreDeces: Number(sumRows[0]?.total ?? 0) }).where(eq(bandesTable.id, bandeId));
    return res.json({ success: true });
  }
  await db.delete(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.id, mortaliteId));
  res.json({ success: true });
});

router.get("/:id/pesees", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(peseesTable).where(eq(peseesTable.bandeId, bandeId)).orderBy(peseesTable.ageJours);
  const seuilPoids = await getParam("seuil_poids_alerte", 90);
  res.json(rows.map(r => {
    const poidsMoyen = parseFloat(r.poidsMoyenG);
    const poidsMin = r.poidsMinG ? parseFloat(r.poidsMinG) : null;
    const poidsMax = r.poidsMaxG ? parseFloat(r.poidsMaxG) : null;
    const cv = (poidsMin != null && poidsMax != null && poidsMoyen > 0)
      ? Math.round(((poidsMax - poidsMin) / poidsMoyen) * 1000) / 10
      : null;
    return {
      id: r.id,
      bandeId: r.bandeId,
      date: r.date,
      ageJours: r.ageJours,
      poidsMoyenG: poidsMoyen,
      poidsMinG: poidsMin,
      poidsMaxG: poidsMax,
      cv,
      objectifPoidsG: r.objectifPoidsG ? parseFloat(r.objectifPoidsG) : null,
      ecart: r.objectifPoidsG ? poidsMoyen - parseFloat(r.objectifPoidsG) : null,
      alertePoids: r.objectifPoidsG ? poidsMoyen < parseFloat(r.objectifPoidsG) * (seuilPoids / 100) : false,
    };
  }));
});

router.post("/:id/pesees", validateBody(peseeCreateSchema), async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const { date, ageJours, poidsMoyenG, poidsMinG, poidsMaxG, objectifPoidsG } = req.body;
  // Si min et max sont fournis mais pas la moyenne, calcule-la
  let computedMoyen = poidsMoyenG;
  if ((computedMoyen == null || computedMoyen === 0) && poidsMinG != null && poidsMaxG != null) {
    computedMoyen = (Number(poidsMinG) + Number(poidsMaxG)) / 2;
  }
  const rows = await db.insert(peseesTable).values({
    bandeId, date, ageJours,
    poidsMoyenG: String(computedMoyen),
    poidsMinG: poidsMinG != null && poidsMinG !== "" ? String(poidsMinG) : null,
    poidsMaxG: poidsMaxG != null && poidsMaxG !== "" ? String(poidsMaxG) : null,
    objectifPoidsG: objectifPoidsG ? String(objectifPoidsG) : null,
  }).returning();
  const r = rows[0];
  const pmin = r.poidsMinG ? parseFloat(r.poidsMinG) : null;
  const pmax = r.poidsMaxG ? parseFloat(r.poidsMaxG) : null;
  const pmoy = parseFloat(r.poidsMoyenG);
  const cv = (pmin != null && pmax != null && pmoy > 0) ? Math.round(((pmax - pmin) / pmoy) * 1000) / 10 : null;
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    poidsMoyenG: pmoy, poidsMinG: pmin, poidsMaxG: pmax, cv,
    objectifPoidsG: r.objectifPoidsG ? parseFloat(r.objectifPoidsG) : null,
  });
});

router.delete("/:id/pesees/:peseeId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  await db.delete(peseesTable).where(eq(peseesTable.id, parseInt(req.params.peseeId)));
  res.json({ success: true });
});

router.get("/:id/consommation", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(consommationAlimentTable).where(eq(consommationAlimentTable.bandeId, bandeId)).orderBy(consommationAlimentTable.date);
  const pesees = await db.select().from(peseesTable).where(eq(peseesTable.bandeId, bandeId)).orderBy(peseesTable.ageJours);
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];

  const totalAlimentKg = rows.reduce((s, r) => s + parseFloat(r.quantiteKg), 0);
  let ic: number | null = null;
  let icStatus: string | null = null;
  if (pesees.length > 0 && bande) {
    const dernierPoids = parseFloat(pesees[pesees.length - 1].poidsMoyenG);
    const totalVendusIC = await db.select({ total: sql<number>`sum(quantite_vendue)` }).from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, bandeId));
    const venduCount = Number(totalVendusIC[0]?.total || 0);
    const sujetsRestants = bande.sujetsDepart - bande.nombreDeces - venduCount;
    const poidsGagneTotal = (dernierPoids / 1000) * sujetsRestants;
    if (poidsGagneTotal > 0) {
      ic = Math.round((totalAlimentKg / poidsGagneTotal) * 100) / 100;
      const icBon = await getParam("ic_bon", 1.8);
      const icMoyen = await getParam("ic_moyen", 2.2);
      if (ic < icBon) icStatus = "bon";
      else if (ic <= icMoyen) icStatus = "moyen";
      else icStatus = "mauvais";
    }
  }

  res.json({
    entries: rows.map(r => ({ id: r.id, bandeId: r.bandeId, date: r.date, quantiteKg: parseFloat(r.quantiteKg) })),
    totalAlimentKg,
    ic,
    icStatus,
  });
});

function typeAlimentToDesignation(type?: string | null): string {
  const map: Record<string, string> = {
    demarrage: "Aliment démarrage",
    croissance: "Aliment croissance",
    finition: "Aliment finition",
  };
  return (type && map[type]) || "Aliment bande";
}

router.post("/:id/consommation", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const { date, quantiteKg, typeAliment, designation } = req.body as {
    date: string; quantiteKg: number; typeAliment?: string; designation?: string;
  };
  const rows = await db.insert(consommationAlimentTable).values({ bandeId, date, quantiteKg: String(quantiteKg) }).returning();
  const r = rows[0];

  // Synchronisation automatique stock ← consommation bande (non bloquante)
  try {
    const syncEnabled = await getParamStr("sync_stock_consommation", "true");
    if (syncEnabled === "true" && Number(quantiteKg) > 0) {
      const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
      if (bande) {
        const desig = designation?.trim() || typeAlimentToDesignation(typeAliment);
        const start = new Date(`${bande.dateDeDepart}T00:00:00`);
        const consoDate = new Date(`${date}T00:00:00`);
        const ageJours = Math.max(0, Math.round((consoDate.getTime() - start.getTime()) / 86400000));
        await db.insert(stockAlimentsTable).values({
          designation: desig,
          type: "sortie",
          quantiteKg: String(quantiteKg),
          prixUnitaire: null,
          fournisseur: null,
          date,
          commentaire: `[AUTO] ${bande.nom} J${ageJours}`,
        });
        req.log.info({ bandeId, quantiteKg, designation: desig, ageJours }, "Sync stock ← consommation bande");
      }
    }
  } catch (err) {
    req.log.warn({ err }, "Sync stock échouée — non bloquant");
  }

  res.status(201).json({ id: r.id, bandeId: r.bandeId, date: r.date, quantiteKg: parseFloat(r.quantiteKg) });
});

router.delete("/:id/consommation/:consId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(parseInt(req.params.id), res))) return;
  await db.delete(consommationAlimentTable).where(eq(consommationAlimentTable.id, parseInt(req.params.consId)));
  res.json({ success: true });
});

router.get("/:id/vaccinations", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  let rows = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.bandeId, bandeId)).orderBy(vaccinationsTable.jourPrevu);
  if (rows.length === 0) {
    const schedule = await getVaccinationSchedule();
    for (const v of schedule) {
      await db.insert(vaccinationsTable).values({ bandeId, ...v, fait: "non" });
    }
    rows = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.bandeId, bandeId)).orderBy(vaccinationsTable.jourPrevu);
  }
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  const startDate = bande ? new Date(bande.dateDeDepart) : new Date();

  res.json(rows.map(r => {
    const datePrevue = new Date(startDate);
    datePrevue.setDate(datePrevue.getDate() + r.jourPrevu - 1);
    const enRetard = r.fait === "non" && datePrevue < new Date();
    return {
      id: r.id, bandeId: r.bandeId, jourPrevu: r.jourPrevu, nom: r.nom,
      description: r.description, fait: r.fait, dateFait: r.dateFait,
      commentaire: r.commentaire, datePrevue: datePrevue.toISOString().split("T")[0], enRetard,
    };
  }));
});

router.put("/:id/vaccinations/:vaccId", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  if (!(await requireWriteAccess(req, res))) return;
  if (!(await assertBandeWritable(bandeId, res))) return;
  const vaccId = parseInt(req.params.vaccId);
  const { fait, dateFait, commentaire } = req.body;
  const updates: Record<string, unknown> = {};
  if (fait !== undefined) updates.fait = fait;
  if (dateFait !== undefined) updates.dateFait = dateFait;
  if (commentaire !== undefined) updates.commentaire = commentaire;
  const rows = await db.update(vaccinationsTable)
    .set(updates)
    .where(and(eq(vaccinationsTable.id, vaccId), eq(vaccinationsTable.bandeId, bandeId)))
    .returning();
  if (rows.length === 0) {
    return res.status(404).json({ error: "Vaccination introuvable pour cette bande" });
  }
  const r = rows[0];
  res.json({
    id: r.id, bandeId: r.bandeId, jourPrevu: r.jourPrevu, nom: r.nom,
    description: r.description, fait: r.fait, dateFait: r.dateFait, commentaire: r.commentaire,
  });
});

router.post("/:id/vaccinations", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  const { jourPrevu, nom, description } = req.body;
  const rows = await db.insert(vaccinationsTable).values({ bandeId, jourPrevu, nom, description: description || null, fait: "non" }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, jourPrevu: r.jourPrevu, nom: r.nom,
    description: r.description, fait: r.fait, dateFait: r.dateFait, commentaire: r.commentaire,
  });
});

router.get("/:id/consommation-eau", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(consommationEauTable).where(eq(consommationEauTable.bandeId, bandeId)).orderBy(consommationEauTable.ageJours);
  res.json(rows.map(r => ({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    quantiteLitres: parseFloat(r.quantiteLitres),
  })));
});

router.post("/:id/consommation-eau", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  const { date, ageJours, quantiteLitres } = req.body;
  const rows = await db.insert(consommationEauTable).values({
    bandeId, date, ageJours, quantiteLitres: String(quantiteLitres),
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    quantiteLitres: parseFloat(r.quantiteLitres),
  });
});

router.delete("/:id/consommation-eau/:eauId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  await db.delete(consommationEauTable).where(and(eq(consommationEauTable.id, parseInt(req.params.eauId)), eq(consommationEauTable.bandeId, bandeId)));
  res.json({ success: true });
});

router.get("/:id/traitements", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(traitementsTable).where(eq(traitementsTable.bandeId, bandeId)).orderBy(traitementsTable.ageJours);
  res.json(rows.map(r => ({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    produit: r.produit, type: r.type, dosage: r.dosage, observations: r.observations,
  })));
});

router.post("/:id/traitements", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  const { date, ageJours, produit, type, dosage, observations } = req.body;
  const rows = await db.insert(traitementsTable).values({
    bandeId, date, ageJours, produit, type: type || "traitement",
    dosage: dosage || null, observations: observations || null,
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    produit: r.produit, type: r.type, dosage: r.dosage, observations: r.observations,
  });
});

router.delete("/:id/traitements/:traitId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  await db.delete(traitementsTable).where(and(eq(traitementsTable.id, parseInt(req.params.traitId)), eq(traitementsTable.bandeId, bandeId)));
  res.json({ success: true });
});

router.get("/:id/observations", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(observationsJournalTable).where(eq(observationsJournalTable.bandeId, bandeId)).orderBy(observationsJournalTable.ageJours);
  res.json(rows.map(r => ({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours, contenu: r.contenu,
  })));
});

router.post("/:id/observations", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  const { date, ageJours, contenu } = req.body;
  const rows = await db.insert(observationsJournalTable).values({
    bandeId, date, ageJours, contenu,
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours, contenu: r.contenu,
  });
});

router.delete("/:id/observations/:obsId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  await db.delete(observationsJournalTable).where(and(eq(observationsJournalTable.id, parseInt(req.params.obsId)), eq(observationsJournalTable.bandeId, bandeId)));
  res.json({ success: true });
});

router.post("/:id/parse-fiche", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  try {
    const bandeId = parseInt(req.params.id);
    const bandes = await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId));
    if (!bandes.length) { res.status(404).json({ error: "Bande introuvable" }); return; }
    const bande = bandes[0];

    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) { res.status(400).json({ error: "Image requise" }); return; }

    const startDate = bande.dateDeDepart as string;
    const prompt = `Tu es un expert en aviculture. Analyse cette fiche de suivi hebdomadaire d'une bande de poulets de chair.

La bande a démarré le ${startDate}.

Extrais pour chaque ligne (jour) les données suivantes au format JSON strict:
{
  "jours": [
    {
      "date": "YYYY-MM-DD",
      "ageJours": number,
      "decesJour": number,
      "alimentKg": number,
      "eauLitres": number,
      "poidsMinG": number | null,
      "poidsMaxG": number | null,
      "traitement": string | null
    }
  ]
}

Règles:
- "date": déduis la date exacte depuis la date inscrite sur la fiche (format YYYY-MM-DD)
- "ageJours": le numéro du jour (J1, J2... ou l'âge de l'oiseau)  
- "decesJour": nombre de décès ce jour (colonne "Jour/day" sous Mortalité)
- "alimentKg": quantité d'aliment consommée ce jour en kg (colonne "Jour/day" sous Aliments/Feed)
- "eauLitres": quantité d'eau consommée ce jour en litres (colonne Eau/Water)
- "poidsMinG": poids minimum en grammes si indiqué sur la fiche (convertis depuis kg si nécessaire, ex: 0,080 kg → 80 g), sinon null
- "poidsMaxG": poids maximum en grammes si indiqué sur la fiche (convertis depuis kg si nécessaire), sinon null
- Sur la fiche il peut y avoir 2 colonnes de poids par jour (min et max) — extrait les deux séparément
- "traitement": traitement ou vaccin administré ce jour si lisible, sinon null
- Si une valeur est illisible ou absente, mets 0 pour les numériques et null pour les textes
- Retourne UNIQUEMENT le JSON, sans texte avant ou après`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
      config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
    });

    const rawText = response.text ?? "{}";

    function cleanAndParseJson(text: string): any {
      // Try direct parse first
      try { return JSON.parse(text); } catch {}
      // Extract first JSON object
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      let s = match[0];
      // Remove single-line comments (// ...)
      s = s.replace(/\/\/[^\n]*/g, "");
      // Remove multi-line comments (/* ... */)
      s = s.replace(/\/\*[\s\S]*?\*\//g, "");
      // Remove trailing commas before } or ]
      s = s.replace(/,\s*([\]}])/g, "$1");
      // Replace undefined with null
      s = s.replace(/:\s*undefined/g, ": null");
      try { return JSON.parse(s); } catch {}
      return null;
    }

    const parsed = cleanAndParseJson(rawText) ?? { jours: [] };
    res.json({ jours: parsed.jours || [], bandeId, startDate });
  } catch (e: any) {
    req.log.error({ err: e }, "parse-fiche error");
    const userMsg = (e.message || "").includes("JSON")
      ? "L'IA a retourné une réponse mal formatée. Réessayez avec une photo plus nette ou recadrez la fiche."
      : (e.message || "Erreur lors de l'analyse");
    res.status(500).json({ error: userMsg });
  }
});

router.post("/:id/import-fiche", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  try {
    const bandeId = parseInt(req.params.id);
    const { jours } = req.body as { jours: Array<{date: string; ageJours: number; decesJour: number; alimentKg: number; eauLitres: number; poidsMinG?: number | null; poidsMaxG?: number | null; traitement?: string | null}> };
    if (!Array.isArray(jours) || !jours.length) { res.status(400).json({ error: "Aucune donnée à importer" }); return; }

    let imported = 0;
    for (const j of jours) {
      if (j.decesJour > 0 || j.decesJour === 0) {
        const existing = await db.select().from(mortaliteJournaliereTable).where(and(eq(mortaliteJournaliereTable.bandeId, bandeId), eq(mortaliteJournaliereTable.date, j.date)));
        if (!existing.length) {
          await db.insert(mortaliteJournaliereTable).values({ bandeId, date: j.date, ageJours: j.ageJours, decesJour: j.decesJour });
        }
      }
      if (j.alimentKg > 0) {
        const existing = await db.select().from(consommationAlimentTable).where(and(eq(consommationAlimentTable.bandeId, bandeId), eq(consommationAlimentTable.date, j.date)));
        if (!existing.length) {
          await db.insert(consommationAlimentTable).values({ bandeId, date: j.date, quantiteKg: String(j.alimentKg) });
        }
      }
      if (j.eauLitres > 0) {
        const existing = await db.select().from(consommationEauTable).where(and(eq(consommationEauTable.bandeId, bandeId), eq(consommationEauTable.date, j.date)));
        if (!existing.length) {
          await db.insert(consommationEauTable).values({ bandeId, date: j.date, ageJours: j.ageJours, quantiteLitres: String(j.eauLitres) });
        }
      }
      const hasMin = j.poidsMinG != null && j.poidsMinG > 0;
      const hasMax = j.poidsMaxG != null && j.poidsMaxG > 0;
      if (hasMin || hasMax) {
        const poidsMoyenG = hasMin && hasMax
          ? Math.round(((j.poidsMinG as number) + (j.poidsMaxG as number)) / 2)
          : (j.poidsMinG ?? j.poidsMaxG) as number;
        const existing = await db.select().from(peseesTable).where(and(eq(peseesTable.bandeId, bandeId), eq(peseesTable.date, j.date)));
        if (!existing.length) {
          await db.insert(peseesTable).values({ bandeId, date: j.date, ageJours: j.ageJours, poidsMoyenG: String(poidsMoyenG) });
        }
      }
      if (j.traitement) {
        await db.insert(traitementsTable).values({ bandeId, date: j.date, ageJours: j.ageJours, produit: j.traitement, type: "preventif" });
      }
      imported++;
    }
    res.json({ success: true, imported });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id/actifs", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const allocations = await db.select().from(bandeActifsTable).where(eq(bandeActifsTable.bandeId, bandeId));
  const result = await Promise.all(allocations.map(async (a) => {
    const actifRows = await db.select().from(actifsTable).where(eq(actifsTable.id, a.actifId));
    if (actifRows.length === 0) return null;
    const actif = actifRows[0];
    const bande = await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId));
    const bandeRow = bande[0];
    const fraction = parseFloat(a.fractionUtilisee);
    const valeur = parseFloat(actif.valeur);
    const taux = parseFloat(actif.tauxAmortissementAnnuel);
    const dateDebut = bandeRow?.dateDeDepart ? new Date(bandeRow.dateDeDepart) : new Date();
    const dureeJours = Math.max(1, Math.floor((Date.now() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)));
    // Amortissement PAR BANDE = valeur × (taux/100) × fraction utilisée
    // (taux est désormais "par bande", indépendant de la durée)
    void dureeJours;
    const amortissement = valeur * fraction * (taux / 100);
    return {
      id: a.id,
      actifId: a.actifId,
      bandeId: a.bandeId,
      fractionUtilisee: fraction,
      actif: { ...actif, valeur, tauxAmortissementAnnuel: taux },
      amortissement: Math.round(amortissement),
    };
  }));
  res.json(result.filter(Boolean));
});

router.post("/:id/actifs", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const bandeId = parseInt(req.params.id);
  const { actifId, fractionUtilisee } = req.body;
  if (!actifId) return res.status(400).json({ message: "actifId requis" });
  const rows = await db.insert(bandeActifsTable).values({
    bandeId,
    actifId: parseInt(actifId),
    fractionUtilisee: String(fractionUtilisee ?? 1),
  }).returning();
  res.status(201).json(rows[0]);
});

router.put("/:id/actifs/:allocationId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const allocationId = parseInt(req.params.allocationId);
  const { fractionUtilisee } = req.body;
  const rows = await db.update(bandeActifsTable).set({ fractionUtilisee: String(fractionUtilisee) }).where(eq(bandeActifsTable.id, allocationId)).returning();
  if (rows.length === 0) return res.status(404).json({ message: "Allocation introuvable" });
  res.json(rows[0]);
});

router.delete("/:id/actifs/:allocationId", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const allocationId = parseInt(req.params.allocationId);
  await db.delete(bandeActifsTable).where(eq(bandeActifsTable.id, allocationId));
  res.json({ success: true });
});

export default router;
