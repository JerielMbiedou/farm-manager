import { db, usersTable, financementTable, devisConstructionTable, puitsItemsTable, depensesBatimentTable, depensesPuitsTable, bandesTable, bandeDepensesTable, chargesFixesTable, vaccinationsTable, parametresTable, activityLogTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDefaults() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS session (sid VARCHAR NOT NULL COLLATE "default", sess JSON NOT NULL, expire TIMESTAMP(6) NOT NULL, CONSTRAINT session_pkey PRIMARY KEY (sid))`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire)`);

  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Empty database detected, seeding all data...");

  const adminHash = await bcrypt.hash("admin123", 10);

  await db.insert(usersTable).values([
    { username: "admin", password: adminHash, nom: "Administrateur", role: "admin" },
    { username: "papa", password: "papa123", nom: "Papa", role: "investisseur" },
    { username: "gestionnaire", password: "gest123", nom: "Gestionnaire", role: "gestionnaire" },
  ]);
  console.log("Users seeded");

  await db.insert(financementTable).values([
    { nom: "Papa", montant: "600000", date: "2024-01-01" },
    { nom: "Maman", montant: "1500000", date: "2024-01-01" },
    { nom: "Murielle", montant: "1200000", date: "2024-01-01" },
    { nom: "Jeriel", montant: "1800000", date: "2024-01-01" },
  ]);
  console.log("Financement seeded");

  await db.insert(devisConstructionTable).values([
    { batimentEstime: "3525000", carburantEstime: "150000" },
  ]);
  console.log("Devis construction seeded");

  await db.insert(puitsItemsTable).values([
    { designation: "Puits (forage et équipement)", quantite: "1", prixUnitaire: "1370000" },
  ]);
  console.log("Puits items seeded");

  const batimentRows = [
    { designation: "Achats de planches", quantite: "1", prixUnitaire: "400000", categorie: "materiaux" },
    { designation: "Défrichage", quantite: "1", prixUnitaire: "25000", categorie: "main_oeuvre" },
    { designation: "Creusage fouille bâtiment principal", quantite: "1", prixUnitaire: "25000", categorie: "main_oeuvre" },
    { designation: "Devis bâtiment", quantite: "1", prixUnitaire: "10000", categorie: "divers" },
    { designation: "Tonnes de graviers 5/15", quantite: "21", prixUnitaire: "7500", categorie: "materiaux" },
    { designation: "Tonnes de sable carrière", quantite: "22", prixUnitaire: "5500", categorie: "materiaux" },
    { designation: "Transports sables + Taxe", quantite: "1", prixUnitaire: "40000", categorie: "transport" },
    { designation: "Transports graviers + Taxe", quantite: "1", prixUnitaire: "40000", categorie: "transport" },
    { designation: "Carburant", quantite: "1", prixUnitaire: "15000", categorie: "carburant" },
    { designation: "Boissons", quantite: "1", prixUnitaire: "3700", categorie: "divers" },
    { designation: "Coupage de bois", quantite: "1", prixUnitaire: "35000", categorie: "materiaux" },
    { designation: "Creusage fouille annexe", quantite: "1", prixUnitaire: "15000", categorie: "main_oeuvre" },
    { designation: "Location chambre pour le matériel (1 mois)", quantite: "1", prixUnitaire: "5000", categorie: "divers" },
    { designation: "Cubitainer d'eau", quantite: "1", prixUnitaire: "5000", categorie: "divers" },
    { designation: "Location cubitainer d'eau", quantite: "1", prixUnitaire: "2500", categorie: "divers" },
    { designation: "Dédommagement découpage arbre", quantite: "1", prixUnitaire: "5000", categorie: "divers" },
    { designation: "Carburant", quantite: "1", prixUnitaire: "15000", categorie: "carburant" },
    { designation: "Matériaux de construction (divers)", quantite: "1", prixUnitaire: "115000", categorie: "materiaux" },
    { designation: "Avance matériaux de construction", quantite: "1", prixUnitaire: "100000", categorie: "materiaux" },
    { designation: "Carburant", quantite: "1", prixUnitaire: "10000", categorie: "carburant" },
    { designation: "Sac de ciment", quantite: "4", prixUnitaire: "5100", categorie: "materiaux" },
    { designation: "Barres de fer de 6 + barres de fer de 8", quantite: "1", prixUnitaire: "9000", categorie: "materiaux" },
    { designation: "Parpaings", quantite: "40", prixUnitaire: "200", categorie: "materiaux" },
    { designation: "Solde parpaings", quantite: "1", prixUnitaire: "15000", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "13000", categorie: "main_oeuvre" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "1000", categorie: "divers" },
    { designation: "Garage (réparation véhicule)", quantite: "1", prixUnitaire: "5000", categorie: "transport" },
    { designation: "Sac de ciment", quantite: "2", prixUnitaire: "5200", categorie: "materiaux" },
    { designation: "Location chambre", quantite: "1", prixUnitaire: "5000", categorie: "divers" },
    { designation: "Carburant", quantite: "1", prixUnitaire: "5000", categorie: "carburant" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "1000", categorie: "divers" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "Parpaings", quantite: "100", prixUnitaire: "200", categorie: "materiaux" },
    { designation: "Parpaings", quantite: "400", prixUnitaire: "225", categorie: "materiaux" },
    { designation: "Fers de 8", quantite: "6", prixUnitaire: "2900", categorie: "materiaux" },
    { designation: "Sacs de ciment", quantite: "4", prixUnitaire: "5100", categorie: "materiaux" },
    { designation: "pelle ronde", quantite: "1", prixUnitaire: "2250", categorie: "divers" },
    { designation: "Fil d'attache", quantite: "1", prixUnitaire: "2100", categorie: "materiaux" },
    { designation: "Cadres + étriers", quantite: "1", prixUnitaire: "10000", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "13000", categorie: "main_oeuvre" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "2000", categorie: "divers" },
    { designation: "carburant", quantite: "1", prixUnitaire: "5000", categorie: "carburant" },
    { designation: "Fers de 8", quantite: "3", prixUnitaire: "2850", categorie: "materiaux" },
    { designation: "Sacs de ciment", quantite: "3", prixUnitaire: "5100", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "1500", categorie: "divers" },
    { designation: "2e versement eau", quantite: "1", prixUnitaire: "5000", categorie: "divers" },
    { designation: "Sacs de ciment", quantite: "3", prixUnitaire: "5200", categorie: "materiaux" },
    { designation: "Fer de 8", quantite: "1", prixUnitaire: "2900", categorie: "materiaux" },
    { designation: "Fer de 6", quantite: "1", prixUnitaire: "1600", categorie: "materiaux" },
    { designation: "Manche de pioche", quantite: "1", prixUnitaire: "250", categorie: "divers" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "carburant", quantite: "1", prixUnitaire: "5000", categorie: "carburant" },
    { designation: "Sac de ciment", quantite: "1", prixUnitaire: "5300", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "13000", categorie: "main_oeuvre" },
    { designation: "Parpaings de 12", quantite: "1", prixUnitaire: "30000", categorie: "materiaux" },
    { designation: "Carburant", quantite: "1", prixUnitaire: "5000", categorie: "carburant" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "2000", categorie: "divers" },
    { designation: "Sacs de ciment", quantite: "2", prixUnitaire: "5200", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "Déjeuner", quantite: "1", prixUnitaire: "1500", categorie: "divers" },
    { designation: "Transport", quantite: "1", prixUnitaire: "1500", categorie: "transport" },
    { designation: "Ciment", quantite: "4", prixUnitaire: "5200", categorie: "materiaux" },
    { designation: "Parpaings", quantite: "400", prixUnitaire: "225", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "Fers de 8", quantite: "5", prixUnitaire: "27400", categorie: "materiaux" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "carburant", quantite: "1", prixUnitaire: "10000", categorie: "carburant" },
    { designation: "Dépense + transport", quantite: "1", prixUnitaire: "3000", categorie: "transport" },
    { designation: "Fers de 8", quantite: "6", prixUnitaire: "2900", categorie: "materiaux" },
    { designation: "Fer de 6", quantite: "1", prixUnitaire: "1500", categorie: "materiaux" },
    { designation: "Sacs de ciment", quantite: "2", prixUnitaire: "5200", categorie: "materiaux" },
    { designation: "Fil d'attache", quantite: "2", prixUnitaire: "750", categorie: "materiaux" },
    { designation: "Parpaings de 12", quantite: "20", prixUnitaire: "200", categorie: "materiaux" },
    { designation: "Transport", quantite: "1", prixUnitaire: "1500", categorie: "transport" },
    { designation: "Main-d'œuvre", quantite: "1", prixUnitaire: "10000", categorie: "main_oeuvre" },
    { designation: "Garage (réparation véhicule)", quantite: "1", prixUnitaire: "8500", categorie: "transport" },
  ];
  await db.insert(depensesBatimentTable).values(batimentRows as any);
  console.log("Dépenses bâtiment seeded:", batimentRows.length, "rows");

  await db.insert(depensesPuitsTable).values([
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Flash Band de 10 (détail)", quantite: "2", prixUnitaire: "1000", categorie: "materiaux" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Corde", quantite: "1", prixUnitaire: "19000", categorie: "materiaux" },
    { designation: "Buse", quantite: "18", prixUnitaire: "13000", categorie: "materiaux" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "100000", categorie: "main_oeuvre" },
  ] as any);
  console.log("Dépenses puits seeded");

  const [bande] = await db.insert(bandesTable).values([
    { numero: 1, nom: "Bande 1", sujetsDepart: 3750, nombreDeces: 0, valeurMaterielFixe: "600000", statut: "active", dateDeDepart: "2026-04-07" },
  ]).returning();
  console.log("Bande seeded, id:", bande.id);

  await db.insert(bandeDepensesTable).values([
    { bandeId: bande.id, designation: "Poussin 1 j", categorie: "poussins", quantite: "3750", prixUnitaire: "550" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "20", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "Bois", categorie: "autre", quantite: "1", prixUnitaire: "100000" },
    { bandeId: bande.id, designation: "Desinfectant", categorie: "prophylaxie", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Pointes", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Aliments", categorie: "aliments", quantite: "10", prixUnitaire: "12745" },
    { bandeId: bande.id, designation: "Concentre", categorie: "aliments", quantite: "3", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Concentre", categorie: "aliments", quantite: "7", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Police", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "30000" },
    { bandeId: bande.id, designation: "lait", categorie: "aliments", quantite: "1", prixUnitaire: "25000" },
    { bandeId: bande.id, designation: "Poulets", categorie: "autre", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Medicaments", categorie: "prophylaxie", quantite: "1", prixUnitaire: "220000" },
    { bandeId: bande.id, designation: "Carburant Mr Denis", categorie: "transport", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Aliments demarrage", categorie: "aliments", quantite: "15", prixUnitaire: "8370" },
    { bandeId: bande.id, designation: "Vaccin", categorie: "prophylaxie", quantite: "1", prixUnitaire: "14000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Aliment demarrage", categorie: "aliments", quantite: "20", prixUnitaire: "13161" },
    { bandeId: bande.id, designation: "Aliment demarrage", categorie: "aliments", quantite: "5", prixUnitaire: "7375" },
    { bandeId: bande.id, designation: "Aliment demarrage", categorie: "aliments", quantite: "35", prixUnitaire: "7521" },
    { bandeId: bande.id, designation: "Electricite", categorie: "autre", quantite: "1", prixUnitaire: "9500" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "60", prixUnitaire: "7494" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "20", prixUnitaire: "7809" },
    { bandeId: bande.id, designation: "concentre", categorie: "aliments", quantite: "8", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "15", prixUnitaire: "7136" },
    { bandeId: bande.id, designation: "compteur", categorie: "autre", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Marteau", categorie: "autre", quantite: "1", prixUnitaire: "2000" },
    { bandeId: bande.id, designation: "Fide", categorie: "autre", quantite: "1", prixUnitaire: "2500" },
    { bandeId: bande.id, designation: "Sacs vide", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Balance", categorie: "autre", quantite: "1", prixUnitaire: "2000" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "10", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "Aliment finitions", categorie: "aliments", quantite: "70", prixUnitaire: "7404" },
    { bandeId: bande.id, designation: "Ampoules", categorie: "autre", quantite: "1", prixUnitaire: "7000" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "5", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "concentre", categorie: "aliments", quantite: "7", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Sacs vide", categorie: "autre", quantite: "1", prixUnitaire: "1500" },
    { bandeId: bande.id, designation: "concentre", categorie: "aliments", quantite: "10", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Aliments finition", categorie: "aliments", quantite: "60", prixUnitaire: "7543" },
    { bandeId: bande.id, designation: "Aliments finition", categorie: "aliments", quantite: "40", prixUnitaire: "7585" },
    { bandeId: bande.id, designation: "Salaire du mois de Fevrier", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "110000" },
    { bandeId: bande.id, designation: "Salaire du mois de mars", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "110000" },
    { bandeId: bande.id, designation: "Salaire ventes et tresoreries", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "200000" },
    { bandeId: bande.id, designation: "carburant", categorie: "transport", quantite: "1", prixUnitaire: "15000" },
    { bandeId: bande.id, designation: "Mangeoires", categorie: "autre", quantite: "1", prixUnitaire: "25000" },
    { bandeId: bande.id, designation: "Electricite", categorie: "autre", quantite: "1", prixUnitaire: "12000" },
    { bandeId: bande.id, designation: "Complement aliment", categorie: "aliments", quantite: "1", prixUnitaire: "12000" },
  ] as any);
  console.log("Bande dépenses seeded: 48 rows");

  await db.insert(chargesFixesTable).values([
    { bandeId: bande.id, loyer: "0" },
  ] as any);
  console.log("Charges fixes seeded");

  await db.insert(vaccinationsTable).values([
    { bandeId: bande.id, jourPrevu: 1, nom: "Bipestos + Antistress", description: "Vaccination bipestos (Newcastle+Gumboro) + eau sucrée antistress", fait: "non" },
    { bandeId: bande.id, jourPrevu: 4, nom: "Antibiotique (J4-J6)", description: "Traitement antibiotique preventif pendant 3 jours", fait: "non" },
    { bandeId: bande.id, jourPrevu: 8, nom: "Vaccin Gumboro", description: "Vaccination contre la maladie de Gumboro + antistress", fait: "non" },
    { bandeId: bande.id, jourPrevu: 14, nom: "Rappel Gumboro", description: "Rappel vaccination Gumboro", fait: "non" },
    { bandeId: bande.id, jourPrevu: 21, nom: "Rappel Bipestos + Antistress", description: "Rappel bipestos (Newcastle+Gumboro) + antistress", fait: "non" },
  ] as any);
  console.log("Vaccinations seeded");

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
    { cle: "vaccin_j1_nom", valeur: "Bipestos + Antistress", description: "Nom du traitement jour 1", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j1_jour", valeur: "1", description: "Jour prévu pour le traitement 1", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j1_description", valeur: "Vaccination bipestos (Newcastle+Gumboro) + eau sucrée antistress", description: "Description du traitement jour 1", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j4_nom", valeur: "Antibiotique (J4-J6)", description: "Nom du traitement jour 4", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j4_jour", valeur: "4", description: "Jour prévu pour antibiotique", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j4_description", valeur: "Traitement antibiotique preventif pendant 3 jours", description: "Description traitement jour 4", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j8_nom", valeur: "Vaccin Gumboro", description: "Nom du vaccin jour 8", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j8_jour", valeur: "8", description: "Jour prévu pour le vaccin Gumboro", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j8_description", valeur: "Vaccination contre la maladie de Gumboro + antistress", description: "Description vaccin jour 8", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j14_nom", valeur: "Rappel Gumboro", description: "Nom du vaccin jour 14", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j14_jour", valeur: "14", description: "Jour prévu pour le rappel Gumboro", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j14_description", valeur: "Rappel vaccination Gumboro", description: "Description vaccin jour 14", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j21_nom", valeur: "Rappel Bipestos + Antistress", description: "Nom du vaccin jour 21", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j21_jour", valeur: "21", description: "Jour prévu pour le rappel bipestos", categorie: "Calendrier vaccinal" },
    { cle: "vaccin_j21_description", valeur: "Rappel bipestos (Newcastle+Gumboro) + antistress", description: "Description vaccin jour 21", categorie: "Calendrier vaccinal" },
  ]);
  console.log("Paramètres seeded");

  console.log("All data seeded successfully");
}
