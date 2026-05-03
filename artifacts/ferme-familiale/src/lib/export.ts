import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBrand, getPhases, getBrandSync, getPhasesSync, preloadBrand } from "./branding";

interface AggregatedDepense {
  categorie: string;
  designation: string;
  quantite: number;
  montant: number;
  prixUnitaireMoyen: number;
}

function aggregateDepenses(depenses: any[]): AggregatedDepense[] {
  const map = new Map<string, AggregatedDepense>();
  for (const d of depenses) {
    const key = `${d.categorie}||${d.designation}`;
    const existing = map.get(key);
    const qte = parseFloat(d.quantite) || 0;
    const montant = parseFloat(d.montant) || (qte * parseFloat(d.prixUnitaire));
    if (existing) {
      existing.quantite += qte;
      existing.montant += montant;
    } else {
      map.set(key, {
        categorie: d.categorie,
        designation: d.designation,
        quantite: qte,
        montant,
        prixUnitaireMoyen: 0,
      });
    }
  }
  const result: AggregatedDepense[] = [];
  for (const item of map.values()) {
    item.prixUnitaireMoyen = item.quantite > 0 ? item.montant / item.quantite : 0;
    result.push(item);
  }
  result.sort((a, b) => a.categorie.localeCompare(b.categorie) || b.montant - a.montant);
  return result;
}

export async function exportBandePDF(detail: any, depenses: any[], ventes: any[], chargesFixes: any, mortalite: any[], pesees: any[], consommation: any) {
  const brand = await getBrand();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(brand.nom, 14, 20);
  doc.setFontSize(14);
  doc.text(`Rapport - ${detail.nom}`, 14, 30);
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 37);

  doc.setFontSize(12);
  doc.text("Résumé", 14, 50);

  autoTable(doc, {
    startY: 55,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Sujets au départ", String(detail.sujetsDepart)],
      ["Décès", String(detail.nombreDeces)],
      ["Sujets restants", String(detail.sujetsRestants)],
      ["Coût de production", formatFCFA(detail.totalDepenses)],
      ["Charges fixes", formatFCFA(detail.chargesFixesTotal)],
      ["Recettes", formatFCFA(detail.totalRecettes)],
      ["Bénéfice net", formatFCFA(detail.beneficeNet)],
      ["Coût par sujet", formatFCFA(detail.coutParSujet)],
    ],
    theme: "striped",
  });

  if (depenses.length > 0) {
    const aggregated = aggregateDepenses(depenses);
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(12);
    doc.text("Dépenses de production (agrégées)", 14, finalY + 10);

    const rows: any[][] = [];
    let currentCat = "";
    let catTotal = 0;
    const addCatTotal = () => {
      if (currentCat && catTotal > 0) {
        rows.push([{ content: `Sous-total ${currentCat}`, colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }, { content: formatFCFA(catTotal), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }]);
      }
    };

    for (const d of aggregated) {
      if (d.categorie !== currentCat) {
        addCatTotal();
        currentCat = d.categorie;
        catTotal = 0;
      }
      catTotal += d.montant;
      rows.push([
        d.categorie,
        d.designation,
        String(Math.round(d.quantite * 100) / 100),
        formatFCFA(Math.round(d.prixUnitaireMoyen)),
        formatFCFA(d.montant),
      ]);
    }
    addCatTotal();

    const grandTotal = aggregated.reduce((s, d) => s + d.montant, 0);
    rows.push([{ content: "TOTAL GÉNÉRAL", colSpan: 4, styles: { fontStyle: "bold", fillColor: [220, 230, 220] } }, { content: formatFCFA(grandTotal), styles: { fontStyle: "bold", fillColor: [220, 230, 220] } }]);

    autoTable(doc, {
      startY: finalY + 15,
      head: [["Catégorie", "Désignation", "Qté totale", "Prix U. moyen", "Montant total"]],
      body: rows,
      theme: "striped",
    });
  }

  if (ventes.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Ventes", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Quantité", "Prix U.", "Montant"]],
      body: ventes.map(v => [
        v.date,
        String(v.quantiteVendue),
        formatFCFA(v.prixUnitaire),
        formatFCFA(v.montant),
      ]),
      theme: "striped",
    });
  }

  doc.save(`rapport_${detail.nom.replace(/\s+/g, "_")}.pdf`);
}

