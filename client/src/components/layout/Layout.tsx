import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
  type?: "public" | "dashboard";
  showSidebar?: boolean;
}

export function Layout({ children, type = "public", showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar layout={type} />
      
      <div className="flex pt-16">
        {type === "dashboard" && showSidebar && <Sidebar />}
        
        <main 
          className={`flex-1 min-h-[calc(100vh-64px)] ${
            type === "dashboard" && showSidebar ? "md:ml-64 p-6 md:p-8" : "w-full"
          }`}
        >
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}
