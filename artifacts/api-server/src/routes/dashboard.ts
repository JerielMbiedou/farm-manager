import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, financementTable, remboursementsTable, devisConstructionTable, puitsItemsTable, sortiesArgentTable, sortiesCarburantTable, depensesBatimentTable, depensesPuitsTable, bandesTable, bandeDepensesTable, bandeVentesTable, chargesFixesTable, depensesVenteTable, mortaliteJournaliereTable, vaccinationsTable } from "@workspace/db";

const router = Router();

router.get("/summary", async (req, res) => {
  const financements = await db.select().from(financementTable);
  const totalFinance = financements.reduce((s, f) => s + parseFloat(f.montant), 0);

  const remboursements = await db.select().from(remboursementsTable);
  const totalRembourse = remboursements.reduce((s, r) => s + parseFloat(r.montant), 0);

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
  const bandesTerminees = [];

  for (const bande of bandes) {
    const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bande.id));
    const ventes = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, bande.id));
    const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, bande.id));
    const depVenteRows = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, bande.id));
    const mortaliteRows = await db.select().from(mortaliteJournaliereTable).where(eq(mortaliteJournaliereTable.bandeId, bande.id));

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
    const totalDeces = mortaliteRows.reduce((s, m) => s + m.decesJour, 0);
    const tauxMortalite = bande.sujetsDepart > 0 ? (totalDeces / bande.sujetsDepart) * 100 : 0;
    const totalVendus = ventes.reduce((s, v) => s + v.quantiteVendue, 0);

    const bandeData = {
      id: bande.id,
      nom: bande.nom,
      sujetsDepart: bande.sujetsDepart,
      sujetsVivants,
      coutProduction,
      totalRecettes: totalRecettesBande,
      beneficeEstime,
      tauxMortalite: Math.round(tauxMortalite * 100) / 100,
      totalDeces,
      totalVendus,
      createdAt: bande.createdAt,
      dateDeDepart: bande.dateDeDepart,
    };

    if (bande.statut === "active") {
      bandesActives.push(bandeData);
    } else {
      bandesTerminees.push(bandeData);
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

  let prochainesVaccinations: Array<{ bandeNom: string; vaccinNom: string; datePrevue: string; enRetard: boolean }> = [];
  for (const bande of bandes) {
    if (bande.statut !== "active") continue;
    const vaccins = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.bandeId, bande.id));
    const startDate = new Date(bande.dateDeDepart);
    for (const v of vaccins) {
      if (v.fait === "oui") continue;
      const datePrevue = new Date(startDate);
      datePrevue.setDate(datePrevue.getDate() + v.jourPrevu - 1);
      prochainesVaccinations.push({
        bandeNom: bande.nom,
        vaccinNom: v.nom,
        datePrevue: datePrevue.toISOString().split("T")[0],
        enRetard: datePrevue < new Date(),
      });
    }
  }
  prochainesVaccinations.sort((a, b) => a.datePrevue.localeCompare(b.datePrevue));
  prochainesVaccinations = prochainesVaccinations.slice(0, 5);

  let previsions = null;
  if (bandesTerminees.length > 0) {
    const avgCoutProduction = bandesTerminees.reduce((s, b) => s + b.coutProduction, 0) / bandesTerminees.length;
    const avgBenefice = bandesTerminees.reduce((s, b) => s + b.beneficeEstime, 0) / bandesTerminees.length;
    const avgDureeMs = bandesTerminees.reduce((s, b) => {
      const start = new Date(b.dateDeDepart).getTime();
      return s + (Date.now() - start);
    }, 0) / bandesTerminees.length;
    const avgDureeJours = Math.round(avgDureeMs / (1000 * 60 * 60 * 24));

    previsions = {
      coutProductionEstime: Math.round(avgCoutProduction),
      beneficeProbable: Math.round(avgBenefice),
      dureeMoyenneJours: avgDureeJours,
    };
  }

  res.json({
    totalFinance,
    totalRembourse,
    totalDevis,
    totalDepenseConstruction,
    caisseDisponible,
    nombreBandes: bandes.length,
    bandesActives,
    bandesTerminees,
    alerteDepassementBudget,
    depensesParCategorie,
    prochainesVaccinations,
    previsions,
  });
});

