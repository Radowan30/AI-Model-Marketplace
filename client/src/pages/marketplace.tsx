import { Layout } from "@/components/layout/Layout";
import { ModelCard } from "@/components/ModelCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Search, Filter, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Model, Category } from "@/lib/types";
import { fetchPublishedModels } from "@/lib/api";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);
  const [location] = useLocation();
  const { user, currentRole } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch models, categories, and subscriptions from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, is_custom')
          .order('is_custom', { ascending: true })
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch published models with their categories and publisher info
        const modelsData = await fetchPublishedModels();
        setModels(modelsData);

        // Fetch user's subscriptions if logged in
        if (user) {
          const { data: subsData, error: subsError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('buyer_id', user.id);

          if (subsError) throw subsError;
          setSubscriptions(subsData || []);
        }
      } catch (err: any) {
        console.error('Error fetching marketplace data:', err);
        setError(err.message || 'Failed to load marketplace data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Determine if we are in preview mode based on actual user role (not URL parameter)
  // Publishers see preview mode (can't subscribe to models)
  // Buyers see action mode (can subscribe to models)
  const isPublisher = currentRole === 'publisher';
  const isPreview = isPublisher;

  // Get user's subscribed model IDs (for buyers)
  const subscribedModelIds = !isPublisher
    ? subscriptions
        .filter(sub => sub.status === 'active')
        .map(sub => sub.model_id)
    : [];

  // Get publisher's own model IDs (for publishers)
  const myModelIds = isPublisher
    ? models
        .filter(model => model.publisherId === user?.id)
        .map(model => model.id)
    : [];

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          model.description?.toLowerCase().includes(searchTerm.toLowerCase());
    // Check if any of the model's categories match the selected filter
    const matchesCategory = categoryFilter === "all" ||
      (model.categories && model.categories.some((cat: any) => cat.id === categoryFilter));
    const isPublished = model.status === "published";
    const matchesFilter = !showSubscribedOnly ||
      (isPublisher ? myModelIds.includes(model.id) : subscribedModelIds.includes(model.id));
    return matchesSearch && matchesCategory && isPublished && matchesFilter;
  });

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Explore AI models from Malaysia's top researchers and institutions.
          </p>
        </div>

        {isPreview && (
          <Alert className="bg-primary/5 border-primary/20 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Preview Mode</AlertTitle>
            <AlertDescription>
              You are viewing the marketplace as a Publisher. Use a Buyer account to subscribe to models.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by model name or keyword..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium whitespace-nowrap">Filter by:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subscribed Filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Checkbox
              id="subscribed-filter"
              checked={showSubscribedOnly}
              onCheckedChange={(checked) => setShowSubscribedOnly(checked as boolean)}
            />
            <Label
              htmlFor="subscribed-filter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-primary" />
              {isPublisher ? 'Show only my models' : 'Show only my subscriptions'}
              {showSubscribedOnly && (
                <Badge variant="secondary" className="ml-1">
                  {isPublisher
                    ? `${myModelIds.length} ${myModelIds.length === 1 ? 'model' : 'models'}`
                    : `${subscribedModelIds.length} subscribed`
                  }
                </Badge>
              )}
            </Label>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading marketplace</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            {filteredModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    mode={isPreview ? "preview" : "action"}
                    subscribed={subscribedModelIds.includes(model.id)}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No models found</h3>
                <p className="text-muted-foreground max-w-md">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button
                  variant="link"
                  onClick={() => {setSearchTerm(""); setCategoryFilter("all");}}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
