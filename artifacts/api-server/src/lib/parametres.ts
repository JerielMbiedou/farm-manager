import { db, parametresTable } from "@workspace/db";

let cache: Record<string, string> = {};
let lastLoad = 0;
const CACHE_TTL = 60_000;

export async function getParametres(): Promise<Record<string, string>> {
  if (Date.now() - lastLoad < CACHE_TTL && Object.keys(cache).length > 0) {
    return cache;
  }
  const rows = await db.select().from(parametresTable);
  cache = {};
  for (const r of rows) {
    cache[r.cle] = r.valeur;
  }
  lastLoad = Date.now();
  return cache;
}

export function invalidateCache() {
  lastLoad = 0;
}

export async function getParam(cle: string, defaut: number): Promise<number> {
  const params = await getParametres();
  const v = params[cle];
  return v !== undefined ? parseFloat(v) : defaut;
}

export async function getParamStr(cle: string, defaut: string): Promise<string> {
  const params = await getParametres();
  return params[cle] ?? defaut;
}

const DEFAULT_VACCINS = [
  { jourPrevu: 1, nom: "Désinfection et installation", description: "Préparation du poulailler" },
  { jourPrevu: 7, nom: "Vaccin Newcastle", description: "Première vaccination contre Newcastle" },
  { jourPrevu: 14, nom: "Vaccin Gumboro", description: "Vaccination contre la maladie de Gumboro" },
  { jourPrevu: 21, nom: "Rappel Newcastle", description: "Rappel de vaccination Newcastle" },
  { jourPrevu: 28, nom: "Vaccin Bronchite infectieuse", description: "Vaccination contre la bronchite infectieuse" },
];

export async function getVaccinationSchedule(): Promise<Array<{ jourPrevu: number; nom: string; description: string }>> {
  const params = await getParametres();
  const schedule = [];
  for (const prefix of ["vaccin_j1", "vaccin_j7", "vaccin_j14", "vaccin_j21", "vaccin_j28"]) {
    const jour = params[`${prefix}_jour`];
    const nom = params[`${prefix}_nom`];
    const desc = params[`${prefix}_description`];
    if (jour && nom) {
      schedule.push({
        jourPrevu: parseInt(jour),
        nom,
        description: desc || "",
      });
    }
  }
  return schedule.length > 0 ? schedule : DEFAULT_VACCINS;
}
