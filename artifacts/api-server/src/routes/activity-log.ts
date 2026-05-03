import { Router } from "express";
import type { Request } from "express";
import { db, activityLogTable, usersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

// BLOC 8 — Pagination serveur.
// Compatibilité ascendante :
//   - GET /api/activity-log                 → ancien comportement (tableau brut, max 50)
//   - GET /api/activity-log?limit=N         → ancien comportement, N éléments max
//   - GET /api/activity-log?page=1&pageSize=25
//        → nouveau comportement : { items, total, page, pageSize }
router.get("/", async (req, res) => {
  const hasPagination = req.query.page !== undefined || req.query.pageSize !== undefined;

  if (hasPagination) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize as string) || 25));
    const offset = (page - 1) * pageSize;

    const [items, totalRow] = await Promise.all([
      db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(pageSize).offset(offset),
      db.execute(sql`SELECT COUNT(*)::int AS c FROM activity_log`),
    ]);
    const total = (totalRow as any).rows?.[0]?.c ?? (totalRow as any)[0]?.c ?? 0;
    res.json({ items, total, page, pageSize });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const rows = await db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(limit);
  res.json(rows);
});

export default router;

export async function logActivity(userId: number | null, userNom: string, action: string, details?: string) {
  await db.insert(activityLogTable).values({
    userId,
    userNom,
    action,
    details: details || null,
  });
}

export async function logFromRequest(req: Request, action: string, details?: string) {
  const userId = (req.session as any).userId as number | undefined;
  let userNom = "Système";
  if (userId) {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (users.length > 0) userNom = users[0].nom;
  }
  await logActivity(userId ?? null, userNom, action, details);
}
