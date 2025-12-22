import { Layout } from "@/components/layout/Layout";
import { ModelCard } from "@/components/ModelCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [location] = useLocation();

  // Determine if we are in preview mode or action mode based on query params or login state
  // Simplification: checking URL query param 'preview'
  const isPreview = location.includes("preview=true");
  
  // Also check if logged in (mocked)
  const isLoggedIn = true; // Assume true for demo, role determines access

  const filteredModels = MOCK_MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || model.category === categoryFilter;
    const isPublished = model.status === "published";
    return matchesSearch && matchesCategory && isPublished;
  });

  const categories = Array.from(new Set(MOCK_MODELS.map(m => m.category)));

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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map(model => (
              <ModelCard 
                key={model.id} 
                model={model} 
                mode={isPreview ? "preview" : "action"}
                subscribed={false} // Would check specific user subscription status here
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
      </div>
    </Layout>
  );
}