router.get("/comparaison-bandes", async (req, res) => {
  const bandes = await db.select().from(bandesTable).orderBy(bandesTable.numero);
  const result = [];

  for (const bande of bandes) {
    const depenses = await db.select().from(bandeDepensesTable).where(eq(bandeDepensesTable.bandeId, bande.id));
    const ventes = await db.select().from(bandeVentesTable).where(eq(bandeVentesTable.bandeId, bande.id));
    const chargesRows = await db.select().from(chargesFixesTable).where(eq(chargesFixesTable.bandeId, bande.id));
    const depVenteRows = await db.select().from(depensesVenteTable).where(eq(depensesVenteTable.bandeId, bande.id));

    const totalDepBande = depenses.reduce((s, d) => s + parseFloat(d.quantite) * parseFloat(d.prixUnitaire), 0);
    const totalRecettes = ventes.reduce((s, v) => s + v.quantiteVendue * parseFloat(v.prixUnitaire), 0);
    const loyer = chargesRows.length > 0 ? parseFloat(chargesRows[0].loyer) : 0;
    const valeurPerdue = parseFloat(bande.valeurMaterielFixe) * 0.1;
    const imprevus = totalDepBande * 0.05;
    const chargesTotal = valeurPerdue + imprevus + loyer;
    const totalDepVente = depVenteRows.reduce((s, d) => s + parseFloat(d.montant), 0);
    const beneficeNet = totalRecettes - totalDepBande - chargesTotal - totalDepVente;
    const totalVendus = ventes.reduce((s, v) => s + v.quantiteVendue, 0);
    const tauxMortalite = bande.sujetsDepart > 0 ? (bande.nombreDeces / bande.sujetsDepart) * 100 : 0;
    const coutParSujet = bande.sujetsDepart > 0 ? (totalDepBande + chargesTotal) / bande.sujetsDepart : 0;
    const prixVenteMoyen = totalVendus > 0 ? totalRecettes / totalVendus : 0;

    const startDate = new Date(bande.dateDeDepart);
    const dureeJours = Math.round((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const coutTotal = totalDepBande + chargesTotal + totalDepVente;
    const seuilNombrePoulets = prixVenteMoyen > 0 ? Math.ceil(coutTotal / prixVenteMoyen) : 0;
    const sujetsRestants = bande.sujetsDepart - bande.nombreDeces;
    const seuilPrixMin = sujetsRestants > 0 ? Math.round(coutTotal / sujetsRestants) : 0;
    const margeSecurite = totalRecettes > 0 ? ((totalRecettes - coutTotal) / totalRecettes) * 100 : 0;

    result.push({
      id: bande.id,
      numero: bande.numero,
      nom: bande.nom,
      statut: bande.statut,
      sujetsDepart: bande.sujetsDepart,
      nombreDeces: bande.nombreDeces,
      tauxMortalite: Math.round(tauxMortalite * 100) / 100,
      coutParSujet: Math.round(coutParSujet),
      prixVenteMoyen: Math.round(prixVenteMoyen),
      beneficeNet: Math.round(beneficeNet),
      dureeJours,
      totalVendus,
      seuilNombrePoulets,
      seuilPrixMin,
      margeSecurite: Math.round(margeSecurite * 100) / 100,
    });
  }

  res.json(result);
});

router.get("/historique-caisse", async (req, res) => {
  const financements = await db.select().from(financementTable).orderBy(financementTable.createdAt);
  const sortiesArgent = await db.select().from(sortiesArgentTable).orderBy(sortiesArgentTable.createdAt);
  const sortiesCarburant = await db.select().from(sortiesCarburantTable).orderBy(sortiesCarburantTable.createdAt);
  const rembRows = await db.select().from(remboursementsTable).orderBy(remboursementsTable.createdAt);

  type CaisseEntry = { date: string; type: "entree" | "sortie"; categorie: string; designation: string; montant: number; timestamp: Date };
  const entries: CaisseEntry[] = [];

  for (const f of financements) {
    entries.push({ date: f.date, type: "entree", categorie: "Financement", designation: `Investissement de ${f.nom}`, montant: parseFloat(f.montant), timestamp: f.createdAt });
  }
  for (const s of sortiesArgent) {
    entries.push({ date: s.date, type: "sortie", categorie: "Sortie argent", designation: `Décaissement`, montant: parseFloat(s.depense), timestamp: s.createdAt });
  }
  for (const c of sortiesCarburant) {
    entries.push({ date: c.date, type: "sortie", categorie: "Carburant", designation: `Carburant`, montant: parseFloat(c.montant), timestamp: c.createdAt });
  }
  for (const r of rembRows) {
    entries.push({ date: r.date, type: "sortie", categorie: "Remboursement", designation: `Remboursement ${r.investisseurNom}`, montant: parseFloat(r.montant), timestamp: r.createdAt });
  }

  entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let solde = 0;
  const result = entries.map(e => {
    if (e.type === "entree") solde += e.montant;
    else solde -= e.montant;
    return { ...e, soldeApres: Math.round(solde), timestamp: undefined };
  });

  res.json({ entries: result, soldeCourant: Math.round(solde) });
});

export default router;
