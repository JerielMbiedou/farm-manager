import { Router } from "express";
import { db, sortiesArgentTable, sortiesCarburantTable, depensesBatimentTable, depensesPuitsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/sorties", async (req, res) => {
  const rows = await db.select().from(sortiesArgentTable).orderBy(sortiesArgentTable.date);
  res.json(rows.map(r => ({
    id: r.id,
    date: r.date,
    decaisse: parseFloat(r.decaisse),
    depense: parseFloat(r.depense),
    reste: parseFloat(r.decaisse) - parseFloat(r.depense),
  })));
});

router.post("/sorties", async (req, res) => {
  const { date, decaisse, depense } = req.body;
  const rows = await db.insert(sortiesArgentTable).values({ date, decaisse: String(decaisse), depense: String(depense) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, date: r.date, decaisse: parseFloat(r.decaisse), depense: parseFloat(r.depense), reste: parseFloat(r.decaisse) - parseFloat(r.depense) });
});

router.put("/sorties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { date, decaisse, depense } = req.body;
  const rows = await db.update(sortiesArgentTable).set({ date, decaisse: String(decaisse), depense: String(depense) }).where(eq(sortiesArgentTable.id, id)).returning();
  const r = rows[0];
  res.json({ id: r.id, date: r.date, decaisse: parseFloat(r.decaisse), depense: parseFloat(r.depense), reste: parseFloat(r.decaisse) - parseFloat(r.depense) });
});

router.delete("/sorties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(sortiesArgentTable).where(eq(sortiesArgentTable.id, id));
  res.json({ success: true });
});

router.get("/carburant", async (req, res) => {
  const rows = await db.select().from(sortiesCarburantTable).orderBy(sortiesCarburantTable.date);
  res.json(rows.map(r => ({ id: r.id, date: r.date, montant: parseFloat(r.montant) })));
});

router.post("/carburant", async (req, res) => {
  const { date, montant } = req.body;
  const rows = await db.insert(sortiesCarburantTable).values({ date, montant: String(montant) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, date: r.date, montant: parseFloat(r.montant) });
});

router.put("/carburant/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { date, montant } = req.body;
  const rows = await db.update(sortiesCarburantTable).set({ date, montant: String(montant) }).where(eq(sortiesCarburantTable.id, id)).returning();
  const r = rows[0];
  res.json({ id: r.id, date: r.date, montant: parseFloat(r.montant) });
});

router.delete("/carburant/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(sortiesCarburantTable).where(eq(sortiesCarburantTable.id, id));
  res.json({ success: true });
});

router.get("/batiment-items", async (req, res) => {
  const rows = await db.select().from(depensesBatimentTable);
  res.json(rows.map(r => ({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) })));
});

router.post("/batiment-items", async (req, res) => {
  const { designation, quantite, prixUnitaire } = req.body;
  const rows = await db.insert(depensesBatimentTable).values({ designation, quantite: String(quantite), prixUnitaire: String(prixUnitaire) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) });
});

router.put("/batiment-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { designation, quantite, prixUnitaire } = req.body;
  const rows = await db.update(depensesBatimentTable).set({ designation, quantite: String(quantite), prixUnitaire: String(prixUnitaire) }).where(eq(depensesBatimentTable.id, id)).returning();
  const r = rows[0];
  res.json({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) });
});

router.delete("/batiment-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(depensesBatimentTable).where(eq(depensesBatimentTable.id, id));
  res.json({ success: true });
});

router.get("/puits-items", async (req, res) => {
  const rows = await db.select().from(depensesPuitsTable);
  res.json(rows.map(r => ({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) })));
});

router.post("/puits-items", async (req, res) => {
  const { designation, quantite, prixUnitaire } = req.body;
  const rows = await db.insert(depensesPuitsTable).values({ designation, quantite: String(quantite), prixUnitaire: String(prixUnitaire) }).returning();
  const r = rows[0];
  res.status(201).json({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) });
});

router.put("/puits-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { designation, quantite, prixUnitaire } = req.body;
  const rows = await db.update(depensesPuitsTable).set({ designation, quantite: String(quantite), prixUnitaire: String(prixUnitaire) }).where(eq(depensesPuitsTable.id, id)).returning();
  const r = rows[0];
  res.json({ id: r.id, designation: r.designation, quantite: parseFloat(r.quantite), prixUnitaire: parseFloat(r.prixUnitaire), prixTotal: parseFloat(r.quantite) * parseFloat(r.prixUnitaire) });
});

router.delete("/puits-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(depensesPuitsTable).where(eq(depensesPuitsTable.id, id));
  res.json({ success: true });
});

export default router;
