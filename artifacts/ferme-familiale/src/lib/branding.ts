// Centralisation du branding & des phases d'élevage côté frontend.
// Charge les paramètres depuis /api/parametres et les met en cache.

export interface FermeBrand {
  nom: string;
  localite: string;
  responsable: string;
  telephone: string;
  email: string;
  devise: string;
}

export interface PhaseConfig {
  nom: string;
  label: string;
  min: number;
  max: number;
  color: string;
}

const DEFAULT_BRAND: FermeBrand = {
  nom: "Ferme Mbiedou",
  localite: "",
  responsable: "",
  telephone: "",
  email: "",
  devise: "FCFA",
};

const DEFAULT_PHASES: PhaseConfig[] = [
  { nom: "Demarrage",  label: "Démarrage",  min: 1,  max: 15,  color: "#3b82f6" },
  { nom: "Croissance", label: "Croissance", min: 16, max: 28,  color: "#22c55e" },
  { nom: "Finition",   label: "Finition",   min: 29, max: 45,  color: "#f59e0b" },
  { nom: "Reforme",    label: "Réformé",    min: 46, max: 999, color: "#8b5cf6" },
];

const DEFAULT_DUREE = 45;

let cachedParams: Record<string, string> | null = null;
let lastFetch = 0;
const TTL = 60_000;

const baseUrl = () =>
  (import.meta as any).env?.VITE_API_BASE_URL ||
  `${window.location.origin}${import.meta.env.BASE_URL}api`.replace(/\/+api$/, "/api");

export async function loadParametresMap(force = false): Promise<Record<string, string>> {
  if (!force && cachedParams && Date.now() - lastFetch < TTL) return cachedParams;
  try {
    const res = await fetch(`${baseUrl()}/parametres`, { credentials: "include" });
    if (!res.ok) return cachedParams ?? {};
    const arr = await res.json();
    const map: Record<string, string> = {};
    for (const p of arr) map[p.cle] = p.valeur;
    cachedParams = map;
    lastFetch = Date.now();
    return map;
  } catch {
    return cachedParams ?? {};
  }
}

export function invalidateBrandCache() {
  cachedParams = null;
  lastFetch = 0;
}

export async function getBrand(): Promise<FermeBrand> {
  const m = await loadParametresMap();
  return {
    nom: m["ferme_nom"] || DEFAULT_BRAND.nom,
    localite: m["ferme_localite"] || "",
    responsable: m["ferme_responsable"] || "",
    telephone: m["ferme_telephone"] || "",
    email: m["ferme_email"] || "",
    devise: m["ferme_devise"] || DEFAULT_BRAND.devise,
  };
}

export async function getPhases(): Promise<PhaseConfig[]> {
  const m = await loadParametresMap();
  const num = (cle: string, def: number) => {
    const v = m[cle];
    if (v === undefined) return def;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : def;
  };
  const dMin = num("phase_demarrage_min", 1);
  const dMax = num("phase_demarrage_max", 15);
  const cMin = num("phase_croissance_min", 16);
  const cMax = num("phase_croissance_max", 28);
  const fMin = num("phase_finition_min", 29);
  const fMax = num("phase_finition_max", 45);
  // Si l'admin n'a pas encore configuré, on retombe sur les défauts
  if (![dMin, dMax, cMin, cMax, fMin, fMax].every(Number.isFinite)) {
    return DEFAULT_PHASES;
  }
  return [
    { nom: "Demarrage",  label: "Démarrage",  min: dMin, max: dMax,  color: "#3b82f6" },
    { nom: "Croissance", label: "Croissance", min: cMin, max: cMax,  color: "#22c55e" },
    { nom: "Finition",   label: "Finition",   min: fMin, max: fMax,  color: "#f59e0b" },
    { nom: "Reforme",    label: "Réformé",    min: fMax + 1, max: 999, color: "#8b5cf6" },
  ];
}

export async function getDureeBandeCible(): Promise<number> {
  const m = await loadParametresMap();
  const v = parseFloat(m["duree_bande_cible"] || "");
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_DUREE;
}

// Synchronous accessors (utilisent la cache déjà chargée). Préchargez via preloadBrand au boot.
export function getBrandSync(): FermeBrand {
  if (!cachedParams) return DEFAULT_BRAND;
  return {
    nom: cachedParams["ferme_nom"] || DEFAULT_BRAND.nom,
    localite: cachedParams["ferme_localite"] || "",
    responsable: cachedParams["ferme_responsable"] || "",
    telephone: cachedParams["ferme_telephone"] || "",
    email: cachedParams["ferme_email"] || "",
    devise: cachedParams["ferme_devise"] || DEFAULT_BRAND.devise,
  };
}

export function getPhasesSync(): PhaseConfig[] {
  if (!cachedParams) return DEFAULT_PHASES;
  const num = (cle: string, def: number) => {
    const v = cachedParams![cle];
    if (v === undefined) return def;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : def;
  };
  const dMin = num("phase_demarrage_min", 1);
  const dMax = num("phase_demarrage_max", 15);
  const cMin = num("phase_croissance_min", 16);
  const cMax = num("phase_croissance_max", 28);
  const fMin = num("phase_finition_min", 29);
  const fMax = num("phase_finition_max", 45);
  return [
    { nom: "Demarrage",  label: "Démarrage",  min: dMin, max: dMax,  color: "#3b82f6" },
    { nom: "Croissance", label: "Croissance", min: cMin, max: cMax,  color: "#22c55e" },
    { nom: "Finition",   label: "Finition",   min: fMin, max: fMax,  color: "#f59e0b" },
    { nom: "Reforme",    label: "Réformé",    min: fMax + 1, max: 999, color: "#8b5cf6" },
  ];
}

export function preloadBrand(): Promise<void> {
  return loadParametresMap().then(() => undefined);
}
