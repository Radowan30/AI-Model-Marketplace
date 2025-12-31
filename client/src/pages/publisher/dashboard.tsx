import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/hooks/use-auth";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Box,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
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
import { useState, useEffect } from "react";
import { fetchPublisherAnalytics } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

const COLORS = ["#981E7D", "#A8A9AD", "#00C49F", "#FFBB28"];

export default function PublisherDashboard() {
  const { user, userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) return;

      try {
        setLoadingAnalytics(true);
        const data = await fetchPublisherAnalytics(user.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [user]);

  // Fetch subscribers data
  useEffect(() => {
    const loadSubscribers = async () => {
      if (!user?.id) return;

      try {
        setLoadingSubscribers(true);

        // Get publisher's models
        const { data: models, error: modelsError } = await supabase
          .from('models')
          .select('id, model_name')
          .eq('publisher_id', user.id);

        if (modelsError) throw modelsError;

        if (!models || models.length === 0) {
          setSubscribers([]);
          return;
        }

        const modelIds = models.map(m => m.id);

        // Get subscriptions for these models with user profiles
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            model_id,
            buyer_id,
            status,
            created_at,
            cancelled_at,
            profiles!subscriptions_buyer_id_fkey (
              name,
              email
            )
          `)
          .in('model_id', modelIds)
          .order('created_at', { ascending: false });

        if (subsError) throw subsError;

        // Transform data to match expected format
        const transformedSubscribers = subscriptions?.map(sub => {
          const model = models.find(m => m.id === sub.model_id);
          return {
            id: sub.id,
            subscriber: sub.profiles?.name || 'Unknown User',
            email: sub.profiles?.email || '',
            model: model?.model_name || 'Unknown Model',
            status: sub.status === 'active' ? 'Active' : 'Cancelled',
            subscriptionDate: new Date(sub.created_at).toISOString().split('T')[0]
          };
        }) || [];

        setSubscribers(transformedSubscribers);
      } catch (error) {
        console.error('Error loading subscribers:', error);
      } finally {
        setLoadingSubscribers(false);
      }
    };

    loadSubscribers();
  }, [user]);

  // Aggregate stats (use analytics data, no fallback to mock data)
  const totalViews = analytics?.totalViews || 0;
  const totalModels = analytics?.totalModels || 0;
  const totalSubscribers = analytics?.totalSubscribers || 0;

  // Get models from analytics
  const myModels = analytics?.models || [];

  // Get unique model names for filter dropdown
  const myModelNames = myModels.map((m: any) => m.model_name);
  const subscribedModels = Array.from(
    new Set(subscribers.map((sub) => sub.model))
  );

  // Filtering logic
  const filteredSubscribers = subscribers.filter((subscriber) => {
    // Search filter (name or email)
    const matchesSearch =
      searchTerm === "" ||
      subscriber.subscriber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Model filter
    const matchesModel =
      modelFilter === "all" || subscriber.model === modelFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || subscriber.status === statusFilter;

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

  // Use analytics data for charts (no fallback to mock data)
  const viewsData = analytics?.weeklyViews || [];
  const categoryData = analytics?.categoryDistribution || [];

  return (
    <Layout type="dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Publisher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.name || 'Publisher'}. Here's how your models are
            performing.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Models"
            value={loadingAnalytics ? "..." : totalModels}
            icon={Box}
            trend="+1"
            trendDirection="up"
            description="this month"
          />
          <StatsCard
            title="Total Views"
            value={loadingAnalytics ? "..." : totalViews.toLocaleString()}
            icon={Eye}
            trend="+12%"
            trendDirection="up"
            description="vs last week"
          />
          <StatsCard
            title="Active Subscriptions"
            value={loadingAnalytics ? "..." : totalSubscribers.toString()}
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
              {loadingAnalytics ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : viewsData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No View Data Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    View trends will appear here once your models start getting views.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsData}>
                    <XAxis
                      dataKey="week"
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
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="views"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border/50">
            <CardHeader>
              <CardTitle>Models by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : categoryData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <Box className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Category distribution will appear here once you publish models.
                  </p>
                </div>
              ) : (
                <>
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
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mt-2">
                    {categoryData.map((entry, index) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Most Viewed Models Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Most Viewed Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Model Name</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Views
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Category
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myModels.map((model: any) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">
                        {model.model_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {(model.total_views || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            model.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{model.categories}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-[220px] h-8 justify-start gap-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <Calendar className="h-4 w-4" />
                    {dateRange ? (
                      <span className="truncate text-sm">
                        {new Date(dateRange.from).toLocaleDateString()} -{" "}
                        {new Date(dateRange.to).toLocaleDateString()}
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

            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Subscriber</TableHead>
                    <TableHead className="min-w-[150px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Model</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Subscription Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">
                            No subscribers found matching your filters.
                          </p>
                          {(searchTerm ||
                            modelFilter !== "all" ||
                            statusFilter !== "all" ||
                            dateRange) && (
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
                        <TableCell className="font-medium">
                          {subscriber.subscriber}
                        </TableCell>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>{subscriber.model}</TableCell>
                        <TableCell>
                          <Badge
                            variant={subscriber.status === "Active" ? "default" : "outline"}
                            className={
                              subscriber.status === "Active"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-500 hover:bg-gray-600"
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
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSubscribers.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(endIndex, filteredSubscribers.length)} of{" "}
                {filteredSubscribers.length} subscribers
                {filteredSubscribers.length !== subscribers.length && (
                  <span className="text-primary ml-1">
                    (filtered from {subscribers.length} total)
                  </span>
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
