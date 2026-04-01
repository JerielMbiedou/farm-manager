import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Identifiant et mot de passe requis" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.username, username));
  const user = users[0];

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Identifiants incorrects" });
    return;
  }

  (req.session as any).userId = user.id;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nom: user.nom,
    },
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = users[0];

  if (!user) {
    res.status(401).json({ error: "Utilisateur introuvable" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    nom: user.nom,
  });
});

export default router;
