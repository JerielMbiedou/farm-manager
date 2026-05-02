import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

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

const queryClient = new QueryClient({
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
