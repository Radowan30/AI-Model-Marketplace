import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/StatsCard";
import { MOCK_MODELS, CURRENT_USER, MODEL_SUBSCRIBERS } from "@/lib/mock-data";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Box, Users, ChevronLeft, ChevronRight, Search, Calendar, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

const COLORS = ['#981E7D', '#A8A9AD', '#00C49F', '#FFBB28'];

export default function PublisherDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Aggregate stats
  const myModels = MOCK_MODELS.filter(m => m.publisherId === CURRENT_USER.id);
  const totalViews = myModels.reduce((acc, curr) => acc + curr.stats.views, 0);

  // Get unique model names for filter dropdown
  const myModelNames = myModels.map(m => m.name);
  const subscribedModels = Array.from(new Set(MODEL_SUBSCRIBERS.map(sub => sub.model)));

  // Filtering logic
  const filteredSubscribers = MODEL_SUBSCRIBERS.filter((subscriber) => {
    // Search filter (name or email)
    const matchesSearch = searchTerm === "" ||
      subscriber.subscriber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Model filter
    const matchesModel = modelFilter === "all" || subscriber.model === modelFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter;

    // Date range filter
    let matchesDate = true;
    if (dateRange) {
      const subDate = new Date(subscriber.subscriptionDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      matchesDate = subDate >= fromDate && subDate <= toDate;
    }

    return matchesSearch && matchesModel && matchesStatus && matchesDate;
  });

  // Pagination calculations (based on filtered results)
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleApplyDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setDateRange({ from: tempStartDate, to: tempEndDate });
      setDatePickerOpen(false);
      handleFilterChange();
    }
  };

  const handleClearDateRange = () => {
    setDateRange(null);
    setTempStartDate("");
    setTempEndDate("");
    handleFilterChange();
  };

  const data = [
    { name: 'Week 1', views: 2800 },
    { name: 'Week 2', views: 3200 },
    { name: 'Week 3', views: 2900 },
    { name: 'Week 4', views: 3800 },
    { name: 'Week 5', views: 3400 },
    { name: 'Week 6', views: 4100 },
  ];

  const categoryData = [
    { name: 'Healthcare', value: 40 },
    { name: 'Smart City', value: 30 },
    { name: 'NLP', value: 20 },
    { name: 'Agriculture', value: 10 },
  ];

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Publisher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {CURRENT_USER.name}. Here's how your models are performing.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Models"
            value={myModels.length}
            icon={Box}
            trend="+1"
            trendDirection="up"
            description="this month"
          />
          <StatsCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={Eye}
            trend="+12%"
            trendDirection="up"
            description="vs last week"
          />
          <StatsCard
            title="Active Subscriptions"
            value="156"
            icon={Users}
            trend="+24"
            trendDirection="up"
            description="new subscribers"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-border/50">
            <CardHeader>
              <CardTitle>Model Views Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 border-border/50">
            <CardHeader>
              <CardTitle>Models by Category</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[300px] w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Most Viewed Models Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Most Viewed Models</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model Name</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell className="text-right">{model.stats.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={model.status === 'published' ? 'default' : 'secondary'}>
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{model.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        {/* Model Subscribers Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Model Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
             {/* Search and Filters */}
             <div className="flex flex-col md:flex-row gap-4 mb-6">
               {/* Search Bar */}
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search by name or email..."
                   className="pl-9"
                   value={searchTerm}
                   onChange={(e) => {
                     setSearchTerm(e.target.value);
                     handleFilterChange();
                   }}
                 />
               </div>

               {/* Model Filter */}
               <Select
                 value={modelFilter}
                 onValueChange={(value) => {
                   setModelFilter(value);
                   handleFilterChange();
                 }}
               >
                 <SelectTrigger className="w-full md:w-[200px]">
                   <SelectValue placeholder="All Models" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Models</SelectItem>
                   {subscribedModels.map((model) => (
                     <SelectItem key={model} value={model}>
                       {model}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>

               {/* Status Filter */}
               <Select
                 value={statusFilter}
                 onValueChange={(value) => {
                   setStatusFilter(value);
                   handleFilterChange();
                 }}
               >
                 <SelectTrigger className="w-full md:w-[150px]">
                   <SelectValue placeholder="All Status" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="Active">Active</SelectItem>
                   <SelectItem value="Pending">Pending</SelectItem>
                   <SelectItem value="Cancelled">Cancelled</SelectItem>
                 </SelectContent>
               </Select>

               {/* Date Range Filter */}
               <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                 <PopoverTrigger asChild>
                   <Button
                     variant="outline"
                     className="w-full md:w-[220px] h-10 justify-start gap-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
                   >
                     <Calendar className="h-4 w-4" />
                     {dateRange ? (
                       <span className="truncate text-sm">
                         {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                       </span>
                     ) : (
                       <span className="text-sm">Select date range</span>
                     )}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-4" align="end">
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Start Date</label>
                       <Input
                         type="date"
                         value={tempStartDate}
                         onChange={(e) => setTempStartDate(e.target.value)}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">End Date</label>
                       <Input
                         type="date"
                         value={tempEndDate}
                         onChange={(e) => setTempEndDate(e.target.value)}
                       />
                     </div>
                     <div className="flex gap-2">
                       <Button
                         size="sm"
                         onClick={handleApplyDateRange}
                         disabled={!tempStartDate || !tempEndDate}
                         className="flex-1"
                       >
                         Apply
                       </Button>
                       {dateRange && (
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={handleClearDateRange}
                           className="gap-1"
                         >
                           <X className="h-3 w-3" />
                           Clear
                         </Button>
                       )}
                     </div>
                   </div>
                 </PopoverContent>
               </Popover>
             </div>

             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">No subscribers found matching your filters.</p>
                          {(searchTerm || modelFilter !== "all" || statusFilter !== "all" || dateRange) && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setModelFilter("all");
                                setStatusFilter("all");
                                setDateRange(null);
                                setTempStartDate("");
                                setTempEndDate("");
                                handleFilterChange();
                              }}
                            >
                              Clear all filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.subscriber}</TableCell>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>{subscriber.model}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              subscriber.status === 'Active'
                                ? 'default'
                                : subscriber.status === 'Pending'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={
                              subscriber.status === 'Active'
                                ? 'bg-green-500 hover:bg-green-600'
                                : subscriber.status === 'Pending'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-gray-500 hover:bg-gray-600'
                            }
                          >
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{subscriber.subscriptionDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
             </Table>

             {/* Pagination Controls */}
             <div className="flex items-center justify-between mt-4 pt-4 border-t">
               <div className="text-sm text-muted-foreground">
                 Showing {filteredSubscribers.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
                 {filteredSubscribers.length !== MODEL_SUBSCRIBERS.length && (
                   <span className="text-primary ml-1">(filtered from {MODEL_SUBSCRIBERS.length} total)</span>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handlePreviousPage}
                   disabled={currentPage === 1}
                 >
                   <ChevronLeft className="w-4 h-4 mr-1" />
                   Previous
                 </Button>
                 <div className="text-sm text-muted-foreground">
                   Page {currentPage} of {totalPages}
                 </div>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleNextPage}
                   disabled={currentPage === totalPages}
                 >
                   Next
                   <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
