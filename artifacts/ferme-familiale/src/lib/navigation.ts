import type { ComponentType } from "react";
import {
  LayoutDashboard, Bird, CalendarDays, BarChart3,
  TrendingUp, Wallet, Calculator,
  Construction, Package,
  ClipboardList, Users, Settings,
} from "lucide-react";
import { UserRole } from "@workspace/api-client-react";

export type ElementMenu = { href: string; label: string; icon: ComponentType<{ className?: string }>; roles: UserRole[] };
export type GroupeMenu = { label: string; items: ElementMenu[] };

const { admin, investisseur, gestionnaire, lecteur } = UserRole;
const TOUS = [admin, investisseur, gestionnaire, lecteur];

/**
 * Table unique des pages et des rôles qui y ont accès. Le menu l'affiche ;
 * les titres d'onglet en viennent aussi. Les pages sont rangées par sujet
 * (l'élevage, l'argent, les bâtiments, l'administration) plutôt que dans un
 * groupe « Outils » fourre-tout.
 */
export const MENU: GroupeMenu[] = [
  {
    label: "Exploitation",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: TOUS },
      { href: "/bandes", label: "Bandes de poulets", icon: Bird, roles: [admin, gestionnaire, lecteur] },
      { href: "/planification", label: "Planification", icon: CalendarDays, roles: [admin, gestionnaire] },
      { href: "/comparaison-bandes", label: "Comparaison", icon: BarChart3, roles: [admin, investisseur, lecteur] },
    ],
  },
  {
    label: "Finances",
    items: [
      // L'historique de caisse est un onglet de la Trésorerie (/tresorerie/historique).
      { href: "/tresorerie", label: "Trésorerie", icon: TrendingUp, roles: [admin, investisseur, lecteur] },
      { href: "/financement", label: "Apports & prêts", icon: Wallet, roles: TOUS },
      { href: "/simulation", label: "Simulation", icon: Calculator, roles: TOUS },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { href: "/infrastructure", label: "Chantiers & actifs", icon: Construction, roles: [admin, gestionnaire] },
      { href: "/stocks", label: "Stocks", icon: Package, roles: [admin, gestionnaire] },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/activity-log", label: "Journal d'activité", icon: ClipboardList, roles: [admin] },
      { href: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: [admin] },
      { href: "/parametres", label: "Paramètres", icon: Settings, roles: TOUS },
    ],
  },
];

/** Entrée du menu correspondant à une adresse (sous-pages et onglets compris). */
export function entreePour(location: string): ElementMenu | undefined {
  return MENU.flatMap((g) => g.items).find((i) => location === i.href || location.startsWith(i.href + "/"));
}
