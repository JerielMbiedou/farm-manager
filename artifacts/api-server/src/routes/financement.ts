import { Router } from "express";
import { db, financementTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(financementTable).orderBy(financementTable.createdAt);
  res.json(rows.map(r => ({
    id: r.id,
    nom: r.nom,
    montant: parseFloat(r.montant),
    date: r.date,
    createdAt: r.createdAt,
  })));
});

router.post("/", async (req, res) => {
  const { nom, montant, date } = req.body;
  const rows = await db.insert(financementTable).values({ nom, montant: String(montant), date }).returning();
  const r = rows[0];
  res.status(201).json({
    id: r.id,
    nom: r.nom,
    montant: parseFloat(r.montant),
    date: r.date,
    createdAt: r.createdAt,
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nom, montant, date } = req.body;
  const rows = await db.update(financementTable).set({ nom, montant: String(montant), date }).where(eq(financementTable.id, id)).returning();
  const r = rows[0];
  res.json({
    id: r.id,
    nom: r.nom,
    montant: parseFloat(r.montant),
    date: r.date,
    createdAt: r.createdAt,
  });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(financementTable).where(eq(financementTable.id, id));
  res.json({ success: true });
});

export default router;
