import type { ReactNode } from "react";

/**
 * Enveloppe d'un graphique Recharts pour les lecteurs d'écran.
 *
 * Un SVG Recharts se lit comme une suite de groupes sans nom. On l'expose
 * comme une image dont le libellé résume les données (`resume`). Quand les
 * mêmes chiffres sont déjà dans un tableau ou une liste juste à côté, on omet
 * `resume` : le graphique est masqué pour ne pas les lire deux fois.
 */
export function Graphique({ resume, className, children }: { resume?: string; className?: string; children: ReactNode }) {
  if (!resume) return <div aria-hidden="true" className={className}>{children}</div>;
  return <div role="img" aria-label={resume} className={className}>{children}</div>;
}

type Format = (v: number) => string;
const nombre: Format = (v) => v.toLocaleString("fr-FR");

/** « Titre : A 120 000, B 80 000. » — au-delà de 8 valeurs, seulement le total, le plus haut et le plus bas. */
export function resumeValeurs(titre: string, valeurs: { nom: string; valeur: number }[], format: Format = nombre): string {
  const v = valeurs.filter((x) => Number.isFinite(x.valeur));
  if (v.length === 0) return `${titre} : aucune donnée.`;
  if (v.length <= 8) return `${titre} : ${v.map((x) => `${x.nom} ${format(x.valeur)}`).join(", ")}.`;
  const tries = [...v].sort((a, b) => b.valeur - a.valeur);
  const haut = tries[0], bas = tries[tries.length - 1];
  return `${titre} : ${v.length} valeurs, la plus haute ${haut.nom} ${format(haut.valeur)}, la plus basse ${bas.nom} ${format(bas.valeur)}.`;
}

/** « Série, de J1 à J35 : de 40 à 1 800, maximum 1 800 à J35. » */
export function resumeSerie(nom: string, points: { x: string; y: number | null | undefined }[], format: Format = nombre): string {
  const p = points.filter((pt): pt is { x: string; y: number } => typeof pt.y === "number" && Number.isFinite(pt.y));
  if (p.length === 0) return `${nom} : aucune donnée.`;
  if (p.length === 1) return `${nom} : ${format(p[0].y)} à ${p[0].x}.`;
  const max = p.reduce((a, b) => (b.y > a.y ? b : a));
  return `${nom}, de ${p[0].x} à ${p[p.length - 1].x} : de ${format(p[0].y)} à ${format(p[p.length - 1].y)}, maximum ${format(max.y)} à ${max.x}.`;
}
