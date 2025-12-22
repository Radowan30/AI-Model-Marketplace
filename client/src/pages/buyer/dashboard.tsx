import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/StatsCard";
import { MOCK_SUBSCRIPTIONS, MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ShoppingBag } from "lucide-react";
import { ModelCard } from "@/components/ModelCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BuyerDashboard() {
  const activeSubs = MOCK_SUBSCRIPTIONS.filter(s => s.buyerId === CURRENT_USER.id && s.status === 'active');
  const pendingSubs = MOCK_SUBSCRIPTIONS.filter(s => s.buyerId === CURRENT_USER.id && s.status === 'pending');
  
  // Get full model details for subscriptions
  const subscribedModels = activeSubs.map(sub => {
    return MOCK_MODELS.find(m => m.id === sub.modelId);
  }).filter(Boolean);

  return (
    <Layout type="dashboard">
       <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Manage your AI capabilities and subscriptions.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <StatsCard 
             title="Active Models" 
             value={activeSubs.length} 
             icon={Activity} 
             description="ready to use"
           />
           <StatsCard 
             title="Pending Requests" 
             value={pendingSubs.length} 
             icon={Clock} 
             description="awaiting approval"
           />
           <StatsCard 
             title="Total Spent" 
             value="RM 0.00" 
             icon={ShoppingBag} 
             description="current billing cycle"
           />
        </div>

        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Active Models</h2>
              <Link href="/buyer/my-purchases">
                 <Button variant="link">View All</Button>
              </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedModels.length > 0 ? (
                 subscribedModels.map((model: any) => (
                    <ModelCard key={model.id} model={model} subscribed={true} />
                 ))
              ) : (
                 <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">You haven't subscribed to any models yet.</p>
                    <Link href="/marketplace">
                       <Button>Browse Marketplace</Button>
                    </Link>
                 </div>
              )}
           </div>
        </div>
       </div>
    </Layout>
  );
}
