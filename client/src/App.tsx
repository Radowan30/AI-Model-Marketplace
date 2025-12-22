import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import PublisherDashboard from "@/pages/publisher/dashboard";
import MyModelsPage from "@/pages/publisher/my-models";
import CreateModelPage from "@/pages/publisher/create-model";
import BuyerDashboard from "@/pages/buyer/dashboard";
import MyPurchasesPage from "@/pages/buyer/my-purchases";
import MarketplacePage from "@/pages/marketplace";
import ModelDetailsPage from "@/pages/model-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Publisher Routes */}
      <Route path="/publisher/dashboard" component={PublisherDashboard} />
      <Route path="/publisher/my-models" component={MyModelsPage} />
      <Route path="/publisher/create-model" component={CreateModelPage} />
      
      {/* Buyer Routes */}
      <Route path="/buyer/dashboard" component={BuyerDashboard} />
      <Route path="/buyer/my-purchases" component={MyPurchasesPage} />
      
      {/* Shared Routes */}
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/model/:id" component={ModelDetailsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
