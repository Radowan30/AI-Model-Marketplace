import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import generatedImage from '@assets/generated_images/mimos_ai_marketplace_hero_background.png';
import { USERS } from "@/lib/mock-data";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent, role: 'buyer' | 'publisher') => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get(role === 'buyer' ? 'name' : 'pub-name') as string;
    const email = formData.get(role === 'buyer' ? 'email' : 'pub-email') as string;
    const password = formData.get(role === 'buyer' ? 'password' : 'pub-password') as string;
    const confirmPassword = formData.get(role === 'buyer' ? 'confirm-password' : 'pub-confirm-password') as string;

    // Validate password match
    if (password !== confirmPassword) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      // Check if user with this email already exists
      const existingUser = USERS.find(u => u.email === email);

      if (existingUser) {
        // Check if user already has this role
        if (existingUser.roles.includes(role)) {
          setLoading(false);
          toast({
            title: "Error",
            description: `An account with this email already exists as ${role}.`,
            variant: "destructive",
          });
          return;
        }

        // Add new role to existing user
        existingUser.roles.push(role);
        localStorage.setItem('userId', existingUser.id);
        localStorage.setItem('userRole', role);

        toast({
          title: "Role added successfully!",
          description: `${role.charAt(0).toUpperCase() + role.slice(1)} role has been added to your account.`,
        });
      } else {
        // Create new user
        const newUser = {
          id: String(USERS.length + 1),
          email,
          name,
          password,
          roles: [role] as ('buyer' | 'publisher')[]
        };
        USERS.push(newUser);

        localStorage.setItem('userId', newUser.id);
        localStorage.setItem('userRole', role);

        toast({
          title: "Account created!",
          description: "Welcome to MIMOS AI Marketplace.",
        });
      }

      setLoading(false);
      setLocation(role === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent, role: 'buyer' | 'publisher') => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get(role === 'buyer' ? 'email' : 'pub-email') as string;
    const password = formData.get(role === 'buyer' ? 'password' : 'pub-password') as string;

    // Simulate API delay
    setTimeout(() => {
      // Find user by email
      const user = USERS.find(u => u.email === email);

      if (!user) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return;
      }

      // Validate password
      if (user.password !== password) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return;
      }

      // Check if user has the selected role
      if (!user.roles.includes(role)) {
        setLoading(false);
        toast({
          title: "Error",
          description: `You don't have ${role} access. Please check your account role or register as ${role}.`,
          variant: "destructive",
        });
        return;
      }

      // Store userId and userRole in localStorage
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', role);

      setLoading(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      setLocation(role === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
    }, 1000);
  };

  return (
    <Layout type="public">
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-secondary/20 relative">
         <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <img 
            src={generatedImage}
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        <Card className="w-full max-w-md shadow-xl border-border/50 relative z-10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md mb-2">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <CardTitle className="text-2xl font-heading">
              {isRegistering ? "Create Account" : "Welcome to MIMOS"}
            </CardTitle>
            <CardDescription>
              {isRegistering
                ? "Register to start managing AI models or subscribe to services"
                : "Login to manage models or subscribe to AI services"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buyer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buyer">Buyer Portal</TabsTrigger>
                <TabsTrigger value="publisher">Publisher Portal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="buyer">
                <form onSubmit={(e) => isRegistering ? handleRegister(e, 'buyer') : handleLogin(e, 'buyer')} className="space-y-4">
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" type="text" placeholder="John Doe" required />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@company.com" required defaultValue={isRegistering ? "" : "buyer@example.com"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required defaultValue={isRegistering ? "" : "password"} />
                  </div>
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" name="confirm-password" type="password" required />
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading
                      ? (isRegistering ? "Creating account..." : "Logging in...")
                      : (isRegistering ? "Create Buyer Account" : "Login as Buyer")
                    }
                  </Button>
                  <div className="text-center mt-4 text-sm">
                    <span className="text-muted-foreground">
                      {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-primary hover:underline font-medium"
                    >
                      {isRegistering ? "Login" : "Sign Up"}
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="publisher">
                <form onSubmit={(e) => isRegistering ? handleRegister(e, 'publisher') : handleLogin(e, 'publisher')} className="space-y-4">
                   <div className="bg-primary/5 p-4 rounded-md border border-primary/20 mb-4">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Check className="w-4 h-4" /> Publisher Access
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRegistering
                          ? "Register to publish AI models, view analytics, and respond to buyer inquiries."
                          : "Log in to manage your deployed models, view analytics, and respond to buyer inquiries."
                        }
                      </p>
                   </div>
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="pub-name">Full Name</Label>
                      <Input id="pub-name" name="pub-name" type="text" placeholder="Dr. Aminah Hassan" required />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="pub-email">Institutional Email</Label>
                    <Input id="pub-email" name="pub-email" type="email" placeholder="name@mimos.my" required defaultValue={isRegistering ? "" : "aminah@mimos.my"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pub-password">Password</Label>
                    <Input id="pub-password" name="pub-password" type="password" required defaultValue={isRegistering ? "" : "password"} />
                  </div>
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="pub-confirm-password">Confirm Password</Label>
                      <Input id="pub-confirm-password" name="pub-confirm-password" type="password" required />
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading
                      ? (isRegistering ? "Creating account..." : "Logging in...")
                      : (isRegistering ? "Create Publisher Account" : "Login as Publisher")
                    }
                  </Button>
                  <div className="text-center mt-4 text-sm">
                    <span className="text-muted-foreground">
                      {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-primary hover:underline font-medium"
                    >
                      {isRegistering ? "Login" : "Sign Up"}
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
             <a href="#" className="hover:text-primary underline">Forgot password?</a>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
