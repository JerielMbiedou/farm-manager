import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logFromRequest } from "./activity-log";

const router = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ message: "Non authentifié" });
    return false;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (users[0]?.role !== "admin") {
    res.status(403).json({ message: "Réservé aux administrateurs" });
    return false;
  }
  return true;
}

/**
 * Migration de données 2026-05 — corrections du BLOC 4.
 * Endpoint à usage unique : exécute toutes les corrections de catégories,
 * de dates NULL et de normalisation. Idempotent (peut être rejoué sans dommage).
 *
 * Usage : POST /api/admin/migrate-data-2026-05  (rôle admin requis)
 */
router.post("/migrate-data-2026-05", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const report: Record<string, number | string> = {};

  try {
    // 4.1 — Backfill 61 dates NULL avec date_de_depart de la bande
    const r41 = await db.execute(sql`
      UPDATE bande_depenses
      SET date = b.date_de_depart
      FROM bandes b
      WHERE bande_depenses.bande_id = b.id
        AND bande_depenses.date IS NULL
    `);
    report["4.1_dates_null_corrigees"] = r41.rowCount ?? 0;

    // 4.2 — Normalisation des catégories obsolètes
    const r42a = await db.execute(sql`
      UPDATE bande_depenses SET categorie = 'aliments' WHERE categorie = 'concentre'
    `);
    report["4.2a_concentre_vers_aliments"] = r42a.rowCount ?? 0;

    const r42b = await db.execute(sql`
      UPDATE bande_depenses SET categorie = 'transport' WHERE categorie = 'carburant'
    `);
    report["4.2b_carburant_vers_transport"] = r42b.rowCount ?? 0;

    // 4.3 — Trim et apostrophes typographiques
    const r43a = await db.execute(sql`
      UPDATE bande_depenses SET designation = TRIM(designation)
      WHERE designation != TRIM(designation)
    `);
    report["4.3a_trim_bandes"] = r43a.rowCount ?? 0;

    const r43b = await db.execute(sql`
      UPDATE chantier_depenses SET designation = TRIM(designation)
      WHERE designation != TRIM(designation)
    `);
    report["4.3b_trim_chantiers"] = r43b.rowCount ?? 0;

    const r43c = await db.execute(sql`
      UPDATE chantier_depenses
      SET designation = REPLACE(REPLACE(REPLACE(designation, chr(8216), ''''), chr(8217), ''''), chr(8218), '''')
      WHERE designation ~ ('[' || chr(8216) || chr(8217) || chr(8218) || ']')
    `);
    report["4.3c_apostrophes_chantiers"] = r43c.rowCount ?? 0;

    const r43d = await db.execute(sql`
      UPDATE bande_depenses
      SET designation = REPLACE(REPLACE(REPLACE(designation, chr(8216), ''''), chr(8217), ''''), chr(8218), '''')
      WHERE designation ~ ('[' || chr(8216) || chr(8217) || chr(8218) || ']')
    `);
    report["4.3d_apostrophes_bandes"] = r43d.rowCount ?? 0;

    // 4.4 — Reclassement bande_depenses : nouvelles catégories
    const r44a = await db.execute(sql`
      UPDATE bande_depenses SET categorie = 'nettoyage'
      WHERE LOWER(TRIM(designation)) IN (
        'desinfectant','désinfectant','javel','detergent','détergent',
        'chaux','chaux vive','savon','produit nettoyage','produit de nettoyage'
      )
    `);
    report["4.4a_nettoyage"] = r44a.rowCount ?? 0;

    const r44b = await db.execute(sql`
      UPDATE bande_depenses SET categorie = 'energie'
      WHERE categorie = 'autre' AND LOWER(TRIM(designation)) IN (
        'bois','electricite','électricité','ampoules','ampoule','compteur','gaz'
      )
    `);
    report["4.4b_energie"] = r44b.rowCount ?? 0;

    const r44c = await db.execute(sql`
      UPDATE bande_depenses SET categorie = 'equipement'
      WHERE categorie = 'autre' AND LOWER(TRIM(designation)) IN (
        'marteau','pointes','seaux','seau','sacs vides','sac vide','balance',
        'mangeoires','mangeoire'
      )
    `);
    report["4.4c_equipement"] = r44c.rowCount ?? 0;

    // 4.5 — Reclassement chantier_depenses
    const r45a = await db.execute(sql`
      UPDATE chantier_depenses SET categorie = 'restauration'
      WHERE categorie = 'divers' AND LOWER(TRIM(designation)) IN (
        'dejeuner','déjeuner','boisson','boissons','repas'
      )
    `);
    report["4.5a_restauration"] = r45a.rowCount ?? 0;

    const r45b = await db.execute(sql`
      UPDATE chantier_depenses SET categorie = 'eau'
      WHERE categorie = 'divers' AND (
        LOWER(designation) LIKE '%cubitainer%' OR LOWER(designation) LIKE '%versement eau%'
      )
    `);
    report["4.5b_eau"] = r45b.rowCount ?? 0;

    const r45c = await db.execute(sql`
      UPDATE chantier_depenses SET categorie = 'logistique'
      WHERE categorie = 'divers' AND LOWER(TRIM(designation)) IN (
        'vidange voiture','reparation voiture','réparation voiture',
        'location chambre','location chambre pour le matériel (1 mois)'
      )
    `);
    report["4.5c_logistique"] = r45c.rowCount ?? 0;

    // Vérifications finales
    const checkBandes = await db.execute(sql`
      SELECT categorie, COUNT(*)::int as nb FROM bande_depenses GROUP BY categorie ORDER BY categorie
    `);
    const checkChantiers = await db.execute(sql`
      SELECT categorie, COUNT(*)::int as nb FROM chantier_depenses GROUP BY categorie ORDER BY categorie
    `);
    const checkDatesNull = await db.execute(sql`
      SELECT COUNT(*)::int as nb FROM bande_depenses WHERE date IS NULL
    `);

    await logFromRequest(req, "Migration de données 2026-05", JSON.stringify(report));

    res.json({
      success: true,
      message: "Migration terminée avec succès",
      corrections: report,
      verifications: {
        dates_null_restantes: (checkDatesNull.rows[0] as any)?.nb ?? 0,
        categories_bandes: checkBandes.rows,
        categories_chantiers: checkChantiers.rows,
      },
    });
  } catch (err: any) {
    req.log?.error({ err }, "Migration 2026-05 failed");
    res.status(500).json({
      success: false,
      message: "Erreur durant la migration",
      error: err.message,
      partial_report: report,
    });
  }
});

export default router;
