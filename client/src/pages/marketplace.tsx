import { Layout } from "@/components/layout/Layout";
import { ModelCard } from "@/components/ModelCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { Model, Category } from "@/lib/types";
import { fetchPublishedModels } from "@/lib/api";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [modelTypeFilter, setModelTypeFilter] = useState<
    "all" | "own" | "collaborating"
  >("all");
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState<
    "all" | "free" | "paid"
  >("all");
  const [location] = useLocation();
  const { user, userProfile, currentRole } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Store collaborating model IDs from direct query (bypasses RLS issues with join)
  const [collaboratingModelIds, setCollaboratingModelIds] = useState<string[]>(
    [],
  );

  // Fetch models, categories, and subscriptions from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, is_custom")
          .order("is_custom", { ascending: true })
          .order("name", { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch published models with their categories and publisher info
        const modelsData = await fetchPublishedModels();
        setModels(modelsData);

        // Fetch user's subscriptions if logged in
        if (user) {
          const { data: subsData, error: subsError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("buyer_id", user.id);

          if (subsError) throw subsError;
          setSubscriptions(subsData || []);
        }
      } catch (err: any) {
        console.error("Error fetching marketplace data:", err);
        setError(err.message || "Failed to load marketplace data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch collaborating model IDs directly from collaborators table
  // This bypasses RLS issues with the model.collaborators join
  useEffect(() => {
    const fetchCollaboratingModels = async () => {
      if (!user || currentRole !== "publisher") {
        setCollaboratingModelIds([]);
        return;
      }

      const userEmail = (userProfile?.email || user?.email || "")
        .toLowerCase()
        .trim();
      if (!userEmail) {
        console.log(
          "[Marketplace] No user email available for collaborator check",
        );
        setCollaboratingModelIds([]);
        return;
      }

      try {
        const { data: collabData, error: collabError } = await supabase
          .from("collaborators")
          .select("model_id")
          .ilike("email", userEmail);

        if (collabError) {
          console.error("[Marketplace] Collaborator query error:", collabError);
          setCollaboratingModelIds([]);
          return;
        }

        const collabIds = (collabData || []).map((c: any) => c.model_id);
        console.log("[Marketplace] User email:", userEmail);
        console.log("[Marketplace] Collaborating model IDs:", collabIds);
        setCollaboratingModelIds(collabIds);
      } catch (error) {
        console.error(
          "[Marketplace] Error fetching collaborating models:",
          error,
        );
        setCollaboratingModelIds([]);
      }
    };

    fetchCollaboratingModels();
  }, [user, userProfile, currentRole]);

  // Determine if we are in preview mode based on actual user role (not URL parameter)
  // Publishers see preview mode (can't subscribe to models)
  // Buyers see action mode (can subscribe to models)
  const isPublisher = currentRole === "publisher";
  const isPreview = isPublisher;

  // Get user's subscribed model IDs (for buyers)
  const subscribedModelIds = !isPublisher
    ? subscriptions
        .filter((sub) => sub.status === "active")
        .map((sub) => sub.model_id)
    : [];

  // Get publisher's own model IDs (for publishers)
  const myModelIds = isPublisher
    ? models
        .filter((model) => model.publisherId === user?.id)
        .map((model) => model.id)
    : [];

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase());
    // Check if any of the model's categories match any of the selected filters
    const matchesCategory =
      categoryFilter.length === 0 ||
      (model.categories &&
        model.categories.some((cat: any) => categoryFilter.includes(cat.id)));
    const isPublished = model.status === "published";

    // Model type filtering (for publishers only)
    let matchesTypeFilter = true;
    if (isPublisher) {
      const isOwnModel = model.publisherId === user?.id;
      // Use collaboratingModelIds state (from direct query) instead of model.collaborators
      // This bypasses RLS issues with the model.collaborators join
      const isCollaborating = collaboratingModelIds.includes(model.id);

      if (modelTypeFilter === "own") {
        matchesTypeFilter = isOwnModel;
      } else if (modelTypeFilter === "collaborating") {
        matchesTypeFilter = isCollaborating && !isOwnModel;
      }
      // "all" shows everything, no filter needed
    }

    // Subscription type filtering (free/paid)
    let matchesSubscriptionType = true;
    if (subscriptionTypeFilter === "free") {
      matchesSubscriptionType = model.price === "free";
    } else if (subscriptionTypeFilter === "paid") {
      matchesSubscriptionType = model.price === "paid";
    }

    return (
      matchesSearch &&
      matchesCategory &&
      isPublished &&
      matchesTypeFilter &&
      matchesSubscriptionType
    );
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
              You are viewing the marketplace as a Publisher. Use a Buyer
              account to subscribe to models.
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
              {/* Subscription Type Filter (Free/Paid) */}
              <Select
                value={subscriptionTypeFilter}
                onValueChange={(value: "all" | "free" | "paid") =>
                  setSubscriptionTypeFilter(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {/* Model Type Filter (for publishers only) */}
              {isPublisher && (
                <Select
                  value={modelTypeFilter}
                  onValueChange={(value: "all" | "own" | "collaborating") =>
                    setModelTypeFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All models</SelectItem>
                    <SelectItem value="own">Only my models</SelectItem>
                    <SelectItem value="collaborating">
                      Only collaborating
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Category Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-9 w-[200px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring">
                    <span className="truncate text-left">
                      {categoryFilter.length === 0
                        ? "All Categories"
                        : categoryFilter.length === 1
                          ? categories.find((c) => c.id === categoryFilter[0])
                              ?.name
                          : "Multiple Categories"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background">
                      <span className="text-sm font-medium">Categories</span>
                      {categoryFilter.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs"
                          onClick={() => setCategoryFilter([])}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="p-2">
                      {categories.map((category) => {
                        const isSelected = categoryFilter.includes(category.id);
                        return (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md cursor-pointer"
                            onClick={() => {
                              setCategoryFilter((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== category.id)
                                  : [...prev, category.id],
                              );
                            }}
                          >
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setCategoryFilter((prev) =>
                                  checked
                                    ? [...prev, category.id]
                                    : prev.filter((id) => id !== category.id),
                                );
                              }}
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-sm flex-1 cursor-pointer"
                            >
                              {category.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4 [stroke-width:1.5]" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            {filteredModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
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
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter([]);
                  }}
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
