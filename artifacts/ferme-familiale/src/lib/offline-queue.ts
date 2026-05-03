/**
 * BLOC 10 — File d'attente hors-ligne (IndexedDB)
 *
 * Stocke les requêtes mutantes (POST/PUT/DELETE) effectuées hors-ligne
 * et les rejoue automatiquement au retour de la connexion.
 *
 * Usage côté composant :
 *   import { enqueueMutation, replayQueue, useQueueSize } from "@/lib/offline-queue";
 *   await enqueueMutation({ url: "/api/...", method: "POST", body: {...} });
 *
 * La file est rejouée automatiquement quand `window` détecte l'événement `online`.
 */

const DB_NAME = "ferme-offline";
const DB_VERSION = 1;
const STORE = "mutations";

export interface QueuedMutation {
  id?: number;
  createdAt: number;
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  label?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function enqueueMutation(m: Omit<QueuedMutation, "id" | "createdAt">): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add({ ...m, createdAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    notifyChange();
  } catch (e) {
    console.warn("[offline-queue] enqueue failed:", e);
  }
}

export async function listQueue(): Promise<QueuedMutation[]> {
  try {
    const db = await openDB();
    return await new Promise<QueuedMutation[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as QueuedMutation[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function deleteEntry(id: number): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearQueue(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    notifyChange();
  } catch {}
}

let replayInProgress = false;

export interface ReplayResult { sent: number; failed: number; remaining: number; }

export async function replayQueue(): Promise<ReplayResult> {
  if (replayInProgress) return { sent: 0, failed: 0, remaining: (await listQueue()).length };
  replayInProgress = true;
  let sent = 0;
  let failed = 0;
  try {
    const items = await listQueue();
    for (const m of items) {
      if (!navigator.onLine) break;
      try {
        const res = await fetch(m.url, {
          method: m.method,
          credentials: "include",
          headers: { "Content-Type": "application/json", ...(m.headers ?? {}) },
          body: m.body !== undefined ? JSON.stringify(m.body) : undefined,
        });
        if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429)) {
          // Succès OU erreur client définitive → on retire de la file (pour ne pas la bloquer indéfiniment)
          if (m.id !== undefined) await deleteEntry(m.id);
          if (res.ok) sent++;
          else failed++;
        } else {
          // Erreur serveur transitoire → on garde et on arrête le batch
          break;
        }
      } catch {
        break;
      }
    }
  } finally {
    replayInProgress = false;
    notifyChange();
  }
  const remaining = (await listQueue()).length;
  return { sent, failed, remaining };
}

// --- Notification de changement (pour les composants UI) ---
type Listener = (size: number) => void;
const listeners = new Set<Listener>();

async function notifyChange() {
  const size = (await listQueue()).length;
  for (const l of listeners) l(size);
}

export function subscribeQueueSize(cb: Listener): () => void {
  listeners.add(cb);
  // Push initial value
  listQueue().then(items => cb(items.length)).catch(() => cb(0));
  return () => { listeners.delete(cb); };
}

// --- Auto-replay au retour de connexion ---
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    replayQueue().catch(() => {});
  });
  // Replay au démarrage si déjà en ligne (queue restée d'une session précédente)
  if (navigator.onLine) {
    setTimeout(() => { replayQueue().catch(() => {}); }, 1500);
  }
}
