import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({
        error: "Données invalides",
        message: issues[0]?.message ?? "Validation échouée",
        issues,
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Normalise une désignation à la saisie :
 * - trim
 * - apostrophes typographiques (' ‘ ‚ ‛) → apostrophe ASCII (')
 * - espaces multiples → espace simple
 * - première lettre en majuscule
 */
export function normalizeDesignation(str: string | null | undefined): string {
  if (!str) return "";
  const cleaned = String(str)
    .trim()
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/\s+/g, " ");
  if (!cleaned) return "";
  // Si tout est en MAJUSCULES (>= 2 caractères), on bascule en Capitalisation
  // pour éviter les doublons "ALIMENT" / "Aliment".
  const isAllUpper = cleaned.length >= 2 && cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned);
  const base = isAllUpper ? cleaned.toLowerCase() : cleaned;
  return base.charAt(0).toLocaleUpperCase("fr-FR") + base.slice(1);
}
