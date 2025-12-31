import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import AboutPage from "@/pages/about";
import AuthPage from "@/pages/auth";
import AuthCallback from "@/pages/auth-callback";
import ResetPasswordPage from "@/pages/reset-password";
import PublisherDashboard from "@/pages/publisher/dashboard";
import MyModelsPage from "@/pages/publisher/my-models";
import CreateModelPage from "@/pages/publisher/create-model";
import EditModelPage from "@/pages/publisher/edit-model";
import SettingsPage from "@/pages/publisher/settings";
import BuyerDashboard from "@/pages/buyer/dashboard";
import MyPurchasesPage from "@/pages/buyer/my-purchases";
import BuyerSettingsPage from "@/pages/buyer/settings";
import MarketplacePage from "@/pages/marketplace";
import ModelDetailsPage from "@/pages/model-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      {/* Publisher Routes */}
      <Route path="/publisher/dashboard">
        <ProtectedRoute allowedRoles={['publisher']}>
          <PublisherDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/publisher/my-models">
        <ProtectedRoute allowedRoles={['publisher']}>
          <MyModelsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/publisher/create-model">
        <ProtectedRoute allowedRoles={['publisher']}>
          <CreateModelPage />
        </ProtectedRoute>
      </Route>
      <Route path="/publisher/edit-model/:id">
        <ProtectedRoute allowedRoles={['publisher']}>
          <EditModelPage />
        </ProtectedRoute>
      </Route>
      <Route path="/publisher/settings">
        <ProtectedRoute allowedRoles={['publisher']}>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Buyer Routes */}
      <Route path="/buyer/dashboard">
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/buyer/my-purchases">
        <ProtectedRoute allowedRoles={['buyer']}>
          <MyPurchasesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/buyer/settings">
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerSettingsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Shared Routes */}
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/marketplace-preview">
        <ProtectedRoute allowedRoles={['publisher']}>
          <MarketplacePage />
        </ProtectedRoute>
      </Route>
      <Route path="/model/:id" component={ModelDetailsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
