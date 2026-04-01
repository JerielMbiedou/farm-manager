import { Router } from "express";
import { db, activityLogTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
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
