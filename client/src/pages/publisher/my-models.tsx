import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_MODELS, CURRENT_USER, MODEL_SUBSCRIBERS } from "@/lib/mock-data";
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, Package, CheckCircle, Users } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  const myModels = MOCK_MODELS.filter(m => m.publisherId === CURRENT_USER.id);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Calculate stats
  const totalModels = myModels.length;
  const publishedModels = myModels.filter(m => m.status === 'published').length;

  // Get unique subscribers (count each user once even if subscribed to multiple models)
  const myModelNames = myModels.map(m => m.name);
  const subscribersToMyModels = MODEL_SUBSCRIBERS.filter(sub =>
    myModelNames.includes(sub.model)
  );
  const uniqueSubscribers = new Set(subscribersToMyModels.map(sub => sub.email)).size;

  // Filter models based on category and status
  const filteredModels = myModels.filter(model => {
    const matchesCategory = categoryFilter === "all" || model.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || model.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  // Get unique categories from models
  const categories = Array.from(new Set(myModels.map(m => m.category)));

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

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      // In a real app, this would call an API to delete the model
      // For now, we'll just show a toast since we can't modify MOCK_MODELS
      const model = MOCK_MODELS.find(m => m.id === modelToDelete);
      toast({
        title: "Model Deleted",
        description: `${model?.name} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setModelToDelete(null);
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
            value={uniqueSubscribers}
            icon={Users}
            description="unique subscribers"
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search models..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Stats</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
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
                filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{model.version}</TableCell>
                    <TableCell>
                       <Badge variant={model.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                         {model.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{model.price}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                       <div>{model.stats.views.toLocaleString()} views</div>
                       <div>{model.stats.downloads} downloads</div>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(model.id)}>
                             <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
