import { Layout } from "@/components/layout/Layout";
import { MOCK_SUBSCRIPTIONS, MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
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
import { useState } from "react";

export default function MyPurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const subscriptions = MOCK_SUBSCRIPTIONS.filter(s => s.buyerId === CURRENT_USER.id);

  // Get subscribed models with details
  const subscribedModels = subscriptions
    .map(sub => {
      const model = MOCK_MODELS.find(m => m.id === sub.modelId);
      return model ? { ...sub, model } : null;
    })
    .filter(Boolean);

  // Split into active and previous (cancelled only)
  const activeSubscriptions = subscribedModels.filter(sub => sub && sub.status === 'active');
  const previousSubscriptions = subscribedModels.filter(sub => sub && sub.status === 'cancelled');

  // Get unique categories from subscribed models
  const categories = Array.from(new Set(subscribedModels.map(sm => sm?.model.category).filter(Boolean)));

  // Apply filters to active subscriptions
  const filteredActiveSubscriptions = activeSubscriptions.filter((sub) => {
    if (!sub) return false;
    const matchesSearch = searchTerm === "" || sub.model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sub.model.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Apply filters to previous subscriptions
  const filteredPreviousSubscriptions = previousSubscriptions.filter((sub) => {
    if (!sub) return false;
    const matchesSearch = searchTerm === "" || sub.model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || sub.model.category === categoryFilter;
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
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
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
                 <SelectItem key={category} value={category as string}>
                   {category}
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
                         </p>
                         <div className="flex gap-2 text-xs">
                           <Badge variant="outline" className="font-normal">
                             {model.category}
                           </Badge>
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
                         <div className="flex gap-2 text-xs">
                           <Badge variant="outline" className="font-normal">
                             {model.category}
                           </Badge>
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
         )}

         {/* Empty State */}
         {filteredActiveSubscriptions.length === 0 && filteredPreviousSubscriptions.length === 0 && (
           <div className="flex flex-col items-center justify-center py-16 bg-secondary/20 rounded-lg border border-dashed border-border">
             <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
             {subscriptions.length === 0 ? (
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
