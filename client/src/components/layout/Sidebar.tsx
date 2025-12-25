import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  PlusCircle,
  BarChart3,
  Search,
  LogOut
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location, setLocation] = useLocation();

  // Determine role based on current route
  // Marketplace without preview param is for buyers, with preview is for publishers
  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewMode = urlParams.get('preview') === 'true';
  const isMarketplace = location.includes('/marketplace');

  const isPublisherMarketplace = isMarketplace && isPreviewMode;
  const isBuyerMarketplace = isMarketplace && !isPreviewMode;

  const role = location.startsWith('/buyer') || isBuyerMarketplace ? 'buyer' :
               location.startsWith('/publisher') || isPublisherMarketplace ? 'publisher' :
               CURRENT_USER.role;

  const handleLogout = () => {
    // Clear user role from localStorage
    localStorage.removeItem('userRole');
    setLocation("/");
  };

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
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] fixed left-0 top-16 border-r border-border bg-background px-4">
      <div className="flex-1 px-2 pt-6 overflow-y-auto">
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

      <div className="px-2 py-4 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