export function exportBandeExcel(detail: any, depenses: any[], ventes: any[], chargesFixes: any) {
  import("xlsx").then(XLSX => {
    const wb = XLSX.utils.book_new();

    const resumeData = [
      ["Indicateur", "Valeur"],
      ["Nom", detail.nom],
      ["Sujets au départ", detail.sujetsDepart],
      ["Décès", detail.nombreDeces],
      ["Sujets restants", detail.sujetsRestants],
      ["Coût de production", detail.totalDepenses],
      ["Charges fixes", detail.chargesFixesTotal],
      ["Recettes", detail.totalRecettes],
      ["Bénéfice net", detail.beneficeNet],
      ["Coût par sujet", detail.coutParSujet],
    ];
    const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
    XLSX.utils.book_append_sheet(wb, wsResume, "Résumé");

    if (depenses.length > 0) {
      const aggregated = aggregateDepenses(depenses);
      const depData: any[][] = [
        ["Catégorie", "Désignation", "Quantité totale", "Prix Unitaire moyen", "Montant total"],
      ];

      let currentCat = "";
      let catTotal = 0;
      for (const d of aggregated) {
        if (d.categorie !== currentCat) {
          if (currentCat && catTotal > 0) {
            depData.push([`Sous-total ${currentCat}`, "", "", "", catTotal]);
          }
          currentCat = d.categorie;
          catTotal = 0;
        }
        catTotal += d.montant;
        depData.push([d.categorie, d.designation, Math.round(d.quantite * 100) / 100, Math.round(d.prixUnitaireMoyen), d.montant]);
      }
      if (currentCat && catTotal > 0) {
        depData.push([`Sous-total ${currentCat}`, "", "", "", catTotal]);
      }
      depData.push(["TOTAL GÉNÉRAL", "", "", "", aggregated.reduce((s, d) => s + d.montant, 0)]);

      const wsDep = XLSX.utils.aoa_to_sheet(depData);
      XLSX.utils.book_append_sheet(wb, wsDep, "Dépenses");
    }

    if (ventes.length > 0) {
      const ventData = [
        ["Date", "Quantité", "Prix Unitaire", "Montant"],
        ...ventes.map(v => [v.date, v.quantiteVendue, v.prixUnitaire, v.montant]),
      ];
      const wsVent = XLSX.utils.aoa_to_sheet(ventData);
      XLSX.utils.book_append_sheet(wb, wsVent, "Ventes");
    }

    XLSX.writeFile(wb, `rapport_${detail.nom.replace(/\s+/g, "_")}.xlsx`);
  });
}

export async function exportConstructionPDF(items: any[], title: string) {
  const brand = await getBrand();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(brand.nom, 14, 20);
  doc.setFontSize(14);
  doc.text(`Rapport - ${title}`, 14, 30);
  doc.setFontSize(10);
  doc.text(`Genere le ${new Date().toLocaleDateString("fr-FR")}`, 14, 37);

  if (items.length > 0) {
    const aggregated = aggregateDepenses(items.map(i => ({
      categorie: i.categorie || "materiaux",
      designation: i.designation,
      quantite: i.quantite,
      prixUnitaire: i.prixUnitaire,
    })));

    const rows: any[][] = [];
    let currentCat = "";
    let catTotal = 0;
    const addCatTotal = () => {
      if (currentCat && catTotal > 0) {
        rows.push([{ content: `Sous-total ${currentCat}`, colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }, { content: formatFCFA(catTotal), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }]);
      }
    };

    for (const d of aggregated) {
      if (d.categorie !== currentCat) {
        addCatTotal();
        currentCat = d.categorie;
        catTotal = 0;
      }
      catTotal += d.montant;
      rows.push([
        d.categorie,
        d.designation,
        String(Math.round(d.quantite * 100) / 100),
        formatFCFA(Math.round(d.prixUnitaireMoyen)),
        formatFCFA(d.montant),
      ]);
    }
    addCatTotal();

    const grandTotal = aggregated.reduce((s, d) => s + d.montant, 0);
    rows.push([{ content: "TOTAL GENERAL", colSpan: 4, styles: { fontStyle: "bold", fillColor: [220, 230, 220] } }, { content: formatFCFA(grandTotal), styles: { fontStyle: "bold", fillColor: [220, 230, 220] } }]);

    autoTable(doc, {
      startY: 45,
      head: [["Categorie", "Designation", "Qte totale", "Prix U. moyen", "Montant total"]],
      body: rows,
      theme: "striped",
    });
  }

  doc.save(`rapport_${title.replace(/\s+/g, "_")}.pdf`);
}

