import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Wallet, 
  HardHat, 
  Receipt, 
  Bird, 
  LogOut, 
  Menu,
  X,
  BookOpen,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  Package,
  Calculator,
  TrendingUp,
  CalendarDays
} from "lucide-react";
import { useGetMe, useLogout, UserRole } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  
  const allRoles = [UserRole.admin, UserRole.investisseur, UserRole.gestionnaire, "lecteur" as UserRole];
  
  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: allRoles },
    { href: "/financement", label: "Financement", icon: Wallet, roles: allRoles },
    { href: "/devis", label: "Devis construction", icon: HardHat, roles: [UserRole.admin] },
    { href: "/depenses", label: "Depenses", icon: Receipt, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/bandes", label: "Bandes de poulets", icon: Bird, roles: [UserRole.admin, UserRole.gestionnaire, "lecteur" as UserRole] },
    { href: "/historique-caisse", label: "Historique caisse", icon: BookOpen, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/comparaison-bandes", label: "Comparaison", icon: BarChart3, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/stocks", label: "Stocks", icon: Package, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/simulation", label: "Simulation", icon: Calculator, roles: allRoles },
    { href: "/tresorerie", label: "Tresorerie", icon: TrendingUp, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/planification", label: "Planification", icon: CalendarDays, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/activity-log", label: "Journal d'activite", icon: ClipboardList, roles: [UserRole.admin] },
    { href: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: [UserRole.admin] },
    { href: "/parametres", label: "Parametres", icon: Settings, roles: allRoles },
  ].filter(item => item.roles.includes(role));

  const roleLabel: Record<string, string> = {
    [UserRole.admin]: "Administrateur",
    [UserRole.investisseur]: "Investisseur",
    [UserRole.gestionnaire]: "Gestionnaire",
    "lecteur": "Lecteur",
  };
  const roleName = roleLabel[role] || "Utilisateur";

  const userInitials = user.nom ? user.nom.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" className="bg-white shadow-md" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[260px] bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
              <Bird className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sidebar-primary leading-tight">
                Ferme Mbiedou
              </h1>
              <p className="text-[11px] text-sidebar-foreground/50 leading-tight">Gestion avicole</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-3 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-accent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.nom}</div>
              <div className="text-[11px] text-sidebar-foreground/60">{roleName}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}
                `}>
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="text-[13px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto border-t border-sidebar-accent/50">
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-all duration-150 text-[13px]"
            onClick={handleLogout}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Se deconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
