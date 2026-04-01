import { Router } from "express";
import { db, bandesTable, bandeDepensesTable, bandeVentesTable, chargesFixesTable, depensesVenteTable, mortaliteJournaliereTable, peseesTable, consommationAlimentTable, vaccinationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function getBandeDetail(id: number) {
  const bandeRows = await db.select().from(bandesTable).where(eq(bandesTable.id, id));
  if (bandeRows.length === 0) return null;
  const bande = bandeRows[0];

  const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, id));
  const ventes = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, id));
  const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, id));
  const depensesVente = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, id));

  const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
  const totalRecettes = ventes.reduce((s, v) => s + v.quantiteVendue * parseFloat(v.prixUnitaire), 0);

  const valeurMateriel = parseFloat(bande.valeurMaterielFixe);
  const valeurPerdueMateriel = valeurMateriel * 0.1;
  const imprevus = totalDepenses * 0.05;
  const loyer = chargesRows.length > 0 ? parseFloat(chargesRows[0].loyer) : 0;
  const chargesFixesTotal = valeurPerdueMateriel + imprevus + loyer;

  const sujetsRestants = bande.sujetsDepart - bande.nombreDeces;
  const totalDepensesVente = depensesVente.reduce((s, d) => s + parseFloat(d.montant), 0);
  const beneficeNetSansCharges = totalRecettes - totalDepenses - totalDepensesVente;
  const beneficeNet = totalRecettes - totalDepenses - chargesFixesTotal - totalDepensesVente;
  const coutParSujet = bande.sujetsDepart > 0 ? (totalDepenses + chargesFixesTotal) / bande.sujetsDepart : 0;

  return {
    id: bande.id,
    numero: bande.numero,
    nom: bande.nom,
    sujetsDepart: bande.sujetsDepart,
    nombreDeces: bande.nombreDeces,
    sujetsRestants,
    valeurMaterielFixe: valeurMateriel,
    statut: bande.statut,
    totalDepenses,
    totalRecettes,
    chargesFixesTotal,
    beneficeNet,
    beneficeNetSansCharges,
    coutParSujet,
    createdAt: bande.createdAt,
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(bandesTable).orderBy(bandesTable.numero);
  res.json(rows.map(r => ({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
  })));
});

router.post("/", async (req, res) => {
  const { nom, sujetsDepart, nombreDeces, valeurMaterielFixe, statut } = req.body;
  const count = await db.select().from(bandesTable);
  const numero = count.length + 1;
  const rows = await db.insert(bandesTable).values({
    numero,
    nom,
    sujetsDepart,
    nombreDeces: nombreDeces ?? 0,
    valeurMaterielFixe: String(valeurMaterielFixe ?? 0),
    statut: statut ?? "active",
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
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

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nom, sujetsDepart, nombreDeces, valeurMaterielFixe, statut } = req.body;
  const updates: Record<string, unknown> = {};
  if (nom !== undefined) updates.nom = nom;
  if (sujetsDepart !== undefined) updates.sujetsDepart = sujetsDepart;
  if (nombreDeces !== undefined) updates.nombreDeces = nombreDeces;
  if (valeurMaterielFixe !== undefined) updates.valeurMaterielFixe = String(valeurMaterielFixe);
  if (statut !== undefined) updates.statut = statut;
  const rows = await db.update(bandesTable).set(updates).where(eq(bandesTable.id, id)).returning();
  const r = rows[0];
  res.json({
    id: r.id,
    numero: r.numero,
    nom: r.nom,
    sujetsDepart: r.sujetsDepart,
    nombreDeces: r.nombreDeces,
    valeurMaterielFixe: parseFloat(r.valeurMaterielFixe),
    statut: r.statut,
    createdAt: r.createdAt,
  });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(bandesTable).where(eq(bandesTable.id, id));
  res.json({ success: true });
});

router.get("/:id/depenses", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bandeId));
  res.json(rows.map(r => ({
    id: r.id,
    bandeId: r.bandeId,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  })));
});

router.post("/:id/depenses", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { designation, categorie, quantite, prixUnitaire } = req.body;
  const rows = await db.insert(bandeDepensesTable).values({
    bandeId,
    designation,
    categorie,
    quantite: String(quantite),
    prixUnitaire: String(prixUnitaire),
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id,
    bandeId: r.bandeId,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  });
});

