import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Menu, X } from "lucide-react";
import { useLogout, UserRole } from "@workspace/api-client-react";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { preloadBrand, getBrandSync } from "@/lib/branding";
import { OfflineBanner } from "@/components/offline-banner";
import { setPageTitle } from "@/lib/page-title";
import { MENU, entreePour, roleAutorise } from "@/lib/navigation";
import logoMbiedou from "@assets/logos/v7_medallion_hen_chicks.png";

// lg de Tailwind : au-delà, la barre latérale est toujours affichée.
const REQUETE_BUREAU = "(min-width: 1024px)";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, enCours: isLoading } = useSession();
  const logout = useLogout();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia(REQUETE_BUREAU).matches);
  useEffect(() => {
    const mq = window.matchMedia(REQUETE_BUREAU);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  // Échap referme le menu mobile, comme tout panneau superposé.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);
  // BLOC 2 — nom de la ferme dynamique (chargé depuis /api/parametres)
  const [fermeNom, setFermeNom] = useState<string>(getBrandSync().nom);
  useEffect(() => {
    let alive = true;
    preloadBrand().then(() => { if (alive) setFermeNom(getBrandSync().nom); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!roleAutorise(location, user?.role as UserRole | undefined)) { setPageTitle("Accès réservé"); return; }
    // La fiche d'une bande (/bandes/:id) pose son propre titre (nom + onglet).
    if (/^\/bandes\/[^/]+/.test(location)) return;
    setPageTitle(entreePour(location)?.label ?? "");
  }, [location, fermeNom, user?.role]);

  useEffect(() => {
    if (!isLoading && !user && location !== "/login" && location !== "/") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: "A bientot", description: "Vous etes deconnecte." });
      setLocation("/login");
    } catch {
      toast({ title: "Erreur", description: "Impossible de se deconnecter", variant: "destructive" });
    }
  };

  const role = user.role as UserRole;
  const allRoles: UserRole[] = [UserRole.admin, UserRole.investisseur, UserRole.gestionnaire, UserRole.lecteur];


  const filteredGroups = MENU.map(g => ({
    ...g,
    items: g.items.filter(item => item.roles.includes(role)),
  })).filter(g => g.items.length > 0);

  const roleLabel: Record<UserRole, string> = {
    [UserRole.admin]: "Administrateur",
    [UserRole.investisseur]: "Investisseur",
    [UserRole.gestionnaire]: "Gestionnaire",
    [UserRole.lecteur]: "Lecteur",
  };
  const roleName = roleLabel[role] || "Utilisateur";
  const userInitials = user.nom ? user.nom.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-md"
        onClick={(e) => { e.preventDefault(); document.getElementById("contenu")?.focus(); }}
      >
        Aller au contenu
      </a>
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-md"
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="menu-principal"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        id="menu-principal"
        // Fermé sur mobile, le menu est seulement glissé hors écran : sans inert,
        // la touche Tab et les lecteurs d'écran parcouraient ses liens invisibles.
        inert={!isDesktop && !isMobileMenuOpen}
        className={`
        fixed inset-y-0 left-0 z-40 w-[260px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={logoMbiedou}
              alt="Logo Ferme Mbiedou"
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <div>
              <p className="text-[1.0625rem] font-semibold tracking-tight leading-tight">
                {fermeNom}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">Gestion avicole</p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-3 p-3 rounded-xl bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.nom}</div>
              <div className="text-xs text-muted-foreground">{roleName}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          {filteredGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
              <div className="px-3 py-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{group.label}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || location.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer
                        ${isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent"}
                      `}>
                        {/* Comme une barre latérale Apple : icône dans la couleur d'accent, blanche sur la ligne sélectionnée. */}
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "" : "text-sidebar-primary"}`} />
                        <span className="text-[0.8125rem] flex-1">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 mt-auto border-t border-sidebar-border">
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-sidebar-accent transition-colors duration-150 text-[0.8125rem]"
            onClick={handleLogout}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main id="contenu" tabIndex={-1} className="flex-1 flex flex-col min-w-0 overflow-hidden focus:outline-none">
        <OfflineBanner />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
