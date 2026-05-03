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
  activityLogTable,
  usersTable,
} from "@workspace/db";
import { logger } from "./logger";
import { getParam } from "./parametres";

const BACKUP_DIR = path.resolve(process.cwd(), "exports/backups");
const DEFAULT_RETENTION = 7;

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
    activityLog, users,
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
      activityLog,
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

function pruneOld(retention: number) {
  const all = listBackups();
  if (all.length <= retention) return 0;
  const toDelete = all.slice(retention);
  for (const b of toDelete) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, b.name)); } catch {}
  }
  return toDelete.length;
}

export async function runBackup(): Promise<BackupInfo> {
  ensureDir();
  const retention = Math.max(1, Math.floor(await getParam("backup_retention_jours", DEFAULT_RETENTION)));
  const data = await dumpAll();
  const filename = buildFilename();
  const fullPath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  const stat = fs.statSync(fullPath);
  const removed = pruneOld(retention);
  logger.info({ filename, size: stat.size, pruned: removed, retention }, "Backup created");
  return { name: filename, date: stat.mtime.toISOString(), size: stat.size };
}

export function getBackupPath(name: string): string | null {
  if (!/^backup-[\d-]+\.json$/.test(name)) return null;
  const fullPath = path.join(BACKUP_DIR, name);
  if (!fs.existsSync(fullPath)) return null;
  return fullPath;
}

let scheduledTask: { stop?: () => void } | null = null;
let lastScheduledHour: number | null = null;

async function getBackupHour(): Promise<number> {
  const h = Math.floor(await getParam("backup_heure", 2));
  if (!Number.isFinite(h) || h < 0 || h > 23) return 2;
  return h;
}

export function startBackupCron() {
  import("node-cron").then(async ({ default: cron }) => {
    const heure = await getBackupHour();
    lastScheduledHour = heure;
    scheduledTask = cron.schedule(`0 ${heure} * * *`, () => {
      runBackup().catch(err => logger.error({ err }, "Scheduled backup failed"));
    });
    logger.info({ heure }, `Backup cron scheduled (daily at ${String(heure).padStart(2, "0")}:00)`);

    // Re-check every 5 minutes if the configured hour changed; reschedule if needed
    setInterval(async () => {
      try {
        const newHour = await getBackupHour();
        if (newHour !== lastScheduledHour) {
          if (scheduledTask?.stop) scheduledTask.stop();
          scheduledTask = cron.schedule(`0 ${newHour} * * *`, () => {
            runBackup().catch(err => logger.error({ err }, "Scheduled backup failed"));
          });
          lastScheduledHour = newHour;
          logger.info({ heure: newHour }, "Backup cron rescheduled");
        }
      } catch (err) {
        logger.error({ err }, "Backup cron check failed");
      }
    }, 5 * 60 * 1000);
  }).catch(err => logger.error({ err }, "Failed to load node-cron"));
}