export function exportConstructionExcel(items: any[], title: string) {
  import("xlsx").then(XLSX => {
    const wb = XLSX.utils.book_new();

    if (items.length > 0) {
      const aggregated = aggregateDepenses(items.map(i => ({
        categorie: i.categorie || "materiaux",
        designation: i.designation,
        quantite: i.quantite,
        prixUnitaire: i.prixUnitaire,
      })));

      const depData: any[][] = [
        ["Categorie", "Designation", "Quantite totale", "Prix Unitaire moyen", "Montant total"],
      ];

      let currentCat = "";
      let catTotal = 0;
      for (const d of aggregated) {
        if (d.categorie !== currentCat) {
          if (currentCat && catTotal > 0) {
            depData.push([`Sous-total ${currentCat}`, "", "", "", catTotal]);
          }
          currentCat = d.categorie;
          catTotal = 0;
        }
        catTotal += d.montant;
        depData.push([d.categorie, d.designation, Math.round(d.quantite * 100) / 100, Math.round(d.prixUnitaireMoyen), d.montant]);
      }
      if (currentCat && catTotal > 0) {
        depData.push([`Sous-total ${currentCat}`, "", "", "", catTotal]);
      }
      depData.push(["TOTAL GENERAL", "", "", "", aggregated.reduce((s, d) => s + d.montant, 0)]);

      const ws = XLSX.utils.aoa_to_sheet(depData);
      XLSX.utils.book_append_sheet(wb, ws, "Depenses");
    }

    XLSX.writeFile(wb, `rapport_${title.replace(/\s+/g, "_")}.xlsx`);
  });
}

function formatFCFA(n: number): string {
  const formatted = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return formatted + " FCFA";
}

