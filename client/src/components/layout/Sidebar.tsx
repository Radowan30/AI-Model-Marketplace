import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  PlusCircle,
  BarChart3,
  Search
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mock-data";

export function Sidebar() {
  const [location] = useLocation();
  const role = CURRENT_USER.role;

  const publisherLinks = [
    { icon: LayoutDashboard, label: "Analytics", href: "/publisher/dashboard" },
    { icon: Search, label: "Marketplace Preview", href: "/marketplace?preview=true" },
    { icon: Package, label: "My Models", href: "/publisher/my-models" },
    { icon: Settings, label: "Settings", href: "/publisher/settings" },
  ];

  const buyerLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/buyer/dashboard" },
    { icon: Search, label: "Browse Marketplace", href: "/marketplace" },
    { icon: ShoppingBag, label: "My Purchases", href: "/buyer/my-purchases" },
    { icon: Settings, label: "Settings", href: "/buyer/settings" },
  ];

  const links = role === "publisher" ? publisherLinks : buyerLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-16 border-r border-border bg-background pt-6 pb-10 px-4">
      <div className="mb-8 px-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          {role === "publisher" ? "Publisher Portal" : "Buyer Portal"}
        </p>
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {link.label}
                </a>
              </Link>
            );
          })}
        </div>
      </div>

      {role === "publisher" && (
        <div className="mt-auto px-2">
           <Link href="/publisher/create-model">
            <a className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-md text-sm font-medium transition-colors shadow-md hover:shadow-lg">
              <PlusCircle className="w-4 h-4" />
              <span>Create Model</span>
            </a>
           </Link>
        </div>
      )}
    </aside>
  );
}
