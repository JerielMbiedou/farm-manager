import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, financementTable, devisConstructionTable, puitsItemsTable, sortiesArgentTable, sortiesCarburantTable, depensesBatimentTable, depensesPuitsTable, bandesTable, bandeDepensesTable, bandeVentesTable, chargesFixesTable, depensesVenteTable } from "@workspace/db";

const router = Router();

router.get("/summary", async (req, res) => {
  const financements = await db.select().from(financementTable);
  const totalFinance = financements.reduce((s, f) => s + parseFloat(f.montant), 0);

  const devisRows = await db.select().from(devisConstructionTable).limit(1);
  const puitsItemsDevis = await db.select().from(puitsItemsTable);
  const totalPuitsDevis = puitsItemsDevis.reduce((s, p) => s + parseFloat(p.quantite) * parseFloat(p.prixUnitaire), 0);
  const devis = devisRows[0];
  const totalDevis = devis ? parseFloat(devis.batimentEstime) + parseFloat(devis.carburantEstime) + totalPuitsDevis : 3675000;

  const sorties = await db.select().from(sortiesArgentTable);
  const sortiesCarb = await db.select().from(sortiesCarburantTable);
  const batimentItems = await db.select().from(depensesBatimentTable);
  const puitsItemsReal = await db.select().from(depensesPuitsTable);

  const totalSorties = sorties.reduce((s, r) => s + parseFloat(r.depense), 0);
  const totalCarburant = sortiesCarb.reduce((s, r) => s + parseFloat(r.montant), 0);
  const totalBatiment = batimentItems.reduce((s, r) => s + parseFloat(r.quantite) * parseFloat(r.prixUnitaire), 0);
  const totalPuitsReal = puitsItemsReal.reduce((s, r) => s + parseFloat(r.quantite) * parseFloat(r.prixUnitaire), 0);
  const totalDepenseConstruction = totalSorties + totalCarburant + totalBatiment + totalPuitsReal;

  const bandes = await db.select().from(bandesTable).orderBy(bandesTable.numero);
  const bandesActives = [];

  for (const bande of bandes) {
    const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bande.id));
    const ventes = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, bande.id));
    const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, bande.id));
    const depVenteRows = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, bande.id));

    const totalDepBande = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
    const totalRecettesBande = ventes.reduce((s, v) => s + v.quantiteVendue * parseFloat(v.prixUnitaire), 0);
    const loyer = chargesRows.length > 0 ? parseFloat(chargesRows[0].loyer) : 0;
    const valeurPerdue = parseFloat(bande.valeurMaterielFixe) * 0.1;
    const imprevus = totalDepBande * 0.05;
    const chargesTotal = valeurPerdue + imprevus + loyer;
    const totalDepVente = depVenteRows.reduce((s, d) => s + parseFloat(d.montant), 0);
    const coutProduction = totalDepBande + chargesTotal;
    const beneficeEstime = totalRecettesBande - totalDepBande - chargesTotal - totalDepVente;
    const sujetsVivants = bande.sujetsDepart - bande.nombreDeces;

    if (bande.statut === "active") {
      bandesActives.push({
        id: bande.id,
        nom: bande.nom,
        sujetsVivants,
        coutProduction,
        totalRecettes: totalRecettesBande,
        beneficeEstime,
      });
    }
  }

  const allDepenses = await db.select().from(bandeDepensesTable);
  const depensesMap: Record<string, number> = {};
  for (const d of allDepenses) {
    const montant = parseFloat(d.quantite) * parseFloat(d.prixUnitaire);
    depensesMap[d.categorie] = (depensesMap[d.categorie] ?? 0) + montant;
  }
  const depensesParCategorie = Object.entries(depensesMap).map(([categorie, montant]) => ({ categorie, montant }));

  const caisseDisponible = totalFinance - totalDepenseConstruction;
  const alerteDepassementBudget = totalDepenseConstruction > totalDevis;

  res.json({
    totalFinance,
    totalDevis,
    totalDepenseConstruction,
    caisseDisponible,
    nombreBandes: bandes.length,
    bandesActives,
    alerteDepassementBudget,
    depensesParCategorie,
  });
});

export default router;
