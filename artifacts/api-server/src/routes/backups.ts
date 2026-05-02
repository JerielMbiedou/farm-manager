import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { spawn } from "node:child_process";
import { runBackup, listBackups, getBackupPath } from "../lib/backup";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Non authentifié" });
    return false;
  }
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!rows.length || rows[0].role !== "admin") {
    res.status(403).json({ error: "Accès réservé aux administrateurs" });
    return false;
  }
  return true;
}

router.get("/", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  res.json(listBackups());
});

router.post("/run", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const info = await runBackup();
    res.json(info);
  } catch (err: any) {
    req.log.error({ err }, "Manual backup failed");
    res.status(500).json({ error: err.message || "Erreur lors de la sauvegarde" });
  }
});

router.get("/:name/download", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const fullPath = getBackupPath(req.params.name);
  if (!fullPath) {
    res.status(404).json({ error: "Sauvegarde introuvable" });
    return;
  }
  res.download(fullPath, req.params.name);
});

// SQL dump natif via pg_dump — streamé directement au client
router.get("/sql-dump", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    res.status(500).json({ error: "DATABASE_URL non configurée" });
    return;
  }
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `ferme-mbiedou-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.sql`;

  res.setHeader("Content-Type", "application/sql");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const proc = spawn("pg_dump", ["--no-owner", "--no-acl", "--clean", "--if-exists", dbUrl]);
  let errorBuf = "";
  proc.stdout.pipe(res);
  proc.stderr.on("data", (chunk) => { errorBuf += chunk.toString(); });
  proc.on("error", (err) => {
    req.log.error({ err }, "pg_dump failed to spawn");
    if (!res.headersSent) res.status(500).json({ error: "pg_dump introuvable sur le serveur" });
    else res.end();
  });
  proc.on("close", (code) => {
    if (code !== 0) {
      req.log.error({ code, stderr: errorBuf }, "pg_dump exited with error");
      if (!res.headersSent) res.status(500).json({ error: `pg_dump a échoué (code ${code})` });
      else res.end();
    }
  });
});

export default router;
