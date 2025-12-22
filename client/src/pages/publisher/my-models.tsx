import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MyModelsPage() {
  const myModels = MOCK_MODELS.filter(m => m.publisherId === CURRENT_USER.id);

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

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter models..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Sort</Button>
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
              {myModels.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                       No models found. Create your first one!
                    </TableCell>
                 </TableRow>
              ) : (
                myModels.map((model) => (
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
                          <DropdownMenuItem>
                             <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                             <Edit className="mr-2 h-4 w-4" /> Edit Model
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
    </Layout>
  );
}
