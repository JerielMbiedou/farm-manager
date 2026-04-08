import { Router } from "express";
import multer from "multer";

let aiClient: any = null;
async function getAI() {
  if (!aiClient) {
    const mod = await import("@workspace/integrations-gemini-ai");
    aiClient = mod.ai;
  }
  return aiClient;
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const EXTRACTION_PROMPT = `Tu es un assistant qui extrait les données d'une fiche de suivi d'élevage de poulets de chair.
La fiche contient un tableau avec les colonnes : Jour, Température (8h, 12h, 18h), alimentation (kg), eau (litres), mortalité (nombre de décès), Observations.
Les jours de la semaine sont : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.
La fiche peut aussi contenir : période (dates), semaine N°, effectif en début de semaine, poids moyen en fin de semaine.

Extrais TOUTES les données lisibles du tableau et retourne un JSON valide avec cette structure exacte :
{
  "semaine": <numéro de semaine ou null>,
  "periodeDu": "<date début ou null>",
  "periodeAu": "<date fin ou null>",
  "effectifDebut": <nombre ou null>,
  "poidsMoyenFinSemaine": <nombre en grammes ou null>,
  "jours": [
    {
      "jour": "lundi",
      "alimentationKg": <nombre ou null>,
      "eauLitres": <nombre ou null>,
      "mortalite": <nombre ou 0>,
      "observations": "<texte ou chaîne vide>"
    }
  ]
}

Règles importantes :
- Retourne UNIQUEMENT le JSON, sans markdown, sans backticks, sans texte avant ou après
- Si une cellule est vide ou illisible, mets null pour les nombres et "" pour les textes
- mortalite doit être 0 si la cellule est vide (pas null)
- Les quantités d'aliment sont en kg, l'eau en litres
- Inclus uniquement les jours qui ont au moins une donnée remplie
- Si le poids est en kg, convertis en grammes (multiplie par 1000)`;

router.post("/", upload.single("photo"), async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  try {
    if (!req.file) {
      res.status(400).json({ error: "Aucune image fournie" });
      return;
    }

    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype as "image/jpeg" | "image/png" | "image/webp";

    const ai = await getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: EXTRACTION_PROMPT },
          ],
        },
      ],
      config: { maxOutputTokens: 8192 },
    });

    const rawText = response.text ?? "";

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      res.status(422).json({ error: "Impossible de lire les données de la fiche", raw: rawText });
      return;
    }

    if (!parsed.jours || !Array.isArray(parsed.jours)) {
      res.status(422).json({ error: "Aucune donnée journalière trouvée", data: parsed });
      return;
    }

    res.json(parsed);
  } catch (err: any) {
    console.error("OCR error:", err);
    res.status(500).json({ error: "Erreur lors de l'analyse de l'image", details: err.message });
  }
});

export default router;
