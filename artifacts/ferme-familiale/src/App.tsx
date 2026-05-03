import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialogHost } from "@/lib/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useGetMe } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Financement from "@/pages/financement";
import Infrastructure from "@/pages/infrastructure";
import Bandes from "@/pages/bandes/index";
import BandeDetailView from "@/pages/bandes/[id]";
import HistoriqueCaisse from "@/pages/historique-caisse";
import ComparaisonBandes from "@/pages/comparaison-bandes";
import ActivityLog from "@/pages/activity-log";
import Utilisateurs from "@/pages/utilisateurs";
import Parametres from "@/pages/parametres";
import Stocks from "@/pages/stocks";
import Simulation from "@/pages/simulation";
import Tresorerie from "@/pages/tresorerie";
import Planification from "@/pages/planification";

/**
 * BLOC A3 — Toast d'erreur backend systématique pour TOUTES les mutations.
 * Si une mutation déclare son propre `onError`, on n'affiche pas le toast global
 * (pour éviter les doublons). Les 401 sont silencieux (gérés par redirection).
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return "Une erreur inattendue est survenue.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "Erreur inconnue.";
  if (typeof error === "object") {
    const e = error as { status?: number; message?: string; data?: { message?: string; error?: string } };
    if (e.data?.message) return e.data.message;
    if (e.data?.error) return e.data.error;
    if (e.message) return e.message;
    if (e.status) return `Erreur HTTP ${e.status}`;
  }
  return "Une erreur inattendue est survenue.";
}

const mutationCache = new MutationCache({
  onError: (error, _vars, _ctx, mutation) => {
    if (mutation.options.onError) return; // mutation gère elle-même l'erreur
    const status = (error as { status?: number } | null)?.status;
    if (status === 401) return; // session expirée → redirect ailleurs
    toast({
      title: "Erreur",
      description: extractErrorMessage(error),
      variant: "destructive",
    });
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 401) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

/** QW1 — Si l'utilisateur est déjà authentifié et atterrit sur /, on l'envoie sur /dashboard. */
function HomeRoute() {
  const { data: user, isLoading } = useGetMe();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);
  return <Login />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard/" component={() => { const [, set] = useLocation(); useEffect(() => set("/dashboard"), [set]); return null; }} />
      
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/financement">
        <Layout><Financement /></Layout>
      </Route>
      <Route path="/infrastructure">
        <Layout><Infrastructure /></Layout>
      </Route>
      <Route path="/bandes" component={() => <Layout><Bandes /></Layout>} />
      <Route path="/bandes/:id" component={() => <Layout><BandeDetailView /></Layout>} />
      <Route path="/historique-caisse">
        <Layout><HistoriqueCaisse /></Layout>
      </Route>
      <Route path="/comparaison-bandes">
        <Layout><ComparaisonBandes /></Layout>
      </Route>
      <Route path="/activity-log">
        <Layout><ActivityLog /></Layout>
      </Route>
      <Route path="/utilisateurs">
        <Layout><Utilisateurs /></Layout>
      </Route>
      <Route path="/parametres">
        <Layout><Parametres /></Layout>
      </Route>
      <Route path="/stocks">
        <Layout><Stocks /></Layout>
      </Route>
      <Route path="/simulation">
        <Layout><Simulation /></Layout>
      </Route>
      <Route path="/tresorerie">
        <Layout><Tresorerie /></Layout>
      </Route>
      <Route path="/planification">
        <Layout><Planification /></Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <ConfirmDialogHost />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
