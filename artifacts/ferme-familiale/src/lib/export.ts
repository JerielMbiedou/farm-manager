import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportBandePDF(detail: any, depenses: any[], ventes: any[], chargesFixes: any, mortalite: any[], pesees: any[], consommation: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("Ferme Mbiedou", 14, 20);
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
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(12);
    doc.text("Dépenses de production", 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 15,
      head: [["Catégorie", "Désignation", "Qté", "Prix U.", "Montant"]],
      body: depenses.map(d => [
        d.categorie,
        d.designation,
        String(d.quantite),
        formatFCFA(d.prixUnitaire),
        formatFCFA(d.montant),
      ]),
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
      const depData = [
        ["Catégorie", "Désignation", "Quantité", "Prix Unitaire", "Montant"],
        ...depenses.map(d => [d.categorie, d.designation, d.quantite, d.prixUnitaire, d.montant]),
      ];
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

function formatFCFA(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}
