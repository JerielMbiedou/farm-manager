/**
 * Texte de légende des graphiques dans la couleur du texte courant.
 * Par défaut, Recharts écrit la légende dans la couleur de la série : l'ambre
 * (2,11:1) et le rouge (3,70:1) passaient sous le minimum de 4,5:1. La pastille
 * colorée à côté du texte garde le lien avec la courbe.
 */
export const legendeLisible = (valeur: string) => <span className="text-foreground">{valeur}</span>;
