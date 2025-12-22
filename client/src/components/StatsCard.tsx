import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendDirection, description }: StatsCardProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <div className="text-2xl font-bold font-heading">{value}</div>
          {(trend || description) && (
            <p className="text-xs text-muted-foreground mt-1">
              {trend && (
                <span className={trendDirection === "up" ? "text-green-600" : "text-red-600"}>
                  {trend}
                </span>
              )}
              {trend && description && " "}
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
