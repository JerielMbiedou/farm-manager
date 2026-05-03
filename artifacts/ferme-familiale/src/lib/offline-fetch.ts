import { enqueueMutation } from "./offline-queue";

/**
 * BLOC 10 — Wrapper fetch qui bascule en file d'attente hors-ligne
 * dès qu'on détecte une absence de connexion ou une erreur réseau.
 *
 * Usage :
 *   const r = await offlineFetch(url, { method: "POST", body: { ... }, label: "Saisie mortalité" });
 *   if (r.queued) toast({ title: "Enregistré localement, sera synchronisé." });
 *
 * Comportement :
 *   - Si en ligne et requête OK → renvoie { ok: true, queued: false, response }
 *   - Si en ligne mais erreur HTTP → renvoie { ok: false, queued: false, response }
 *   - Si hors-ligne ou erreur réseau → enfile et renvoie { ok: true, queued: true }
 */
export interface OfflineFetchOptions {
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  label?: string;
}

export interface OfflineFetchResult {
  ok: boolean;
  queued: boolean;
  response?: Response;
  status?: number;
}

export async function offlineFetch(url: string, opts: OfflineFetchOptions): Promise<OfflineFetchResult> {
  const offline = typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine;
  if (offline) {
    await enqueueMutation({ url, method: opts.method, body: opts.body, headers: opts.headers, label: opts.label });
    return { ok: true, queued: true };
  }
  try {
    const res = await fetch(url, {
      method: opts.method,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    return { ok: res.ok, queued: false, response: res, status: res.status };
  } catch {
    // Erreur réseau (DNS, perte de connexion en plein milieu) → enfile
    await enqueueMutation({ url, method: opts.method, body: opts.body, headers: opts.headers, label: opts.label });
    return { ok: true, queued: true };
  }
}