router.put("/:id/depenses/:depenseId", async (req, res) => {
  const depenseId = parseInt(req.params.depenseId);
  const { designation, categorie, quantite, prixUnitaire } = req.body;
  const rows = await db.update(bandeDepensesTable).set({
    designation,
    categorie,
    quantite: String(quantite),
    prixUnitaire: String(prixUnitaire),
  }).where(eq(bandeDepensesTable.id, depenseId)).returning();
  const r = rows[0];
  res.json({
    id: r.id,
    bandeId: r.bandeId,
    designation: r.designation,
    categorie: r.categorie,
    quantite: parseFloat(r.quantite),
    prixUnitaire: parseFloat(r.prixUnitaire),
    montant: parseFloat(r.quantite) * parseFloat(r.prixUnitaire),
  });
});

router.delete("/:id/depenses/:depenseId", async (req, res) => {
  const depenseId = parseInt(req.params.depenseId);
  await db.delete(bandeDepensesTable).where(eq(bandeDepensesTable.id, depenseId));
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

router.post("/:id/ventes", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { date, quantiteVendue, prixUnitaire } = req.body;
  const rows = await db.insert(bandeVentesTable).values({
    bandeId,
    date,
    quantiteVendue,
    prixUnitaire: String(prixUnitaire),
  }).returning();
  const r = rows[0];
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
  const venteId = parseInt(req.params.venteId);
  await db.delete(bandeVentesTable).where(eq(bandeVentesTable.id, venteId));
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
  const valeurPerdueMateriel = parseFloat(bande.valeurMaterielFixe) * 0.1;
  const imprevus = totalDepenses * 0.05;
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
  const valeurPerdueMateriel = parseFloat(bande.valeurMaterielFixe) * 0.1;
  const imprevus = totalDepenses * 0.05;
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
  const bandeId = parseInt(req.params.id);
  const { designation, montant } = req.body;
  const rows = await db.insert(depensesVenteTable).values({ bandeId, designation, montant: String(montant) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, bandeId: r.bandeId, designation: r.designation, montant: parseFloat(r.montant) });
});

router.put("/:id/depenses-vente/:depenseId", async (req, res) => {
  const depenseId = parseInt(req.params.depenseId);
  const { designation, montant } = req.body;
  const rows = await db.update(depensesVenteTable).set({ designation, montant: String(montant) }).where(eq(depensesVenteTable.id, depenseId)).returning();
  const r = rows[0];
  res.json({ id: r.id, bandeId: r.bandeId, designation: r.designation, montant: parseFloat(r.montant) });
});

router.delete("/:id/depenses-vente/:depenseId", async (req, res) => {
  const depenseId = parseInt(req.params.depenseId);
  await db.delete(depensesVenteTable).where(eq(depensesVenteTable.id, depenseId));
  res.json({ success: true });
});

router.get("/:id/mortalite", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bandeId)).orderBy(mortaliteJournaliereTable.ageJours);
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  if (!bande) { res.status(404).json({ error: "Bande introuvable" }); return; }

  let decesCumules = 0;
  const data = rows.map(r => {
    decesCumules += r.decesJour;
    const tauxMortalite = bande.sujetsDepart > 0 ? (decesCumules / bande.sujetsDepart) * 100 : 0;
    const tauxJour = bande.sujetsDepart > 0 ? (r.decesJour / bande.sujetsDepart) * 100 : 0;
    return {
      id: r.id,
      bandeId: r.bandeId,
      date: r.date,
      ageJours: r.ageJours,
      decesJour: r.decesJour,
      decesCumules,
      tauxMortalite: Math.round(tauxMortalite * 100) / 100,
      alerteRouge: tauxJour > 3,
    };
  });
  res.json(data);
});

router.post("/:id/mortalite", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { date, ageJours, decesJour } = req.body;
  const rows = await db.insert(mortaliteJournaliereTable).values({ bandeId, date, ageJours, decesJour: decesJour ?? 0 }).returning();
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  if (bande) {
    await db.update(bandesTable).set({ nombreDeces: bande.nombreDeces + (decesJour ?? 0) }).where(eq(bandesTable.id, bandeId));
  }
  const r = rows[0];
  res.status(201).json({ id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours, decesJour: r.decesJour });
});

router.delete("/:id/mortalite/:mortaliteId", async (req, res) => {
  const mortaliteId = parseInt(req.params.mortaliteId);
  const existing = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.id, mortaliteId));
  if (existing.length > 0) {
    const bandeId = existing[0].bandeId;
    const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
    if (bande) {
      await db.update(bandesTable).set({ nombreDeces: Math.max(0, bande.nombreDeces - existing[0].decesJour) }).where(eq(bandesTable.id, bandeId));
    }
  }
  await db.delete(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.id, mortaliteId));
  res.json({ success: true });
});

