import { Layout } from "@/components/layout/Layout";
import { MOCK_SUBSCRIPTIONS, MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function MyPurchasesPage() {
  const subscriptions = MOCK_SUBSCRIPTIONS.filter(s => s.buyerId === CURRENT_USER.id);

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
         <div>
            <h1 className="text-3xl font-heading font-bold">My Purchases</h1>
            <p className="text-muted-foreground">History of your subscribed models and licenses.</p>
         </div>

         <div className="space-y-4">
            {subscriptions.map(sub => {
               const model = MOCK_MODELS.find(m => m.id === sub.modelId);
               if (!model) return null;

               return (
                  <Link key={sub.id} href={`/model/${model.id}`} className="block">
                     <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                 <h3 className="text-xl font-bold">{model.name}</h3>
                                 <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                    {sub.status}
                                 </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                 Provider: {model.publisherName} • Subscribed on {sub.startDate}
                              </p>
                              <div className="flex gap-2 text-xs">
                                 <Badge variant="outline" className="font-normal">License: Standard Commercial</Badge>
                                 <Badge variant="outline" className="font-normal">Version: {model.version}</Badge>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </Link>
               );
            })}
         </div>
      </div>
    </Layout>
  );
}
