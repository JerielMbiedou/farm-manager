import { GoogleGenAI } from "@google/genai";

// Double fallback : variables standard d'abord, puis variables proxy Replit.
// Permet de déployer aussi bien sur Replit (variables AI_INTEGRATIONS_*) que
// sur Railway/Render/VPS (variables GEMINI_* standard).
const apiKey =
  process.env.GEMINI_API_KEY ?? process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

const baseUrl =
  process.env.GEMINI_BASE_URL ?? process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY (ou AI_INTEGRATIONS_GEMINI_API_KEY) doit être défini. " +
      "Obtenir une clé sur https://aistudio.google.com/app/apikey",
  );
}

export const ai = new GoogleGenAI({
  apiKey,
  // Si baseUrl est défini → proxy (Replit). Sinon → API Google directe.
  ...(baseUrl
    ? { httpOptions: { apiVersion: "", baseUrl } }
    : {}),
});
