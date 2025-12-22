import { Model } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Activity, Clock, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

interface ModelCardProps {
  model: Model;
  mode?: "preview" | "action";
  subscribed?: boolean;
}

export function ModelCard({ model, mode = "action", subscribed = false }: ModelCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="h-2 bg-gradient-to-r from-primary to-purple-400 group-hover:h-3 transition-all duration-300" />
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-normal text-muted-foreground border-primary/20 bg-primary/5">
              {model.category}
            </Badge>
            <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {model.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">by {model.publisherName}</p>
          </div>
          <Badge variant={model.price === "free" ? "secondary" : "default"} className="uppercase text-[10px] tracking-wide">
            {model.price}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {model.description}
        </p>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>{model.stats.accuracy}% Acc</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{model.stats.responseTime}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span>{(model.stats.views / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Download className="w-3.5 h-3.5" />
            <span>{model.stats.downloads}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/model/${model.id}`}>
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant={subscribed ? "secondary" : "outline"}>
            {mode === "preview" 
              ? "View Details" 
              : subscribed 
                ? "Access Model" 
                : "View Details & Subscribe"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
