import { Router } from "express";
import { db, stockAlimentsTable, stockMedicamentsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { logFromRequest } from "./activity-log";
import { requireWriteAccess } from "../lib/middleware";
import { validateBody } from "../lib/validate";
import { stockAlimentSchema, stockMedicamentSchema } from "../lib/schemas";

const router = Router();

function normalizeDesignation(str: string): string {
  if (!str) return str;
  return str
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

const SUGGESTIONS_ALIMENTS_BASE: Array<{ designation: string; prixMoyen: number }> = [
  { designation: "Aliment démarrage", prixMoyen: 9400 },
  { designation: "Aliment croissance", prixMoyen: 7500 },
  { designation: "Aliment finition", prixMoyen: 9600 },
  { designation: "Aliment finitions", prixMoyen: 9600 },
  { designation: "Concentré", prixMoyen: 52000 },
  { designation: "Complément aliment", prixMoyen: 15000 },
  { designation: "Son de blé", prixMoyen: 3000 },
  { designation: "Maïs", prixMoyen: 5000 },
  { designation: "Tourteau de soja", prixMoyen: 8000 },
  { designation: "Lait en poudre", prixMoyen: 25000 },
];

const SUGGESTIONS_MEDICAMENTS_BASE: Array<{ nom: string; unite: string }> = [
  { nom: "Vaccin Newcastle", unite: "flacon" },
  { nom: "Vaccin Gumboro", unite: "flacon" },
  { nom: "Vaccin Bronchite infectieuse", unite: "flacon" },
  { nom: "Vitamines", unite: "kg" },
  { nom: "Antibiotique", unite: "sachet" },
  { nom: "Anticoccidien", unite: "kg" },
  { nom: "Antistress", unite: "sachet" },
  { nom: "Désinfectant", unite: "litre" },
  { nom: "Vermifuge", unite: "sachet" },
  { nom: "Probiotique", unite: "sachet" },
  { nom: "Électrolytes", unite: "sachet" },
  { nom: "Hépatique", unite: "litre" },
  { nom: "Florfénicol", unite: "litre" },
  { nom: "Amoxicilline", unite: "sachet" },
];

router.get("/aliments/suggestions", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT designation,
      ROUND(AVG(prix_unitaire::numeric), 0)::float AS prix_moyen,
      COUNT(*)::int AS frequence
    FROM (
      SELECT designation, prix_unitaire
      FROM stock_aliments
      WHERE designation IS NOT NULL AND TRIM(designation) <> ''
      UNION ALL
      SELECT designation, prix_unitaire
      FROM bande_depenses
      WHERE categorie IN ('aliments', 'concentre')
        AND designation IS NOT NULL AND TRIM(designation) <> ''
    ) combined
    GROUP BY designation
    ORDER BY frequence DESC, designation ASC
    LIMIT 100
  `);
  const aggregated: Array<{ designation: string; prixMoyen: number; frequence: number }> =
    (rows as any).rows.map((r: any) => ({
      designation: r.designation,
      prixMoyen: Number(r.prix_moyen ?? 0),
      frequence: Number(r.frequence ?? 0),
    }));

  const seen = new Set(aggregated.map((a) => a.designation.toLowerCase().trim()));
  for (const s of SUGGESTIONS_ALIMENTS_BASE) {
    if (!seen.has(s.designation.toLowerCase().trim())) {
      aggregated.push({ ...s, frequence: 0 });
    }
  }
  res.json(aggregated);
});

router.get("/medicaments/suggestions", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT nom, unite, COUNT(*)::int AS frequence
    FROM stock_medicaments
    WHERE nom IS NOT NULL AND TRIM(nom) <> ''
    GROUP BY nom, unite
    ORDER BY frequence DESC, nom ASC
    LIMIT 100
  `);
  const aggregated: Array<{ nom: string; unite: string; frequence: number }> =
    (rows as any).rows.map((r: any) => ({
      nom: r.nom,
      unite: r.unite ?? "unité",
      frequence: Number(r.frequence ?? 0),
    }));

  const seen = new Set(aggregated.map((a) => a.nom.toLowerCase().trim()));
  for (const s of SUGGESTIONS_MEDICAMENTS_BASE) {
    if (!seen.has(s.nom.toLowerCase().trim())) {
      aggregated.push({ ...s, frequence: 0 });
    }
  }
  res.json(aggregated);
});

