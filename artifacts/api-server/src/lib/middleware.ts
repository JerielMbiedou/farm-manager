import type { Request, Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const READ_ONLY_ROLES = new Set(["lecteur", "investisseur"]);

export async function requireWriteAccess(req: Request, res: Response): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ message: "Non authentifié" });
    return false;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const role = users[0]?.role;
  if (!role || READ_ONLY_ROLES.has(role)) {
    res.status(403).json({ message: "Accès en lecture seule" });
    return false;
  }
  return true;
}

/**
 * Réservé aux administrateurs. Masquer une entrée du menu ne protège rien :
 * l'API doit refuser elle-même les autres rôles.
 */
export async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ message: "Non authentifié" });
    return false;
  }
  const users = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId));
  if (users[0]?.role !== "admin") {
    res.status(403).json({ message: "Réservé aux administrateurs" });
    return false;
  }
  return true;
}
