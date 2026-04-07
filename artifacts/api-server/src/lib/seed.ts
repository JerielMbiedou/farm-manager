import { db, usersTable, parametresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDefaults() {
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 10);
    const papaHash = await bcrypt.hash("papa123", 10);
    const gestHash = await bcrypt.hash("gest123", 10);

    await db.insert(usersTable).values([
      { username: "admin", password: adminHash, nom: "Administrateur", role: "admin" },
      { username: "papa", password: papaHash, nom: "Papa Mbiedou", role: "investisseur" },
      { username: "gestionnaire", password: gestHash, nom: "Gestionnaire", role: "gestionnaire" },
    ]);
    console.log("Default users seeded");
  }

  const existingParams = await db.select().from(parametresTable);
  if (existingParams.length === 0) {
    await db.insert(parametresTable).values([
      { cle: "taux_depreciation_materiel", valeur: "10", description: "Taux de dépréciation annuel du matériel fixe (%)", categorie: "Charges fixes" },
      { cle: "taux_imprevus", valeur: "5", description: "Taux pour imprévus sur dépenses de production (%)", categorie: "Charges fixes" },
      { cle: "seuil_mortalite_alerte_jour", valeur: "3", description: "Taux de mortalité journalier déclenchant une alerte rouge (%)", categorie: "Alertes" },
      { cle: "seuil_mortalite_alerte_cumul", valeur: "5", description: "Taux de mortalité cumulé affiché en rouge (%)", categorie: "Alertes" },
      { cle: "seuil_poids_alerte", valeur: "90", description: "Pourcentage minimum du poids objectif avant alerte (%)", categorie: "Alertes" },
      { cle: "ic_bon", valeur: "1.8", description: "Indice de conversion considéré comme bon (≤)", categorie: "Indice de conversion" },
      { cle: "ic_moyen", valeur: "2.2", description: "Indice de conversion considéré comme moyen (≤)", categorie: "Indice de conversion" },
      { cle: "budget_batiment_defaut", valeur: "3525000", description: "Budget bâtiment par défaut si aucun devis (FCFA)", categorie: "Budget construction" },
      { cle: "budget_carburant_defaut", valeur: "150000", description: "Budget carburant par défaut si aucun devis (FCFA)", categorie: "Budget construction" },
      { cle: "vaccin_j1_nom", valeur: "Désinfection et installation", description: "Nom du traitement jour 1", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j1_jour", valeur: "1", description: "Jour prévu pour le traitement 1", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j1_description", valeur: "Préparation du poulailler", description: "Description du traitement jour 1", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j7_nom", valeur: "Vaccin Newcastle", description: "Nom du vaccin jour 7", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j7_jour", valeur: "7", description: "Jour prévu pour le vaccin Newcastle", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j7_description", valeur: "Première vaccination contre Newcastle", description: "Description vaccin jour 7", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j14_nom", valeur: "Vaccin Gumboro", description: "Nom du vaccin jour 14", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j14_jour", valeur: "14", description: "Jour prévu pour le vaccin Gumboro", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j14_description", valeur: "Vaccination contre la maladie de Gumboro", description: "Description vaccin jour 14", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j21_nom", valeur: "Rappel Newcastle", description: "Nom du vaccin jour 21", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j21_jour", valeur: "21", description: "Jour prévu pour le rappel Newcastle", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j21_description", valeur: "Rappel de vaccination Newcastle", description: "Description vaccin jour 21", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j28_nom", valeur: "Vaccin Bronchite infectieuse", description: "Nom du vaccin jour 28", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j28_jour", valeur: "28", description: "Jour prévu pour le vaccin bronchite infectieuse", categorie: "Calendrier vaccinal" },
      { cle: "vaccin_j28_description", valeur: "Vaccination contre la bronchite infectieuse", description: "Description vaccin jour 28", categorie: "Calendrier vaccinal" },
    ]);
    console.log("Default parameters seeded");
  }
}
