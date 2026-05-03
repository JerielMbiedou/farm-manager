import { db, usersTable, financementTable, chantiersTable, chantierLotsTable, chantierDepensesTable, chantierDevisLignesTable, bandesTable, bandeDepensesTable, chargesFixesTable, vaccinationsTable, parametresTable, activityLogTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function fixSpelling() {
  try {
    const corrections: [string, string][] = [
      ["Desinfectant", "Désinfectant"],
      ["Medicaments", "Médicaments"],
      ["Aliments demarrage", "Aliments démarrage"],
      ["Aliment demarrage", "Aliment démarrage"],
      ["Aliment finitions", "Aliment finition"],
      ["Aliments finition", "Aliment finition"],
      ["Electricite", "Électricité"],
      ["Complement aliment", "Complément aliment"],
      ["Salaire du mois de Fevrier", "Salaire du mois de février"],
      ["Salaire ventes et tresoreries", "Salaire ventes et trésorerie"],
    ];
    for (const [wrong, correct] of corrections) {
      await db.execute(sql`UPDATE bande_depenses SET designation = ${correct} WHERE designation = ${wrong}`);
    }
    const capFixes: [string, string][] = [
      ["lait", "Lait"],
      ["compteur", "Compteur"],
      ["carburant", "Carburant"],
      ["concentre", "Concentré"],
    ];
    for (const [wrong, correct] of capFixes) {
      await db.execute(sql`UPDATE bande_depenses SET designation = ${correct} WHERE designation = ${wrong}`);
    }
    await db.execute(sql`UPDATE bande_depenses SET designation = 'Concentré' WHERE designation = 'Concentre'`);
    await db.execute(sql`UPDATE bande_depenses SET designation = 'Sacs vides' WHERE designation = 'Sacs vide'`);
    await db.execute(sql`UPDATE bande_depenses SET categorie = 'prophylaxie' WHERE categorie = 'veterinaire'`);
    await db.execute(sql`UPDATE bande_depenses SET categorie = 'prophylaxie' WHERE categorie = 'medicaments'`);
    console.log("Spelling corrections applied");
  } catch (e) {
    console.log("Spelling fix skipped (table may not exist yet)");
  }
}

async function importBande1Data() {
  try {
    const bandeRows = await db.execute(sql`SELECT id FROM bandes WHERE numero = 1 LIMIT 1`);
    if (!bandeRows.rows || bandeRows.rows.length === 0) return;
    const bid = (bandeRows.rows[0] as any).id;

    const existing = await db.execute(sql`SELECT COUNT(*) as cnt FROM mortalite_journaliere WHERE bande_id = ${bid}`);
    if (parseInt((existing.rows[0] as any).cnt) > 0) return;

    await db.execute(sql`UPDATE bandes SET date_de_depart = '2026-02-17' WHERE id = ${bid}`);

    const mortalites = [
      ['2026-02-17',1,3],['2026-02-18',2,12],['2026-02-19',3,16],['2026-02-20',4,13],
      ['2026-02-21',5,9],['2026-02-22',6,10],['2026-02-23',7,4],
      ['2026-02-24',8,0],['2026-02-25',9,3],['2026-02-26',10,5],['2026-02-27',11,5],
      ['2026-02-28',12,4],['2026-03-01',13,1],['2026-03-02',14,6],
      ['2026-03-10',22,1],['2026-03-11',23,3],['2026-03-12',24,1],['2026-03-13',25,1],
      ['2026-03-14',26,0],['2026-03-15',27,3],['2026-03-16',28,4],
      ['2026-03-17',29,2],['2026-03-18',30,4],['2026-03-19',31,2],['2026-03-20',32,0],
      ['2026-03-21',33,3],['2026-03-22',34,2],['2026-03-23',35,0],
      ['2026-03-24',36,0],['2026-03-25',37,4],['2026-03-26',38,3],['2026-03-27',39,2],
      ['2026-03-28',40,3],['2026-03-29',41,3],['2026-03-30',42,3],
      ['2026-03-31',43,0],['2026-04-01',44,0],['2026-04-02',45,1],['2026-04-03',46,3],
      ['2026-04-04',47,1],['2026-04-05',48,5],['2026-04-06',49,22],['2026-04-07',50,9],
    ];
    for (const [date, age, deces] of mortalites) {
      await db.execute(sql`INSERT INTO mortalite_journaliere (bande_id, date, age_jours, deces_jour) VALUES (${bid}, ${date}, ${age}, ${deces})`);
    }

    const aliments = [
      ['2026-02-17',70],['2026-02-18',80],['2026-02-19',100],['2026-02-20',120],
      ['2026-02-21',120],['2026-02-22',120],
      ['2026-02-24',130],['2026-02-25',150],['2026-02-26',150],['2026-02-27',150],
      ['2026-02-28',150],['2026-03-01',280],['2026-03-02',280],
      ['2026-03-10',450],['2026-03-11',500],['2026-03-12',400],['2026-03-13',400],
      ['2026-03-14',500],['2026-03-15',500],
      ['2026-03-17',500],['2026-03-18',250],['2026-03-19',1100],['2026-03-20',400],
      ['2026-03-21',500],['2026-03-22',650],
      ['2026-03-24',450],['2026-03-25',1000],['2026-03-26',300],['2026-03-27',300],
      ['2026-03-28',900],['2026-03-29',350],['2026-03-30',1600],
      ['2026-03-31',0],['2026-04-01',200],['2026-04-02',650],['2026-04-03',500],
      ['2026-04-04',500],['2026-04-05',100],['2026-04-06',900],['2026-04-07',195],
    ];
    for (const [date, qte] of aliments) {
      await db.execute(sql`INSERT INTO consommation_aliment (bande_id, date, quantite_kg) VALUES (${bid}, ${date}, ${qte})`);
    }

    const eaux = [
      ['2026-02-17',1,80],['2026-02-18',2,120],['2026-02-19',3,180],['2026-02-20',4,300],
      ['2026-02-21',5,320],['2026-02-22',6,320],
      ['2026-02-24',8,330],['2026-02-25',9,350],['2026-02-26',10,350],['2026-02-27',11,380],
      ['2026-02-28',12,400],['2026-03-01',13,420],['2026-03-02',14,450],
      ['2026-03-10',22,630],['2026-03-11',23,650],['2026-03-12',24,670],['2026-03-13',25,670],
      ['2026-03-14',26,680],['2026-03-15',27,680],
      ['2026-03-17',29,700],['2026-03-18',30,700],['2026-03-19',31,720],['2026-03-20',32,740],
      ['2026-03-21',33,740],['2026-03-22',34,740],
      ['2026-03-24',36,750],['2026-03-25',37,750],['2026-03-26',38,780],['2026-03-27',39,800],
      ['2026-03-28',40,800],['2026-03-29',41,820],['2026-03-30',42,820],
      ['2026-03-31',43,880],['2026-04-01',44,850],['2026-04-02',45,850],['2026-04-03',46,850],
      ['2026-04-04',47,850],['2026-04-05',48,850],['2026-04-06',49,850],['2026-04-07',50,850],
    ];
    for (const [date, age, qte] of eaux) {
      await db.execute(sql`INSERT INTO consommation_eau (bande_id, date, age_jours, quantite_litres) VALUES (${bid}, ${date}, ${age}, ${qte})`);
    }

    const pesees = [
      ['2026-02-18',2,95],['2026-02-19',3,135],['2026-02-20',4,140],['2026-02-21',5,155],
      ['2026-03-02',14,470],
      ['2026-03-10',22,1190],['2026-03-11',23,1250],['2026-03-12',24,1355],
      ['2026-03-13',25,1408],['2026-03-14',26,1350],
      ['2026-03-17',29,1410],['2026-03-18',30,1445],['2026-03-19',31,1630],
      ['2026-03-20',32,1905],['2026-03-21',33,1945],
      ['2026-03-24',36,2000],['2026-03-25',37,2138],['2026-03-27',39,2438],
    ];
    for (const [date, age, poids] of pesees) {
      await db.execute(sql`INSERT INTO pesees (bande_id, date, age_jours, poids_moyen_g) VALUES (${bid}, ${date}, ${age}, ${poids})`);
    }
    console.log("Bande 1 historical data imported");
  } catch (e) {
    console.log("Historical import skipped:", (e as Error).message);
  }
}

function generateRandomPassword(len = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  let out = "";
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

// Liste centralisée de TOUS les paramètres applicatifs.
// Utilisée à la fois par seedDefaults (DB vide) et par ensureParametres (DB existante).
const ALL_PARAMETRES: Array<{ cle: string; valeur: string; description: string; categorie: string }> = [
  { cle: "taux_depreciation_materiel", valeur: "10", description: "Taux de dépréciation annuel du matériel fixe (%)", categorie: "Charges fixes" },
  { cle: "taux_imprevus", valeur: "5", description: "Taux pour imprévus sur dépenses de production (%)", categorie: "Charges fixes" },
  { cle: "seuil_mortalite_alerte_jour", valeur: "3", description: "Taux de mortalité journalier déclenchant une alerte rouge (%) — utilisé en finition (≥ J22)", categorie: "Alertes" },
  { cle: "seuil_mortalite_alerte_jour_demarrage", valeur: "1", description: "Taux de mortalité journalier déclenchant une alerte rouge en démarrage (J0–J21) (%)", categorie: "Alertes" },
  { cle: "seuil_mortalite_alerte_jour_finition", valeur: "0.5", description: "Taux de mortalité journalier déclenchant une alerte rouge en finition (≥ J22) (%)", categorie: "Alertes" },
  { cle: "seuil_alerte_solde_caisse", valeur: "100000", description: "Seuil de solde caisse déclenchant une alerte basse (FCFA)", categorie: "Alertes" },
  { cle: "seuil_mortalite_alerte_cumul", valeur: "5", description: "Taux de mortalité cumulé affiché en rouge (%)", categorie: "Alertes" },
  { cle: "seuil_poids_alerte", valeur: "90", description: "Pourcentage minimum du poids objectif avant alerte (%)", categorie: "Alertes" },
  { cle: "ic_bon", valeur: "1.8", description: "Indice de conversion considéré comme bon (≤)", categorie: "Indice de conversion" },
  { cle: "ic_moyen", valeur: "2.2", description: "Indice de conversion considéré comme moyen (≤)", categorie: "Indice de conversion" },
  { cle: "budget_batiment_defaut", valeur: "3525000", description: "Budget bâtiment par défaut si aucun devis (FCFA)", categorie: "Budget construction" },
  { cle: "budget_carburant_defaut", valeur: "150000", description: "Budget carburant par défaut si aucun devis (FCFA)", categorie: "Budget construction" },

  // Identité de la ferme (BLOC 2)
  { cle: "ferme_nom", valeur: "Ferme Mbiedou", description: "Nom de la ferme (PDF, en-têtes)", categorie: "Identité de la ferme" },
  { cle: "ferme_localite", valeur: "", description: "Localité / village (ex. : Mbiedou, Cameroun)", categorie: "Identité de la ferme" },
  { cle: "ferme_responsable", valeur: "", description: "Nom du responsable", categorie: "Identité de la ferme" },
  { cle: "ferme_telephone", valeur: "", description: "Téléphone de contact", categorie: "Identité de la ferme" },
  { cle: "ferme_email", valeur: "", description: "Email de contact", categorie: "Identité de la ferme" },
  { cle: "ferme_devise", valeur: "FCFA", description: "Devise affichée (FCFA, EUR, …)", categorie: "Identité de la ferme" },

  // Phases d'élevage (BLOC 3)
  { cle: "phase_demarrage_min",  valeur: "1",  description: "Début de la phase démarrage (jour)", categorie: "Phases d'élevage" },
  { cle: "phase_demarrage_max",  valeur: "15", description: "Fin de la phase démarrage (jour)", categorie: "Phases d'élevage" },
  { cle: "phase_croissance_min", valeur: "16", description: "Début de la phase croissance (jour)", categorie: "Phases d'élevage" },
  { cle: "phase_croissance_max", valeur: "28", description: "Fin de la phase croissance (jour)", categorie: "Phases d'élevage" },
  { cle: "phase_finition_min",   valeur: "29", description: "Début de la phase finition (jour)", categorie: "Phases d'élevage" },
  { cle: "phase_finition_max",   valeur: "45", description: "Fin de la phase finition (jour)", categorie: "Phases d'élevage" },
  { cle: "duree_bande_cible",    valeur: "45", description: "Durée cible d'une bande (jours)", categorie: "Phases d'élevage" },

  // Sauvegarde automatique (BLOC 4)
  { cle: "backup_heure",            valeur: "2", description: "Heure d'exécution de la sauvegarde automatique (0–23)", categorie: "Sauvegarde" },
  { cle: "backup_retention_jours",  valeur: "7", description: "Nombre de sauvegardes conservées (rotation)", categorie: "Sauvegarde" },

  // Actifs vs dépenses (BLOC 2 audit 2026-05)
  { cle: "seuil_valeur_actif", valeur: "50000", description: "Valeur minimale (FCFA) pour qu'un achat soit considéré comme un actif amortissable plutôt qu'une dépense directe. En dessous de ce seuil, enregistrer en dépense bande.", categorie: "Actifs" },
];

/**
 * Insère les paramètres manquants sans toucher à ceux qui existent déjà.
 * Idempotent — sûr à appeler à chaque démarrage.
 */
export async function ensureParametres() {
  try {
    let inserted = 0;
    for (const p of ALL_PARAMETRES) {
      const r = await db.execute(sql`
        INSERT INTO parametres (cle, valeur, description, categorie)
        VALUES (${p.cle}, ${p.valeur}, ${p.description}, ${p.categorie})
        ON CONFLICT (cle) DO NOTHING
      `);
      if ((r as any).rowCount > 0) inserted++;
    }
    if (inserted > 0) console.log(`ensureParametres: ${inserted} new parameter(s) inserted`);
  } catch (e) {
    console.log("ensureParametres skipped:", (e as Error).message);
  }
}

export async function seedDefaults() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS session (sid VARCHAR NOT NULL COLLATE "default", sess JSON NOT NULL, expire TIMESTAMP(6) NOT NULL, CONSTRAINT session_pkey PRIMARY KEY (sid))`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire)`);

  const seedDemo = (process.env.SEED_DEMO_DATA ?? "true").toLowerCase() !== "false";

  if (seedDemo) {
    await fixSpelling();
    await importBande1Data();
  }

  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Empty database detected, seeding base data (admin + parameters)...");

  // BLOC 1 — sécurité : mot de passe admin depuis env, sinon généré aléatoirement,
  // puis loggué une seule fois pour permettre à l'opérateur de le récupérer.
  let adminPlaintext = process.env.INITIAL_ADMIN_PASSWORD;
  let adminPwdGenerated = false;
  if (!adminPlaintext) {
    adminPlaintext = generateRandomPassword(16);
    adminPwdGenerated = true;
  }
  const adminHash = await bcrypt.hash(adminPlaintext, 12);

  await db.insert(usersTable).values([
    { username: "admin", password: adminHash, nom: "Administrateur", role: "admin" },
  ]);
  console.log("Admin user seeded");
  if (adminPwdGenerated) {
    console.log("============================================================");
    console.log("⚠️  MOT DE PASSE ADMIN GÉNÉRÉ (à noter MAINTENANT) :");
    console.log("    Identifiant : admin");
    console.log("    Mot de passe :", adminPlaintext);
    console.log("    (réglez INITIAL_ADMIN_PASSWORD dans l'env pour fixer ce mot de passe)");
    console.log("============================================================");
  }

  if (seedDemo) {
    const papaHash = await bcrypt.hash("papa123", 12);
    const gestHash = await bcrypt.hash("gest123", 12);
    await db.insert(usersTable).values([
      { username: "papa", password: papaHash, nom: "Papa", role: "investisseur" },
      { username: "gestionnaire", password: gestHash, nom: "Gestionnaire", role: "gestionnaire" },
    ]);
    console.log("Demo users seeded (papa, gestionnaire)");
  }

  if (seedDemo) {
  await db.insert(financementTable).values([
    { nom: "Papa", montant: "600000", date: "2024-01-01" },
    { nom: "Maman", montant: "1500000", date: "2024-01-01" },
    { nom: "Murielle", montant: "1200000", date: "2024-01-01" },
    { nom: "Jeriel", montant: "1800000", date: "2024-01-01" },
  ]);
  console.log("Financement seeded");

  // P9 : seed via chantiers (modèle unifié) — création du chantier "Construction de la ferme Mbiedou" + 2 lots + lignes de devis
  const [chantierMbiedou] = await db.insert(chantiersTable).values([
    { nom: "Construction de la ferme Mbiedou", description: "Bâtiment principal + forage du puits", statut: "cloture", dateDebut: "2024-01-01", dateCloture: "2024-12-01" },
  ]).returning();
  const [lotBatiment] = await db.insert(chantierLotsTable).values([
    { chantierId: chantierMbiedou.id, nom: "Bâtiment principal", ordre: 0 },
  ]).returning();
  const [lotPuits] = await db.insert(chantierLotsTable).values([
    { chantierId: chantierMbiedou.id, nom: "Forage et puits", ordre: 1 },
  ]).returning();
  await db.insert(chantierDevisLignesTable).values([
    { chantierId: chantierMbiedou.id, lotId: lotBatiment.id, poste: "Bâtiment estimé (devis initial)", montantPrevu: "3525000", ordre: 0 },
    { chantierId: chantierMbiedou.id, lotId: lotBatiment.id, poste: "Carburant estimé (devis initial)", montantPrevu: "150000", ordre: 1 },
    { chantierId: chantierMbiedou.id, lotId: lotPuits.id, poste: "Puits — forage et équipement", montantPrevu: "1370000", ordre: 0 },
  ]);
  console.log("Chantier Mbiedou + lots + devis seeded");

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
  await db.insert(chantierDepensesTable).values(
    batimentRows.map(r => ({ ...r, chantierId: chantierMbiedou.id, lotId: lotBatiment.id })) as any
  );
  console.log("Chantier dépenses bâtiment seeded:", batimentRows.length, "rows");

  const puitsRows = [
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Flash Band de 10 (détail)", quantite: "2", prixUnitaire: "1000", categorie: "materiaux" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "50000", categorie: "main_oeuvre" },
    { designation: "Corde", quantite: "1", prixUnitaire: "19000", categorie: "materiaux" },
    { designation: "Buse", quantite: "18", prixUnitaire: "13000", categorie: "materiaux" },
    { designation: "Avance main-d'œuvre", quantite: "1", prixUnitaire: "100000", categorie: "main_oeuvre" },
  ];
  await db.insert(chantierDepensesTable).values(
    puitsRows.map(r => ({ ...r, chantierId: chantierMbiedou.id, lotId: lotPuits.id })) as any
  );
  console.log("Chantier dépenses puits seeded:", puitsRows.length, "rows");

  const [bande] = await db.insert(bandesTable).values([
    { numero: 1, nom: "Bande 1", sujetsDepart: 3750, nombreDeces: 0, valeurMaterielFixe: "600000", statut: "active", dateDeDepart: "2026-04-07" },
  ]).returning();
  console.log("Bande seeded, id:", bande.id);

  await db.insert(bandeDepensesTable).values([
    { bandeId: bande.id, designation: "Poussin 1 j", categorie: "poussins", quantite: "3750", prixUnitaire: "550" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "20", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "Bois", categorie: "autre", quantite: "1", prixUnitaire: "100000" },
    { bandeId: bande.id, designation: "Désinfectant", categorie: "prophylaxie", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Pointes", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Aliments", categorie: "aliments", quantite: "10", prixUnitaire: "12745" },
    { bandeId: bande.id, designation: "Concentré", categorie: "aliments", quantite: "3", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Concentré", categorie: "aliments", quantite: "7", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Police", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "30000" },
    { bandeId: bande.id, designation: "Lait", categorie: "aliments", quantite: "1", prixUnitaire: "25000" },
    { bandeId: bande.id, designation: "Poulets", categorie: "autre", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Médicaments", categorie: "prophylaxie", quantite: "1", prixUnitaire: "220000" },
    { bandeId: bande.id, designation: "Carburant Mr Denis", categorie: "transport", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Aliments démarrage", categorie: "aliments", quantite: "15", prixUnitaire: "8370" },
    { bandeId: bande.id, designation: "Vaccin", categorie: "prophylaxie", quantite: "1", prixUnitaire: "14000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "10000" },
    { bandeId: bande.id, designation: "Aliment démarrage", categorie: "aliments", quantite: "20", prixUnitaire: "13161" },
    { bandeId: bande.id, designation: "Aliment démarrage", categorie: "aliments", quantite: "5", prixUnitaire: "7375" },
    { bandeId: bande.id, designation: "Aliment démarrage", categorie: "aliments", quantite: "35", prixUnitaire: "7521" },
    { bandeId: bande.id, designation: "Électricité", categorie: "autre", quantite: "1", prixUnitaire: "9500" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "60", prixUnitaire: "7494" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "20", prixUnitaire: "7809" },
    { bandeId: bande.id, designation: "Concentré", categorie: "aliments", quantite: "8", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Aliment croissance", categorie: "aliments", quantite: "15", prixUnitaire: "7136" },
    { bandeId: bande.id, designation: "Compteur", categorie: "autre", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Marteau", categorie: "autre", quantite: "1", prixUnitaire: "2000" },
    { bandeId: bande.id, designation: "Fide", categorie: "autre", quantite: "1", prixUnitaire: "2500" },
    { bandeId: bande.id, designation: "Sacs vides", categorie: "autre", quantite: "1", prixUnitaire: "1000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "5000" },
    { bandeId: bande.id, designation: "Balance", categorie: "autre", quantite: "1", prixUnitaire: "2000" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "10", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "Aliment finition", categorie: "aliments", quantite: "70", prixUnitaire: "7404" },
    { bandeId: bande.id, designation: "Ampoules", categorie: "autre", quantite: "1", prixUnitaire: "7000" },
    { bandeId: bande.id, designation: "Koppo", categorie: "autre", quantite: "5", prixUnitaire: "500" },
    { bandeId: bande.id, designation: "Concentré", categorie: "aliments", quantite: "7", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Sacs vides", categorie: "autre", quantite: "1", prixUnitaire: "1500" },
    { bandeId: bande.id, designation: "Concentré", categorie: "aliments", quantite: "10", prixUnitaire: "52000" },
    { bandeId: bande.id, designation: "Aliment finition", categorie: "aliments", quantite: "60", prixUnitaire: "7543" },
    { bandeId: bande.id, designation: "Aliment finition", categorie: "aliments", quantite: "40", prixUnitaire: "7585" },
    { bandeId: bande.id, designation: "Salaire du mois de février", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "110000" },
    { bandeId: bande.id, designation: "Salaire du mois de mars", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "110000" },
    { bandeId: bande.id, designation: "Salaire ventes et trésorerie", categorie: "main_oeuvre", quantite: "1", prixUnitaire: "200000" },
    { bandeId: bande.id, designation: "Carburant", categorie: "transport", quantite: "1", prixUnitaire: "15000" },
    { bandeId: bande.id, designation: "Mangeoires", categorie: "autre", quantite: "1", prixUnitaire: "25000" },
    { bandeId: bande.id, designation: "Électricité", categorie: "autre", quantite: "1", prixUnitaire: "12000" },
    { bandeId: bande.id, designation: "Complément aliment", categorie: "aliments", quantite: "1", prixUnitaire: "12000" },
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
  } // fin if (seedDemo) — financement / chantier / bande / dépenses / vaccinations

  await db.insert(parametresTable).values([
    { cle: "taux_depreciation_materiel", valeur: "10", description: "Taux de dépréciation annuel du matériel fixe (%)", categorie: "Charges fixes" },
    { cle: "taux_imprevus", valeur: "5", description: "Taux pour imprévus sur dépenses de production (%)", categorie: "Charges fixes" },
    { cle: "seuil_mortalite_alerte_jour", valeur: "3", description: "Taux de mortalité journalier déclenchant une alerte rouge (%) — utilisé en finition (≥ J22)", categorie: "Alertes" },
    { cle: "seuil_mortalite_alerte_jour_demarrage", valeur: "1", description: "Taux de mortalité journalier déclenchant une alerte rouge en démarrage (J0–J21) (%)", categorie: "Alertes" },
    { cle: "seuil_mortalite_alerte_jour_finition", valeur: "0.5", description: "Taux de mortalité journalier déclenchant une alerte rouge en finition (≥ J22) (%)", categorie: "Alertes" },
    { cle: "seuil_alerte_solde_caisse", valeur: "100000", description: "Seuil de solde caisse déclenchant une alerte basse (FCFA)", categorie: "Alertes" },
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

    // BLOC 2 — Branding / identité de la ferme (utilisé dans PDF & en-têtes UI)
    { cle: "ferme_nom", valeur: "Ferme Mbiedou", description: "Nom de la ferme (PDF, en-têtes)", categorie: "Identité de la ferme" },
    { cle: "ferme_localite", valeur: "", description: "Localité / village (ex. : Mbiedou, Cameroun)", categorie: "Identité de la ferme" },
    { cle: "ferme_responsable", valeur: "", description: "Nom du responsable", categorie: "Identité de la ferme" },
    { cle: "ferme_telephone", valeur: "", description: "Téléphone de contact", categorie: "Identité de la ferme" },
    { cle: "ferme_email", valeur: "", description: "Email de contact", categorie: "Identité de la ferme" },
    { cle: "ferme_devise", valeur: "FCFA", description: "Devise affichée (FCFA, EUR, …)", categorie: "Identité de la ferme" },

    // BLOC 3 — Phases d'élevage (bornes en jours) + durée cible
    { cle: "phase_demarrage_min",  valeur: "1",  description: "Début de la phase démarrage (jour)", categorie: "Phases d'élevage" },
    { cle: "phase_demarrage_max",  valeur: "15", description: "Fin de la phase démarrage (jour)", categorie: "Phases d'élevage" },
    { cle: "phase_croissance_min", valeur: "16", description: "Début de la phase croissance (jour)", categorie: "Phases d'élevage" },
    { cle: "phase_croissance_max", valeur: "28", description: "Fin de la phase croissance (jour)", categorie: "Phases d'élevage" },
    { cle: "phase_finition_min",   valeur: "29", description: "Début de la phase finition (jour)", categorie: "Phases d'élevage" },
    { cle: "phase_finition_max",   valeur: "45", description: "Fin de la phase finition (jour)", categorie: "Phases d'élevage" },
    { cle: "duree_bande_cible",    valeur: "45", description: "Durée cible d'une bande (jours)", categorie: "Phases d'élevage" },

    // BLOC 4 — Sauvegarde automatique
    { cle: "backup_heure",            valeur: "2", description: "Heure d'exécution de la sauvegarde automatique (0–23)", categorie: "Sauvegarde" },
    { cle: "backup_retention_jours",  valeur: "7", description: "Nombre de sauvegardes conservées (rotation)", categorie: "Sauvegarde" },
  ]);
  console.log("Paramètres seeded");

  console.log("All data seeded successfully");
}
