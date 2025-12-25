import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Bell, Search, LogOut, User, Laptop } from "lucide-react";
import { useState, useEffect } from "react";
import { CURRENT_USER } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  layout?: "public" | "dashboard";
}

export function Navbar({ layout = "public" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = layout === "dashboard";

  const handleLogout = () => {
    // Clear user role from localStorage
    localStorage.removeItem('userRole');
    setLocation("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isDashboard
          ? "bg-background/95 backdrop-blur-sm border-border"
          : scrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm border-border"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className={`${isDashboard ? "px-6" : "container mx-auto px-6"} h-16 flex items-center justify-between`}>
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-bold text-xl tracking-tighter">M</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-heading font-bold leading-none ${scrolled || isDashboard ? "text-foreground" : "text-foreground"}`}>
              MIMOS
            </span>
            <span className={`text-[10px] tracking-wider uppercase opacity-70 ${scrolled || isDashboard ? "text-muted-foreground" : "text-muted-foreground"}`}>
              AI Marketplace
            </span>
          </div>
        </div>

        {/* Desktop Nav - Public */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <Link href="/about">
              <a className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
            </Link>
            <Link href="/auth">
              <Button variant="default" size="sm">
                Login / Register
              </Button>
            </Link>
          </div>
        )}

        {/* Desktop Nav - Dashboard */}
        {isDashboard && (
          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search models..."
                className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/20 transition-all text-sm outline-none"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
            </Button>
            
            <div className="h-6 w-px bg-border mx-2"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20">
                  <Laptop className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{CURRENT_USER.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {CURRENT_USER.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation(`/${CURRENT_USER.role}/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b p-4 shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-2">
           {!isDashboard ? (
             <>
               <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">
                Features
               </a>
               <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                 <Button className="w-full">Login</Button>
               </Link>
             </>
           ) : (
             <>
                <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={CURRENT_USER.avatar} />
                    <AvatarFallback>{CURRENT_USER.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{CURRENT_USER.name}</p>
                    <p className="text-xs text-muted-foreground">{CURRENT_USER.email}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>Log out</Button>
             </>
           )}
        </div>
      )}
    </nav>
  );
}
