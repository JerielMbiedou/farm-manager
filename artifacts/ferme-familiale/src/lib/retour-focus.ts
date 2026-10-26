import { useRef } from "react";

/**
 * Retour du focus à la fermeture d'un dialogue.
 *
 * Radix rend le focus au bouton DialogTrigger. Or beaucoup de dialogues de
 * l'application s'ouvrent depuis un état (open={…}) sans DialogTrigger : à la
 * fermeture, le focus tombait alors sur <body>, renvoyant clavier et lecteur
 * d'écran en haut de la page. On mémorise donc l'élément d'origine à
 * l'ouverture pour le refocaliser à la fermeture.
 *
 * Sur iPhone et Safari, un clic ne donne pas le focus à un bouton : le dernier
 * élément pointé sert de repli.
 */
const INTERACTIF = 'button, a[href], input, select, textarea, [role="button"], [role="combobox"], [tabindex]:not([tabindex="-1"])';

let dernierPointe: HTMLElement | null = null;
if (typeof document !== "undefined") {
  document.addEventListener(
    "pointerdown",
    (e) => {
      const cible = (e.target as Element | null)?.closest?.(INTERACTIF);
      dernierPointe = cible instanceof HTMLElement ? cible : null;
    },
    true,
  );
}

function elementDOrigine(): HTMLElement | null {
  const actif = document.activeElement;
  if (actif instanceof HTMLElement && actif !== document.body) return actif;
  return dernierPointe;
}

/** Gestionnaires à passer au Content d'un Dialog ou AlertDialog Radix. */
export function useRetourFocus(
  onOpenAutoFocus?: (e: Event) => void,
  onCloseAutoFocus?: (e: Event) => void,
) {
  const origine = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (e: Event) => {
      origine.current = elementDOrigine();
      onOpenAutoFocus?.(e);
    },
    onCloseAutoFocus: (e: Event) => {
      onCloseAutoFocus?.(e);
      if (e.defaultPrevented) return;
      const el = origine.current;
      // L'élément peut avoir disparu (ligne supprimée) : on laisse alors Radix faire.
      if (el && el.isConnected) {
        e.preventDefault();
        el.focus();
      }
    },
  };
}
