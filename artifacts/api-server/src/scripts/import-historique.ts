/**
 * Script d'import des données historiques depuis la fiche de suivi Excel.
 * Données des bandes Biofarm Valley (bandes précédant la Ferme Mbiedou).
 *
 * Usage: pnpm --filter @workspace/api-server run import-historique
 */
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { db, bandesTable, mortaliteJournaliereTable, consommationAlimentTable, consommationEauTable, peseesTable, traitementsTable, observationsJournalTable, vaccinationsTable, chargesFixesTable, bandeDepensesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = path.resolve(__dirname, "../../../../attached_assets/Fiche_de_suivie_Excel_2025__1775602472969.xlsx");

function excelSerialToDate(serial: number): string | null {
  if (!serial || typeof serial !== "number" || serial < 40000) return null;
  const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  const s = d.toISOString().split("T")[0];
  if (s < "2020-01-01") return null;
  return s;
}

type SheetRow = (string | number | null)[];

interface BandeConfig {
  sheetName: string;
  numero: number;
  nom: string;
  format: "b1" | "b2" | "b34";
}

const BANDES_CONFIG: BandeConfig[] = [
  { sheetName: "Bande3 #4079  Biofarm Valle", numero: -3, nom: "Historique A — Biofarm (2024)", format: "b34" },
  { sheetName: "Bande2 #3700  Biofarm Valle ", numero: -2, nom: "Historique B — Biofarm (2025)", format: "b2" },
  { sheetName: "Bande1 #2900 Biofarm Valley ", numero: -1, nom: "Historique C — Biofarm (2025)", format: "b1" },
];

function parseRow(row: SheetRow, format: BandeConfig["format"]) {
  const jourNr = typeof row[0] === "number" ? row[0] : null;
  const dateSerial = typeof row[1] === "number" ? row[1] : null;
  const date = dateSerial ? excelSerialToDate(dateSerial) : null;

  if (!jourNr || !date) return null;

  let mortaliteJour: number | null = null;
  let alimentJour: number | null = null;
  let eauLitres: number | null = null;
  let poidsMoyenG: number | null = null;
  let traitement: string | null = null;
  let observation: string | null = null;

  if (format === "b1") {
    mortaliteJour = typeof row[3] === "number" ? row[3] : null;
    alimentJour = typeof row[5] === "number" ? row[5] : null;
    eauLitres = typeof row[7] === "number" ? row[7] : null;
    const poids = typeof row[8] === "number" ? row[8] : null;
    poidsMoyenG = poids && poids < 10 ? poids * 1000 : poids;
    traitement = typeof row[10] === "string" && row[10].trim() ? row[10].trim() : null;
    observation = typeof row[11] === "string" && row[11].trim() ? row[11].trim() : null;
  } else if (format === "b2") {
    mortaliteJour = typeof row[3] === "number" ? row[3] : null;
    alimentJour = typeof row[5] === "number" ? row[5] : null;
    eauLitres = typeof row[7] === "number" ? row[7] : null;
    const poids = typeof row[10] === "number" ? row[10] : null;
    poidsMoyenG = poids && poids < 10 ? poids * 1000 : poids;
    traitement = typeof row[11] === "string" && row[11].trim() ? row[11].trim() : null;
    observation = typeof row[12] === "string" && row[12].trim() ? row[12].trim() : null;
  } else {
    mortaliteJour = typeof row[3] === "number" ? row[3] : null;
    alimentJour = typeof row[5] === "number" ? row[5] : null;
    const poidsMin = typeof row[7] === "number" ? row[7] : null;
    const poidsMax = typeof row[8] === "number" ? row[8] : null;
    eauLitres = typeof row[9] === "number" ? row[9] : null;
    const poidsRaw = poidsMin && poidsMax ? (poidsMin + poidsMax) / 2 : (poidsMin ?? poidsMax);
    poidsMoyenG = poidsRaw && poidsRaw < 10 ? poidsRaw * 1000 : poidsRaw;
    traitement = typeof row[10] === "string" && row[10].trim() ? row[10].trim() : null;
    observation = typeof row[11] === "string" && row[11].trim() ? row[11].trim() : null;
  }

  return { jourNr, date, mortaliteJour, alimentJour, eauLitres, poidsMoyenG, traitement, observation };
}

async function importBande(config: BandeConfig, ws: XLSX.WorkSheet): Promise<void> {
  const raw = XLSX.utils.sheet_to_json<SheetRow>(ws, { header: 1, defval: null });
  const rows = raw.slice(6).filter(row => typeof row[0] === "number");

  const parsed = rows.map(r => parseRow(r as SheetRow, config.format)).filter(Boolean) as NonNullable<ReturnType<typeof parseRow>>[];

  if (parsed.length === 0) {
    console.log(`[${config.nom}] Aucune donnée valide, ignorée.`);
    return;
  }

  const dateDeDepart = parsed[0].date;
  const sujetsDepart = typeof rows[0][2] === "number" ? (rows[0][2] as number) : 0;
  const totalDeces = parsed.reduce((s, r) => s + (r.mortaliteJour ?? 0), 0);

  console.log(`[${config.nom}] ${parsed.length} jours | départ : ${dateDeDepart} | sujets : ${sujetsDepart}`);

  const [bande] = await db.insert(bandesTable).values({
    numero: config.numero,
    nom: config.nom,
    dateDeDepart,
    sujetsDepart,
    nombreDeces: totalDeces,
    statut: "terminee",
    valeurMaterielFixe: "0",
  }).returning();

  console.log(`  → Bande créée id=${bande.id}`);

  await db.insert(chargesFixesTable).values({ bandeId: bande.id, loyer: "0" });

  let cntMort = 0, cntAlim = 0, cntEau = 0, cntPoids = 0, cntTrait = 0, cntObs = 0;

  for (const r of parsed) {
    const age = r.jourNr;

    if (r.mortaliteJour !== null && r.mortaliteJour >= 0) {
      await db.insert(mortaliteJournaliereTable).values({ bandeId: bande.id, date: r.date, ageJours: age, decesJour: r.mortaliteJour });
      cntMort++;
    }
    if (r.alimentJour !== null && r.alimentJour > 0) {
      await db.insert(consommationAlimentTable).values({ bandeId: bande.id, date: r.date, quantiteKg: String(r.alimentJour) });
      cntAlim++;
    }
    if (r.eauLitres !== null && r.eauLitres > 0) {
      await db.insert(consommationEauTable).values({ bandeId: bande.id, date: r.date, ageJours: age, quantiteLitres: String(r.eauLitres) });
      cntEau++;
    }
    if (r.poidsMoyenG !== null && r.poidsMoyenG > 0) {
      await db.insert(peseesTable).values({ bandeId: bande.id, date: r.date, ageJours: age, poidsMoyenG: String(Math.round(r.poidsMoyenG)) });
      cntPoids++;
    }
    if (r.traitement) {
      await db.insert(traitementsTable).values({
        bandeId: bande.id, date: r.date, ageJours: age,
        produit: r.traitement.substring(0, 200),
        type: "traitement",
      });
      cntTrait++;
    }
    if (r.observation && r.observation !== r.traitement) {
      await db.insert(observationsJournalTable).values({
        bandeId: bande.id, date: r.date, ageJours: age,
        contenu: r.observation.substring(0, 500),
      });
      cntObs++;
    }
  }

  console.log(`  → mortalite:${cntMort} alim:${cntAlim} eau:${cntEau} poids:${cntPoids} traitements:${cntTrait} obs:${cntObs}`);
}

async function main() {
  console.log("=== Import historique Biofarm Valley ===");

  const check = await db.execute(sql`SELECT COUNT(*)::int as cnt FROM bandes WHERE numero < 0`);
  if (Number((check.rows[0] as { cnt: number | string }).cnt) > 0) {
    console.log("Données historiques déjà importées. Supprimez les bandes numero < 0 pour réimporter.");
    process.exit(0);
  }

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.readFile(EXCEL_PATH);
  } catch (e) {
    console.error("Impossible de lire le fichier Excel :", EXCEL_PATH);
    console.error((e as Error).message);
    process.exit(1);
  }

  for (const config of BANDES_CONFIG) {
    const ws = wb.Sheets[config.sheetName];
    if (!ws) {
      console.warn(`Feuille introuvable : ${config.sheetName}`);
      continue;
    }
    try {
      await importBande(config, ws);
    } catch (e) {
      console.error(`Erreur lors de l'import de ${config.nom} :`, (e as Error).message);
    }
  }

  console.log("\n=== Import terminé ===");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
