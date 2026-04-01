import { Router } from "express";
import { db, bandesTable, bandeDepensesTable, bandeVentesTable, chargesFixesTable, depensesVenteTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

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

export default router;
