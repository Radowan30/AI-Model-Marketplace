import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/StatsCard";
import { MOCK_MODELS, CURRENT_USER } from "@/lib/mock-data";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Box, Users, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#981E7D', '#A8A9AD', '#00C49F', '#FFBB28'];

export default function PublisherDashboard() {
  // Aggregate stats
  const myModels = MOCK_MODELS.filter(m => m.publisherId === CURRENT_USER.id);
  const totalViews = myModels.reduce((acc, curr) => acc + curr.stats.views, 0);
  const totalDownloads = myModels.reduce((acc, curr) => acc + curr.stats.downloads, 0);

  const data = [
    { name: 'Mon', views: 400 },
    { name: 'Tue', views: 300 },
    { name: 'Wed', views: 550 },
    { name: 'Thu', views: 450 },
    { name: 'Fri', views: 700 },
    { name: 'Sat', views: 200 },
    { name: 'Sun', views: 300 },
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            title="Total Downloads" 
            value={totalDownloads} 
            icon={CreditCard} 
            trend="+5%" 
            trendDirection="up"
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
              <CardTitle>Model Views Overview</CardTitle>
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

        {/* Recent Models Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top Performing Models</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.category}</TableCell>
                      <TableCell>
                        <Badge variant={model.status === 'published' ? 'default' : 'secondary'}>
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{model.stats.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{model.stats.downloads.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