router.get("/:id/pesees", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const rows = await db.select().from(peseesTable).where(eq(peseesTable.bandeId, bandeId)).orderBy(peseesTable.ageJours);
  res.json(rows.map(r => ({
    id: r.id,
    bandeId: r.bandeId,
    date: r.date,
    ageJours: r.ageJours,
    poidsMoyenG: parseFloat(r.poidsMoyenG),
    objectifPoidsG: r.objectifPoidsG ? parseFloat(r.objectifPoidsG) : null,
    ecart: r.objectifPoidsG ? parseFloat(r.poidsMoyenG) - parseFloat(r.objectifPoidsG) : null,
    alertePoids: r.objectifPoidsG ? parseFloat(r.poidsMoyenG) < parseFloat(r.objectifPoidsG) * 0.9 : false,
  })));
});

router.post("/:id/pesees", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { date, ageJours, poidsMoyenG, objectifPoidsG } = req.body;
  const rows = await db.insert(peseesTable).values({
    bandeId, date, ageJours,
    poidsMoyenG: String(poidsMoyenG),
    objectifPoidsG: objectifPoidsG ? String(objectifPoidsG) : null,
  }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, date: r.date, ageJours: r.ageJours,
    poidsMoyenG: parseFloat(r.poidsMoyenG),
    objectifPoidsG: r.objectifPoidsG ? parseFloat(r.objectifPoidsG) : null,
  });
});

router.delete("/:id/pesees/:peseeId", async (req, res) => {
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
    const sujetsRestants = bande.sujetsDepart - bande.nombreDeces;
    const poidsGagneTotal = (dernierPoids / 1000) * sujetsRestants;
    if (poidsGagneTotal > 0) {
      ic = Math.round((totalAlimentKg / poidsGagneTotal) * 100) / 100;
      if (ic < 1.8) icStatus = "bon";
      else if (ic <= 2.2) icStatus = "moyen";
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

router.post("/:id/consommation", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { date, quantiteKg } = req.body;
  const rows = await db.insert(consommationAlimentTable).values({ bandeId, date, quantiteKg: String(quantiteKg) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, bandeId: r.bandeId, date: r.date, quantiteKg: parseFloat(r.quantiteKg) });
});

router.delete("/:id/consommation/:consId", async (req, res) => {
  await db.delete(consommationAlimentTable).where(eq(consommationAlimentTable.id, parseInt(req.params.consId)));
  res.json({ success: true });
});

const DEFAULT_VACCINS = [
  { jourPrevu: 1, nom: "Désinfection et installation", description: "Préparation du poulailler" },
  { jourPrevu: 7, nom: "Vaccin Newcastle", description: "Première vaccination contre Newcastle" },
  { jourPrevu: 14, nom: "Vaccin Gumboro", description: "Vaccination contre la maladie de Gumboro" },
  { jourPrevu: 21, nom: "Rappel Newcastle", description: "Rappel de vaccination Newcastle" },
  { jourPrevu: 28, nom: "Vaccin Bronchite infectieuse", description: "Vaccination contre la bronchite infectieuse" },
];

router.get("/:id/vaccinations", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  let rows = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.bandeId, bandeId)).orderBy(vaccinationsTable.jourPrevu);
  if (rows.length === 0) {
    for (const v of DEFAULT_VACCINS) {
      await db.insert(vaccinationsTable).values({ bandeId, ...v, fait: "non" });
    }
    rows = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.bandeId, bandeId)).orderBy(vaccinationsTable.jourPrevu);
  }
  const bande = (await db.select().from(bandesTable).where(eq(bandesTable.id, bandeId)))[0];
  const startDate = bande ? new Date(bande.createdAt) : new Date();

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
  const vaccId = parseInt(req.params.vaccId);
  const { fait, dateFait, commentaire } = req.body;
  const updates: Record<string, unknown> = {};
  if (fait !== undefined) updates.fait = fait;
  if (dateFait !== undefined) updates.dateFait = dateFait;
  if (commentaire !== undefined) updates.commentaire = commentaire;
  const rows = await db.update(vaccinationsTable).set(updates).where(eq(vaccinationsTable.id, vaccId)).returning();
  const r = rows[0];
  res.json({
    id: r.id, bandeId: r.bandeId, jourPrevu: r.jourPrevu, nom: r.nom,
    description: r.description, fait: r.fait, dateFait: r.dateFait, commentaire: r.commentaire,
  });
});

router.post("/:id/vaccinations", async (req, res) => {
  const bandeId = parseInt(req.params.id);
  const { jourPrevu, nom, description } = req.body;
  const rows = await db.insert(vaccinationsTable).values({ bandeId, jourPrevu, nom, description: description || null, fait: "non" }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id, bandeId: r.bandeId, jourPrevu: r.jourPrevu, nom: r.nom,
    description: r.description, fait: r.fait, dateFait: r.dateFait, commentaire: r.commentaire,
  });
});

export default router;