router.get("/fournisseurs/suggestions", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT fournisseur, COUNT(*)::int AS frequence FROM (
      SELECT fournisseur FROM stock_aliments
      WHERE fournisseur IS NOT NULL AND TRIM(fournisseur) <> ''
      UNION ALL
      SELECT fournisseur FROM stock_medicaments
      WHERE fournisseur IS NOT NULL AND TRIM(fournisseur) <> ''
    ) combined
    GROUP BY fournisseur
    ORDER BY frequence DESC, fournisseur ASC
    LIMIT 100
  `);
  const list: Array<{ fournisseur: string; frequence: number }> =
    (rows as any).rows.map((r: any) => ({
      fournisseur: r.fournisseur,
      frequence: Number(r.frequence ?? 0),
    }));
  res.json(list);
});

router.get("/aliments", async (_req, res) => {
  const rows = await db.select().from(stockAlimentsTable).orderBy(desc(stockAlimentsTable.date));
  const items = rows.map(r => ({
    ...r,
    quantiteKg: parseFloat(r.quantiteKg),
    prixUnitaire: r.prixUnitaire != null ? parseFloat(r.prixUnitaire) : null,
  }));

  const entrees = items.filter(i => i.type === "entree").reduce((s, i) => s + i.quantiteKg, 0);
  const sorties = items.filter(i => i.type === "sortie").reduce((s, i) => s + i.quantiteKg, 0);
  const stockActuel = entrees - sorties;

  res.json({ items, stockActuel, totalEntrees: entrees, totalSorties: sorties });
});

router.post("/aliments", validateBody(stockAlimentSchema), async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { designation, type, quantiteKg, prixUnitaire, fournisseur, date, commentaire } = req.body;
  const designationNorm = normalizeDesignation(designation);
  const fournisseurNorm = fournisseur ? normalizeDesignation(fournisseur) : fournisseur;
  const [row] = await db.insert(stockAlimentsTable).values({
    designation: designationNorm, type: type || "entree",
    quantiteKg: String(quantiteKg), prixUnitaire: prixUnitaire != null ? String(prixUnitaire) : null,
    fournisseur: fournisseurNorm, date, commentaire,
  }).returning();
  await logFromRequest(req, "Stock aliment", `${type === "sortie" ? "Sortie" : "Entrée"} : ${designationNorm} - ${quantiteKg} kg`);
  res.status(201).json({ ...row, quantiteKg: parseFloat(row.quantiteKg), prixUnitaire: row.prixUnitaire != null ? parseFloat(row.prixUnitaire) : null });
});

router.delete("/aliments/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  await db.delete(stockAlimentsTable).where(eq(stockAlimentsTable.id, id));
  res.json({ success: true });
});

router.get("/medicaments", async (_req, res) => {
  const rows = await db.select().from(stockMedicamentsTable).orderBy(desc(stockMedicamentsTable.date));
  const items = rows.map(r => ({
    ...r,
    quantite: parseFloat(r.quantite),
  }));

  const grouped: Record<string, { nom: string; stockActuel: number; unite: string; datePeremption: string | null }> = {};
  for (const item of items) {
    if (!grouped[item.nom]) grouped[item.nom] = { nom: item.nom, stockActuel: 0, unite: item.unite, datePeremption: item.datePeremption };
    if (item.type === "entree") grouped[item.nom].stockActuel += item.quantite;
    else grouped[item.nom].stockActuel -= item.quantite;
    if (item.datePeremption) grouped[item.nom].datePeremption = item.datePeremption;
  }

  const peremptionProche = Object.values(grouped).filter(g => {
    if (!g.datePeremption) return false;
    const diff = new Date(g.datePeremption).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  res.json({ items, resume: Object.values(grouped), peremptionProche });
});

router.post("/medicaments", validateBody(stockMedicamentSchema), async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const { nom, type, quantite, unite, datePeremption, fournisseur, date, commentaire } = req.body;
  const nomNorm = normalizeDesignation(nom);
  const fournisseurNorm = fournisseur ? normalizeDesignation(fournisseur) : fournisseur;
  const [row] = await db.insert(stockMedicamentsTable).values({
    nom: nomNorm, type: type || "entree",
    quantite: String(quantite), unite: unite || "unité",
    datePeremption, fournisseur: fournisseurNorm, date, commentaire,
  }).returning();
  await logFromRequest(req, "Stock médicament", `${type === "sortie" ? "Sortie" : "Entrée"} : ${nomNorm} - ${quantite} ${unite || "unité"}`);
  res.status(201).json({ ...row, quantite: parseFloat(row.quantite) });
});

router.delete("/medicaments/:id", async (req, res) => {
  if (!(await requireWriteAccess(req, res))) return;
  const id = parseInt(req.params.id);
  await db.delete(stockMedicamentsTable).where(eq(stockMedicamentsTable.id, id));
  res.json({ success: true });
});

export default router;
