import fs from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import {
  bandesTable,
  bandeDepensesTable,
  bandeVentesTable,
  chargesFixesTable,
  depensesVenteTable,
  mortaliteJournaliereTable,
  peseesTable,
  consommationAlimentTable,
  vaccinationsTable,
  consommationEauTable,
  traitementsTable,
  observationsJournalTable,
  chantiersTable,
  chantierLotsTable,
  chantierDevisLignesTable,
  chantierDepensesTable,
  actifsTable,
  bandeActifsTable,
  parametresTable,
  stockAlimentsTable,
  stockMedicamentsTable,
  financementTable,
  remboursementsTable,
  sortiesArgentTable,
  sortiesCarburantTable,
  devisConstructionTable,
  depensesBatimentTable,
  depensesPuitsTable,
  puitsItemsTable,
  activityLogTable,
  usersTable,
} from "@workspace/db";
import { logger } from "./logger";

const BACKUP_DIR = path.resolve(process.cwd(), "exports/backups");
const RETENTION = 7;

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

async function dumpAll() {
  const [
    bandes, bandeDepenses, bandeVentes, chargesFixes, depensesVente,
    mortalite, pesees, consAliment, vaccinations, consEau,
    traitements, observations,
    chantiers, chantierLots, chantierDevisLignes, chantierDepenses,
    actifs, bandeActifs, parametres,
    stockAliments, stockMedicaments, financement, remboursements,
    sortiesArgent, sortiesCarburant, devis, depensesBatiment,
    depensesPuits, puitsItems, activityLog, users,
  ] = await Promise.all([
    db.select().from(bandesTable),
    db.select().from(bandeDepensesTable),
    db.select().from(bandeVentesTable),
    db.select().from(chargesFixesTable),
    db.select().from(depensesVenteTable),
    db.select().from(mortaliteJournaliereTable),
    db.select().from(peseesTable),
    db.select().from(consommationAlimentTable),
    db.select().from(vaccinationsTable),
    db.select().from(consommationEauTable),
    db.select().from(traitementsTable),
    db.select().from(observationsJournalTable),
    db.select().from(chantiersTable),
    db.select().from(chantierLotsTable),
    db.select().from(chantierDevisLignesTable),
    db.select().from(chantierDepensesTable),
    db.select().from(actifsTable),
    db.select().from(bandeActifsTable),
    db.select().from(parametresTable),
    db.select().from(stockAlimentsTable),
    db.select().from(stockMedicamentsTable),
    db.select().from(financementTable),
    db.select().from(remboursementsTable),
    db.select().from(sortiesArgentTable),
    db.select().from(sortiesCarburantTable),
    db.select().from(devisConstructionTable),
    db.select().from(depensesBatimentTable),
    db.select().from(depensesPuitsTable),
    db.select().from(puitsItemsTable),
    db.select().from(activityLogTable),
    db.select().from(usersTable),
  ]);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    tables: {
      bandes, bandeDepenses, bandeVentes, chargesFixes, depensesVente,
      mortalite, pesees, consAliment, vaccinations, consEau,
      traitements, observations,
      chantiers, chantierLots, chantierDevisLignes, chantierDepenses,
      actifs, bandeActifs, parametres,
      stockAliments, stockMedicaments, financement, remboursements,
      sortiesArgent, sortiesCarburant, devis, depensesBatiment,
      depensesPuits, puitsItems, activityLog,
      users: users.map((u: any) => ({ ...u, password: "[REDACTED]" })),
    },
  };
}

function pad(n: number) { return n.toString().padStart(2, "0"); }
function buildFilename(d = new Date()): string {
  return `backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}.json`;
}

export type BackupInfo = { name: string; date: string; size: number };

export function listBackups(): BackupInfo[] {
  ensureDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith("backup-") && f.endsWith(".json"))
    .map(name => {
      const stat = fs.statSync(path.join(BACKUP_DIR, name));
      return { name, date: stat.mtime.toISOString(), size: stat.size };
    })
    .sort((a, b) => b.name.localeCompare(a.name));
}

function pruneOld() {
  const all = listBackups();
  if (all.length <= RETENTION) return 0;
  const toDelete = all.slice(RETENTION);
  for (const b of toDelete) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, b.name)); } catch {}
  }
  return toDelete.length;
}

export async function runBackup(): Promise<BackupInfo> {
  ensureDir();
  const data = await dumpAll();
  const filename = buildFilename();
  const fullPath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  const stat = fs.statSync(fullPath);
  const removed = pruneOld();
  logger.info({ filename, size: stat.size, pruned: removed }, "Backup created");
  return { name: filename, date: stat.mtime.toISOString(), size: stat.size };
}

export function getBackupPath(name: string): string | null {
  if (!/^backup-[\d-]+\.json$/.test(name)) return null;
  const fullPath = path.join(BACKUP_DIR, name);
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

export function startBackupCron() {
  import("node-cron").then(({ default: cron }) => {
    cron.schedule("0 2 * * *", () => {
      runBackup().catch(err => logger.error({ err }, "Scheduled backup failed"));
    });
    logger.info("Backup cron scheduled (daily 02:00)");
  }).catch(err => logger.error({ err }, "Failed to load node-cron"));
}
