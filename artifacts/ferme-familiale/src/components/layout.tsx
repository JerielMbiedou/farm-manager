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
    return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Chargement...</div>;
  }

  if (!user) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: "À bientôt", description: "Vous êtes déconnecté." });
      setLocation("/login");
    } catch {
      toast({ title: "Erreur", description: "Impossible de se déconnecter", variant: "destructive" });
    }
  };

  const role = user.role as UserRole;
  
  const allRoles = [UserRole.admin, UserRole.investisseur, UserRole.gestionnaire, "lecteur" as UserRole];
  
  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: allRoles },
    { href: "/financement", label: "Financement", icon: Wallet, roles: allRoles },
    { href: "/devis", label: "Devis construction", icon: HardHat, roles: [UserRole.admin] },
    { href: "/depenses", label: "Dépenses", icon: Receipt, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/bandes", label: "Bandes de poulets", icon: Bird, roles: [UserRole.admin, UserRole.gestionnaire, "lecteur" as UserRole] },
    { href: "/historique-caisse", label: "Historique caisse", icon: BookOpen, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/comparaison-bandes", label: "Comparaison", icon: BarChart3, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/stocks", label: "Stocks", icon: Package, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/simulation", label: "Simulation", icon: Calculator, roles: allRoles },
    { href: "/tresorerie", label: "Trésorerie", icon: TrendingUp, roles: [UserRole.admin, UserRole.investisseur, "lecteur" as UserRole] },
    { href: "/planification", label: "Planification", icon: CalendarDays, roles: [UserRole.admin, UserRole.gestionnaire] },
    { href: "/activity-log", label: "Journal d'activité", icon: ClipboardList, roles: [UserRole.admin] },
    { href: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: [UserRole.admin] },
    { href: "/parametres", label: "Paramètres", icon: Settings, roles: allRoles },
  ].filter(item => item.roles.includes(role));

  const roleLabel: Record<string, string> = {
    [UserRole.admin]: "Administrateur",
    [UserRole.investisseur]: "Investisseur",
    [UserRole.gestionnaire]: "Gestionnaire",
    "lecteur": "Lecteur",
  };
  const roleName = roleLabel[role] || "Utilisateur";

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight text-sidebar-primary flex items-center gap-2">
              <Bird className="h-6 w-6" />
              Ferme Mbiedou
            </h1>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-sidebar-foreground/80">Connecté en tant que</span>
              <span className="text-base font-semibold">{user.nom}</span>
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-sidebar-primary/20 text-sidebar-primary self-start border border-sidebar-primary/30">
                {roleName}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer
                    ${isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                  `}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 bg-transparent border-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
