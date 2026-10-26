import type { GenerateContentParameters, GenerateContentResponse } from "@google/genai";
import { ai, GEMINI_TEXT_MODEL } from "./client";

/**
 * Modèle de secours quand le modèle principal est saturé. Les modèles « lite »
 * tournent sur une autre capacité chez Google et restent souvent disponibles.
 * GEMINI_FALLBACK_MODEL permet d'en changer ; une valeur vide le désactive.
 */
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest";

/** Saturation passagère chez Google (503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, 500). */
export class GeminiIndisponible extends Error {
  constructor(cause: unknown) {
    super("Le service de lecture Google Gemini est saturé pour le moment.");
    this.name = "GeminiIndisponible";
    this.cause = cause;
  }
}

function codeErreur(e: unknown): number | undefined {
  const status = (e as { status?: unknown })?.status;
  if (typeof status === "number") return status;
  const m = String((e as Error)?.message ?? e).match(/"code"\s*:\s*(\d{3})/);
  return m ? Number(m[1]) : undefined;
}

function estPassagere(e: unknown): boolean {
  const code = codeErreur(e);
  if (code === 429 || code === 500 || code === 503) return true;
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(String((e as Error)?.message ?? e));
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * generateContent avec reprise : le modèle principal est réessayé deux fois
 * (après 1 s puis 3 s), puis le modèle de secours une fois. Une erreur qui
 * n'est pas une saturation (image refusée, clé invalide…) remonte aussitôt.
 * Si tout reste saturé, lève GeminiIndisponible.
 */
export async function genererAvecReprise(
  params: Omit<GenerateContentParameters, "model">,
): Promise<GenerateContentResponse> {
  const essais: Array<[string, number]> = [
    [GEMINI_TEXT_MODEL, 0],
    [GEMINI_TEXT_MODEL, 1000],
    [GEMINI_TEXT_MODEL, 3000],
  ];
  if (GEMINI_FALLBACK_MODEL && GEMINI_FALLBACK_MODEL !== GEMINI_TEXT_MODEL) essais.push([GEMINI_FALLBACK_MODEL, 0]);

  let derniere: unknown;
  for (const [model, attente] of essais) {
    if (attente) await pause(attente);
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (e) {
      derniere = e;
      // Le modèle de secours peut ne pas exister pour ce projet : on s'arrête
      // alors sur l'erreur de saturation du modèle principal.
      if (model === GEMINI_FALLBACK_MODEL) break;
      if (!estPassagere(e)) throw e;
    }
  }
  throw new GeminiIndisponible(derniere);
}