export async function generateRapportBande(
  detail: any,
  depenses: any[],
  ventes: any[],
  chargesFixes: any,
  mortalite: any[],
  pesees: any[],
  consAliment: any,
  consEau: any[],
  traitements: any[],
  vaccinations: any[],
) {
  // Préchargement des paramètres branding + phases
  await preloadBrand();
  const brand = getBrandSync();
  const phasesConfig = getPhasesSync();
  const doc = new jsPDF();
  const marginX = 14;
  let y = 18;

  const ensureSpace = (need: number) => {
    if (y + need > 280) {
      doc.addPage();
      y = 18;
    }
  };

  doc.setFontSize(20);
  doc.setTextColor(34, 87, 47);
  doc.text(brand.nom, marginX, y);
  y += 8;
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text(`Rapport de bande – ${detail.nom}`, marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  const dateDebut = detail.dateDeDepart ? new Date(detail.dateDeDepart).toLocaleDateString("fr-FR") : "—";
  const dateCloture = detail.dateCloture
    ? new Date(detail.dateCloture).toLocaleDateString("fr-FR")
    : (detail.statut === "active" ? "en cours" : "—");
  doc.text(`Période : ${dateDebut} → ${dateCloture}`, marginX, y);
  y += 5;
  doc.text(`Statut : ${detail.statut === "active" ? "Active" : "Terminée"}`, marginX, y);
  y += 5;
  doc.text(`Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, marginX, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  const sujetsDepart = detail.sujetsDepart || 0;
  const nombreDeces = detail.nombreDeces || 0;
  const tauxMortalite = sujetsDepart > 0 ? (nombreDeces / sujetsDepart) * 100 : 0;
  const totalKgAliment = consAliment?.totalKgAliment ?? consAliment?.totalKg ?? 0;
  const dernierPoidsG = pesees.length > 0 ? Number(pesees[pesees.length - 1].poidsMoyenG) : null;
  const sujetsRestants = detail.sujetsRestants ?? (sujetsDepart - nombreDeces);
  const totalVendus = (detail as any).totalVendus ?? 0;
  const sujetsVivantsTotaux = sujetsRestants + totalVendus;
  const poidsVifTotalKg = dernierPoidsG && sujetsVivantsTotaux > 0
    ? (sujetsVivantsTotaux * dernierPoidsG) / 1000
    : 0;
  const ic = poidsVifTotalKg > 0 ? totalKgAliment / poidsVifTotalKg : 0;
  const totalDepenses = detail.totalDepenses || 0;
  const chargesFixesTotal = detail.chargesFixesTotal || 0;
  const totalRecettes = detail.totalRecettes || 0;
  const beneficeNet = detail.beneficeNet || 0;
  const coutParSujet = detail.coutParSujet || 0;
  const coutKgVif = poidsVifTotalKg > 0 ? (totalDepenses + chargesFixesTotal) / poidsVifTotalKg : 0;

  doc.setFontSize(13);
  doc.setFillColor(245, 247, 240);
  doc.rect(marginX, y - 5, 182, 8, "F");
  doc.text("1. Synthèse", marginX + 2, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Sujets au départ", sujetsDepart.toLocaleString("fr-FR")],
      ["Décès cumulés", `${nombreDeces.toLocaleString("fr-FR")}  (${tauxMortalite.toFixed(2)} %)`],
      ["Sujets restants", sujetsRestants.toLocaleString("fr-FR")],
      ["Sujets vendus", totalVendus.toLocaleString("fr-FR")],
      ["Aliment consommé", `${totalKgAliment.toFixed(0)} kg`],
      ["Poids moyen actuel", dernierPoidsG ? `${dernierPoidsG.toFixed(0)} g` : "—"],
      ["Indice de conversion (IC)", ic > 0 ? ic.toFixed(2) : "—"],
      ["Coût par sujet", formatFCFA(coutParSujet)],
      ["Coût par kg vif", coutKgVif > 0 ? formatFCFA(Math.round(coutKgVif)) : "—"],
    ],
    theme: "striped",
    headStyles: { fillColor: [34, 87, 47] },
    margin: { left: marginX, right: marginX },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  ensureSpace(40);
  doc.setFontSize(13);
  doc.setFillColor(245, 247, 240);
  doc.rect(marginX, y - 5, 182, 8, "F");
  doc.text("2. Bilan financier", marginX + 2, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Poste", "Montant"]],
    body: [
      ["Coût de production", formatFCFA(totalDepenses)],
      ["Charges fixes", formatFCFA(chargesFixesTotal)],
      ["Coût total", formatFCFA(totalDepenses + chargesFixesTotal)],
      ["Recettes (ventes)", formatFCFA(totalRecettes)],
      [{ content: "Bénéfice net", styles: { fontStyle: "bold" } },
       { content: formatFCFA(beneficeNet), styles: { fontStyle: "bold", textColor: beneficeNet >= 0 ? [34, 87, 47] : [180, 30, 30] } }],
    ],
    theme: "striped",
    headStyles: { fillColor: [34, 87, 47] },
    margin: { left: marginX, right: marginX },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  if (depenses.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("3. Détail des dépenses", marginX + 2, y);
    y += 5;

    const aggregated = aggregateDepenses(depenses);
    const rows: any[][] = [];
    let currentCat = "";
    let catTotal = 0;
    const flushCat = () => {
      if (currentCat && catTotal > 0) {
        rows.push([{ content: `Sous-total ${currentCat}`, colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: formatFCFA(catTotal), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }]);
      }
    };
    for (const d of aggregated) {
      if (d.categorie !== currentCat) {
        flushCat();
        currentCat = d.categorie;
        catTotal = 0;
      }
      catTotal += d.montant;
      rows.push([d.categorie, d.designation,
        String(Math.round(d.quantite * 100) / 100),
        formatFCFA(Math.round(d.prixUnitaireMoyen)),
        formatFCFA(d.montant)]);
    }
    flushCat();
    const grandTotal = aggregated.reduce((s, d) => s + d.montant, 0);
    rows.push([{ content: "TOTAL DÉPENSES", colSpan: 4, styles: { fontStyle: "bold", fillColor: [220, 230, 220] } },
      { content: formatFCFA(grandTotal), styles: { fontStyle: "bold", fillColor: [220, 230, 220] } }]);

    autoTable(doc, {
      startY: y,
      head: [["Catégorie", "Désignation", "Qté", "Prix U. moyen", "Montant"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (ventes.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("4. Ventes", marginX + 2, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Quantité", "Prix U.", "Montant"]],
      body: ventes.map(v => [
        v.date ? new Date(v.date).toLocaleDateString("fr-FR") : "—",
        String(v.quantiteVendue),
        formatFCFA(Number(v.prixUnitaire)),
        formatFCFA(Number(v.quantiteVendue) * Number(v.prixUnitaire)),
      ]),
      foot: [[
        { content: "Total", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: formatFCFA(totalRecettes), styles: { fontStyle: "bold" } },
      ]],
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // BLOC 3 — phases configurables : on s'appuie sur la configuration centralisée.
  const PHASES = phasesConfig.map(p => ({ nom: p.label, min: p.min, max: p.max }));
  if (mortalite.length > 0) {
    const byPhase = PHASES.map(p => {
      const total = mortalite
        .filter(m => Number(m.ageJours) >= p.min && Number(m.ageJours) <= p.max)
        .reduce((s, m) => s + Number(m.decesJour || 0), 0);
      const pct = sujetsDepart > 0 ? (total / sujetsDepart) * 100 : 0;
      return [p.nom, `${p.min}-${p.max === 999 ? "+" : p.max} j`, String(total), `${pct.toFixed(2)} %`];
    });
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("5. Mortalité par phase", marginX + 2, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Phase", "Période", "Décès", "Taux"]],
      body: byPhase,
      foot: [[
        { content: "Total", colSpan: 2, styles: { fontStyle: "bold" } },
        { content: String(nombreDeces), styles: { fontStyle: "bold" } },
        { content: `${tauxMortalite.toFixed(2)} %`, styles: { fontStyle: "bold" } },
      ]],
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (pesees.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("6. Pesées", marginX + 2, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Âge (j)", "Poids moyen (g)"]],
      body: pesees.map(p => [
        p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "—",
        String(p.ageJours),
        Number(p.poidsMoyenG).toFixed(0),
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (vaccinations.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("7. Vaccinations", marginX + 2, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Jour prévu", "Vaccin", "Statut", "Date faite"]],
      body: vaccinations.map(v => [
        `J${v.jourPrevu}`,
        v.nom,
        v.fait === "oui" ? "Fait" : "À faire",
        v.dateFait ? new Date(v.dateFait).toLocaleDateString("fr-FR") : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (traitements.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("8. Traitements", marginX + 2, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Âge", "Type", "Produit", "Dosage"]],
      body: traitements.map(t => [
        t.date ? new Date(t.date).toLocaleDateString("fr-FR") : "—",
        `J${t.ageJours}`,
        t.type || "traitement",
        t.produit || "—",
        t.dosage || "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (consEau.length > 0) {
    ensureSpace(40);
    doc.setFontSize(13);
    doc.setFillColor(245, 247, 240);
    doc.rect(marginX, y - 5, 182, 8, "F");
    doc.text("9. Consommation d'eau", marginX + 2, y);
    y += 5;
    const totalEau = consEau.reduce((s, e) => s + Number(e.quantiteLitres || 0), 0);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Âge (j)", "Litres"]],
      body: consEau.map(e => [
        e.date ? new Date(e.date).toLocaleDateString("fr-FR") : "—",
        String(e.ageJours),
        Number(e.quantiteLitres).toFixed(1),
      ]),
      foot: [[
        { content: "Total", colSpan: 2, styles: { fontStyle: "bold" } },
        { content: `${totalEau.toFixed(0)} L`, styles: { fontStyle: "bold" } },
      ]],
      theme: "striped",
      headStyles: { fillColor: [34, 87, 47] },
      margin: { left: marginX, right: marginX },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${brand.nom} — Rapport ${detail.nom} — Page ${i}/${pageCount}`, marginX, 290);
  }

  doc.save(`rapport_bande_${(detail.nom || "bande").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
