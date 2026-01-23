import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, Package, CheckCircle, Users, Loader2, FileX, Send, ChevronDown } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Model } from "@/lib/types";
import { transformDatabaseModels } from "@/lib/data-transforms";
import { formatCount } from "@/lib/format-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function MyModelsPage() {
  const { user, userProfile } = useAuth();
  const [myModels, setMyModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modelTypeFilter, setModelTypeFilter] = useState<"all" | "own" | "collaborating">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  // Store collaborating model IDs from direct query (bypasses RLS issues with join)
  const [collaboratingModelIds, setCollaboratingModelIds] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch publisher's models
  useEffect(() => {
    const fetchModels = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch models where user is owner OR collaborator
        const { data: ownModels, error: ownError } = await supabase
          .from('models')
          .select(`
            *,
            collaborators(name, email)
          `)
          .eq('publisher_id', user.id)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Fetch models where user is a collaborator (use userProfile.email for consistency)
        const userEmail = (userProfile?.email || user.email || '').toLowerCase().trim();
        console.log("[My Models] User email for collaborator check:", userEmail);

        const { data: collabData, error: collabError } = await supabase
          .from('collaborators')
          .select('model_id')
          .ilike('email', userEmail || '');

        if (collabError) {
          console.error("[My Models] Collaborator query error:", collabError);
          throw collabError;
        }

        console.log("[My Models] Collaborator query result:", collabData);

        const collabModelIds = (collabData || []).map((c: any) => c.model_id);
        // Store in state for filtering (bypasses RLS issues with model.collaborators join)
        setCollaboratingModelIds(collabModelIds);
        console.log("[My Models] Collaborating model IDs:", collabModelIds);

        // Fetch collaborating models (where user is not the owner)
        let collabModels: any[] = [];
        if (collabModelIds.length > 0) {
          const { data: collabModelsData, error: collabModelsError } = await supabase
            .from('models')
            .select(`
              *,
              collaborators(name, email)
            `)
            .in('id', collabModelIds)
            .neq('publisher_id', user.id)
            .order('created_at', { ascending: false });

          if (collabModelsError) throw collabModelsError;
          collabModels = collabModelsData || [];
        }

        // Combine both lists
        const data = [...(ownModels || []), ...collabModels];
        const error = null;

        if (error) throw error;

        if (!data || data.length === 0) {
          setMyModels([]);
          setLoading(false);
          return;
        }

        // Get model IDs for fetching stats
        const modelIds = data.map(m => m.id);

        // Fetch all views for these models (all-time)
        const { data: allViews, error: viewsError } = await supabase
          .from('views')
          .select('model_id')
          .in('model_id', modelIds);

        if (viewsError) {
          console.error('Error fetching views:', viewsError);
        }

        // Fetch all downloads for these models
        const { data: allDownloads, error: downloadsError } = await supabase
          .from('user_activities')
          .select('model_id')
          .in('model_id', modelIds)
          .eq('activity_type', 'downloaded');

        if (downloadsError) {
          console.error('Error fetching downloads:', downloadsError);
        }

        // Group views and downloads by model_id
        const viewsByModel: { [key: string]: number } = {};
        const downloadsByModel: { [key: string]: number } = {};

        (allViews || []).forEach((view: any) => {
          viewsByModel[view.model_id] = (viewsByModel[view.model_id] || 0) + 1;
        });

        (allDownloads || []).forEach((download: any) => {
          downloadsByModel[download.model_id] = (downloadsByModel[download.model_id] || 0) + 1;
        });

        // Add stats to models
        const modelsWithStats = data.map(model => ({
          ...model,
          total_views: viewsByModel[model.id] || 0,
          downloads: downloadsByModel[model.id] || 0
        }));

        setMyModels(transformDatabaseModels(modelsWithStats));
      } catch (error: any) {
        console.error('Error fetching models:', error);
        toast({
          title: "Error loading models",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [user, userProfile]);

  // Fetch subscribers for publisher's models
  useEffect(() => {
    const fetchSubscribers = async () => {
      if (!user || myModels.length === 0) {
        setSubscribers([]);
        return;
      }

      try {
        const modelIds = myModels.map(m => m.id);

        const { data, error } = await supabase
          .from('subscriptions')
          .select('id, buyer_id, model_id, status')
          .in('model_id', modelIds)
          .eq('status', 'active');

        if (error) throw error;

        setSubscribers(data || []);
      } catch (error: any) {
        console.error('Error fetching subscribers:', error);
      }
    };

    fetchSubscribers();
  }, [user, myModels]);

  // Fetch all categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, is_custom')
          .order('is_custom', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        setAllCategories(data || []);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Calculate stats
  const totalModels = myModels.length;
  const publishedModels = myModels.filter(m => m.status === 'published').length;

  // Get unique subscribers (count each user once even if subscribed to multiple models)
  const uniqueSubscribers = new Set(subscribers.map(sub => sub.buyer_id)).size;

  // Filter models based on category, status, and model type
  const filteredModels = myModels.filter(model => {
    const matchesCategory = categoryFilter.length === 0 || model.categories.some(cat => categoryFilter.includes(cat.id));
    const matchesStatus = statusFilter === "all" || model.status === statusFilter;

    // Model type filtering
    let matchesTypeFilter = true;
    const isOwnModel = model.publisherId === user?.id;
    // Use collaboratingModelIds state (from direct query) instead of model.collaborators
    // This bypasses RLS issues with the model.collaborators join
    const isCollaborating = collaboratingModelIds.includes(model.id);

    if (modelTypeFilter === "own") {
      matchesTypeFilter = isOwnModel;
    } else if (modelTypeFilter === "collaborating") {
      matchesTypeFilter = isCollaborating && !isOwnModel;
    }
    // "all" shows everything

    return matchesCategory && matchesStatus && matchesTypeFilter;
  });

  // Action handlers
  const handleViewDetails = (modelId: string) => {
    setLocation(`/model/${modelId}`);
  };

  const handleEditModel = (modelId: string) => {
    setLocation(`/publisher/edit-model/${modelId}`);
  };

  const handleDeleteClick = (modelId: string) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;

    try {
      const model = myModels.find(m => m.id === modelToDelete);

      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', modelToDelete);

      if (error) throw error;

      // Remove from local state
      setMyModels(prev => prev.filter(m => m.id !== modelToDelete));

      toast({
        title: "Model Deleted",
        description: `${model?.name} has been deleted successfully.`,
      });
    } catch (error: any) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error deleting model",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const handleUnpublish = async (modelId: string) => {
    try {
      const model = myModels.find(m => m.id === modelId);

      const { error } = await supabase
        .from('models')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', modelId);

      if (error) throw error;

      // Update local state
      setMyModels(prev => prev.map(m =>
        m.id === modelId ? { ...m, status: 'draft' } : m
      ));

      toast({
        title: "Model Unpublished",
        description: `${model?.name} has been unpublished and is now a draft.`,
      });
    } catch (error: any) {
      console.error('Error unpublishing model:', error);
      toast({
        title: "Error unpublishing model",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (modelId: string) => {
    try {
      const model = myModels.find(m => m.id === modelId);

      const { error } = await supabase
        .from('models')
        .update({
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) throw error;

      // Update local state
      setMyModels(prev => prev.map(m =>
        m.id === modelId ? { ...m, status: 'published' } : m
      ));

      toast({
        title: "Model Published",
        description: `${model?.name} has been published and is now live on the marketplace.`,
      });
    } catch (error: any) {
      console.error('Error publishing model:', error);
      toast({
        title: "Error publishing model",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Models</h1>
            <p className="text-muted-foreground">Manage your published algorithms and datasets.</p>
          </div>
          <Link href="/publisher/create-model">
            <Button className="gap-2 shadow-lg hover:shadow-primary/20">
              <Plus className="w-4 h-4" /> Create New Model
            </Button>
          </Link>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Models"
            value={totalModels}
            icon={Package}
            description="published + draft"
          />
          <StatsCard
            title="Published"
            value={publishedModels}
            icon={CheckCircle}
            description="live models"
          />
          <StatsCard
            title="Total Users"
            value={formatCount(uniqueSubscribers)}
            icon={Users}
            description="unique subscribers"
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search models..." className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={modelTypeFilter}
              onValueChange={(value: "all" | "own" | "collaborating") =>
                setModelTypeFilter(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All models</SelectItem>
                <SelectItem value="own">Own models</SelectItem>
                <SelectItem value="collaborating">Collaborating</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex h-9 w-full sm:w-[200px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <span className="truncate text-left">
                    {categoryFilter.length === 0
                      ? "All Categories"
                      : categoryFilter.length === 1
                      ? allCategories.find((c) => c.id === categoryFilter[0])?.name
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
                    {allCategories.map((category) => {
                      const isSelected = categoryFilter.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md cursor-pointer"
                          onClick={() => {
                            setCategoryFilter((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== category.id)
                                : [...prev, category.id]
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
                                  : prev.filter((id) => id !== category.id)
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="whitespace-nowrap">Version</TableHead>
                <TableHead className="whitespace-nowrap">Ownership</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Price</TableHead>
                <TableHead className="text-right whitespace-nowrap">Stats</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                       <div className="flex flex-col items-center gap-3">
                         <p className="text-muted-foreground">No models found.</p>
                         <Link href="/publisher/create-model">
                           <Button variant="outline" className="gap-2">
                             <Plus className="w-4 h-4" /> New Model
                           </Button>
                         </Link>
                       </div>
                    </TableCell>
                 </TableRow>
              ) : (
                filteredModels.map((model) => {
                  const isOwnModel = model.publisherId === user?.id;
                  const isCollaborating = collaboratingModelIds.includes(model.id);

                  return (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.categories.map(cat => cat.name).join(', ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{model.version}</TableCell>
                      <TableCell>
                        {isOwnModel ? (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            Own Model
                          </Badge>
                        ) : isCollaborating ? (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            Collaborating
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                         <Badge variant={model.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                           {model.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{model.price}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                         <div>{formatCount(model.stats.views)} views</div>
                         <div>{formatCount(model.stats.downloads)} downloads</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(model.id)}>
                               <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditModel(model.id)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit Model
                            </DropdownMenuItem>
                            {model.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handlePublish(model.id)}>
                                 <Send className="mr-2 h-4 w-4" /> Publish
                              </DropdownMenuItem>
                            )}
                            {model.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleUnpublish(model.id)}>
                                 <FileX className="mr-2 h-4 w-4" /> Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(model.id)}>
                               <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the model
              and remove it from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
