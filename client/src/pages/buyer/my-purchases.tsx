import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { Search, CheckCircle, Clock, XCircle, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity-logger";
import { useToast } from "@/hooks/use-toast";

export default function MyPurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscribedModels, setSubscribedModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch subscriptions with model details
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            models (
              id,
              model_name,
              description,
              categories,
              version,
              profiles!models_publisher_id_fkey (
                name,
                email
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match expected format
        const transformed = data?.map(sub => ({
          id: sub.id,
          buyerId: sub.buyer_id,
          modelId: sub.model_id,
          status: sub.status,
          startDate: new Date(sub.created_at).toLocaleDateString(),
          cancelledDate: sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString() : null,
          model: {
            id: sub.models.id,
            name: sub.models.model_name,
            publisherName: sub.models.profiles?.name || 'Unknown Publisher',
            publisherEmail: sub.models.profiles?.email || '',
            category: sub.models.categories,
            version: sub.models.version,
            description: sub.models.description
          }
        })) || [];

        setSubscribedModels(transformed);
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [user]);

  // Handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId: string, modelName: string) => {
    if (!user) return;

    // Confirm with user
    if (!window.confirm(`Are you sure you want to cancel your subscription to ${modelName}?`)) {
      return;
    }

    try {
      setCancellingId(subscriptionId);

      // Update subscription status in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('buyer_id', user.id); // Ensure user owns this subscription

      if (error) throw error;

      // Log activity
      await logActivity({
        userId: user.id,
        activityType: 'unsubscribed',
        title: `Cancelled subscription to ${modelName}`,
        description: 'Subscription cancelled by user',
        modelId: subscribedModels.find(s => s.id === subscriptionId)?.modelId,
        modelName: modelName
      });

      // Update local state
      setSubscribedModels(prev => prev.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, status: 'cancelled', cancelledDate: new Date().toLocaleDateString() }
          : sub
      ));

      toast({
        title: "Subscription Cancelled",
        description: `Your subscription to ${modelName} has been cancelled.`,
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Split into active and previous (cancelled only)
  const activeSubscriptions = subscribedModels.filter(sub => sub && sub.status === 'active');
  const previousSubscriptions = subscribedModels.filter(sub => sub && sub.status === 'cancelled');

  // Get unique categories from all subscribed models
  const categoriesMap = new Map();
  subscribedModels.forEach(sm => {
    if (sm?.model?.categories) {
      sm.model.categories.forEach(cat => {
        if (!categoriesMap.has(cat.id)) {
          categoriesMap.set(cat.id, cat);
        }
      });
    }
  });
  const categories = Array.from(categoriesMap.values());

  // Apply filters to active subscriptions
  const filteredActiveSubscriptions = activeSubscriptions.filter((sub) => {
    if (!sub) return false;
    const matchesSearch = searchTerm === "" || sub.model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sub.model.categories.some(cat => cat.id === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Apply filters to previous subscriptions
  const filteredPreviousSubscriptions = previousSubscriptions.filter((sub) => {
    if (!sub) return false;
    const matchesSearch = searchTerm === "" || sub.model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sub.model.categories.some(cat => cat.id === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
         <div>
            <h1 className="text-3xl font-heading font-bold">My Purchases</h1>
            <p className="text-muted-foreground">History of your subscribed models and licenses.</p>
         </div>

         {/* Search and Filters */}
         <div className="flex flex-col md:flex-row gap-4">
           {/* Search Bar */}
           <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search models..."
               className="pl-9"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           {/* Category Filter */}
           <Select value={categoryFilter} onValueChange={setCategoryFilter}>
             <SelectTrigger className="w-full md:w-[200px]">
               <SelectValue placeholder="All Categories" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Categories</SelectItem>
               {categories.map((category) => (
                 <SelectItem key={category.id} value={category.id}>
                   {category.name}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>

         {/* Active Subscriptions Section */}
         {filteredActiveSubscriptions.length > 0 && (
           <div className="space-y-4">
             <h2 className="text-2xl font-bold">Active Subscriptions</h2>
             {filteredActiveSubscriptions.map((sub) => {
               if (!sub) return null;
               const { model } = sub;

               return (
                 <Card key={sub.id} className="border-border/50 hover:border-primary/30 transition-colors">
                   <CardContent className="p-6">
                     <div className="flex items-start justify-between gap-4">
                       <Link href={`/model/${model.id}`} className="flex-1 cursor-pointer">
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-bold hover:text-primary transition-colors">{model.name}</h3>
                             {getStatusBadge(sub.status)}
                           </div>
                           <p className="text-sm text-muted-foreground mb-2">
                             Provider: {model.publisherName} • Subscribed on {sub.startDate}
                           </p>
                           <div className="flex flex-wrap gap-2 text-xs">
                             {model.categories.map((cat) => (
                               <Badge key={cat.id} variant="outline" className="font-normal">
                                 {cat.name}
                               </Badge>
                             ))}
                             <Badge variant="outline" className="font-normal whitespace-nowrap">License: Standard Commercial</Badge>
                             <Badge variant="outline" className="font-normal whitespace-nowrap">Version: {model.version}</Badge>
                           </div>
                         </div>
                       </Link>
                       <Button
                         variant="destructive"
                         size="sm"
                         onClick={() => handleCancelSubscription(sub.id, model.name)}
                         disabled={cancellingId === sub.id}
                       >
                         {cancellingId === sub.id ? "Cancelling..." : "Cancel Subscription"}
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         )}

         {/* Separator between sections */}
         {filteredActiveSubscriptions.length > 0 && filteredPreviousSubscriptions.length > 0 && (
           <Separator className="my-8" />
         )}

         {/* Previous Purchases Section */}
         {filteredPreviousSubscriptions.length > 0 && (
           <div className="space-y-4">
             <h2 className="text-2xl font-bold">Previous Purchases</h2>
             {filteredPreviousSubscriptions.map((sub) => {
               if (!sub) return null;
               const { model } = sub;

               return (
                 <Link key={sub.id} href={`/model/${model.id}`} className="block">
                   <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                     <CardContent className="p-6">
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold">{model.name}</h3>
                           {getStatusBadge(sub.status)}
                         </div>
                         <p className="text-sm text-muted-foreground mb-2">
                           Provider: {model.publisherName} • Subscribed on {sub.startDate}
                           {sub.status === 'cancelled' && sub.cancelledDate && ` • Cancelled on ${sub.cancelledDate}`}
                         </p>
                         <div className="flex flex-wrap gap-2 text-xs">
                           {model.categories.map((cat) => (
                             <Badge key={cat.id} variant="outline" className="font-normal">
                               {cat.name}
                             </Badge>
                           ))}
                           <Badge variant="outline" className="font-normal whitespace-nowrap">License: Standard Commercial</Badge>
                           <Badge variant="outline" className="font-normal whitespace-nowrap">Version: {model.version}</Badge>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </Link>
               );
             })}
           </div>
         )}

         {/* Empty State */}
         {filteredActiveSubscriptions.length === 0 && filteredPreviousSubscriptions.length === 0 && (
           <div className="flex flex-col items-center justify-center py-16 bg-secondary/20 rounded-lg border border-dashed border-border">
             <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
             {subscribedModels.length === 0 ? (
               <>
                 <h3 className="text-xl font-bold mb-2">No subscriptions yet</h3>
                 <p className="text-muted-foreground mb-6">Subscribe to models to see them here</p>
                 <Link href="/buyer/marketplace">
                   <Button>Browse Marketplace</Button>
                 </Link>
               </>
             ) : (
               <>
                 <h3 className="text-xl font-bold mb-2">No models found</h3>
                 <p className="text-muted-foreground mb-6">No models match your current filters</p>
                 <Button
                   variant="outline"
                   onClick={() => {
                     setSearchTerm("");
                     setCategoryFilter("all");
                   }}
                 >
                   Clear all filters
                 </Button>
               </>
             )}
           </div>
         )}
      </div>
    </Layout>
  );
}
