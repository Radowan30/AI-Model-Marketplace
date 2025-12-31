import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import generatedImage from '@assets/generated_images/mimos_ai_marketplace_hero_background.png';
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  // Read query parameters to determine initial mode and tab
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const tab = urlParams.get('tab');

  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(mode === 'register');
  const [activeTab, setActiveTab] = useState<string>(tab === 'publisher' ? 'publisher' : 'buyer');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const handleRegister = async (e: React.FormEvent, selectedRole: 'buyer' | 'publisher') => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get(selectedRole === 'buyer' ? 'name' : 'pub-name') as string;
    const email = formData.get(selectedRole === 'buyer' ? 'email' : 'pub-email') as string;
    const password = formData.get(selectedRole === 'buyer' ? 'password' : 'pub-password') as string;
    const confirmPassword = formData.get(selectedRole === 'buyer' ? 'confirm-password' : 'pub-confirm-password') as string;

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

    try {
      // Step 1: Set registration flag to prevent AuthContext from auto-signing out during registration
      localStorage.setItem('isRegistering', 'true');
      localStorage.setItem('registrationStartTime', Date.now().toString());

      // Step 2: Verify that the role exists in the database BEFORE any user operations
      // This prevents creating orphaned users if roles table is not set up
      const { data: roleCheck, error: roleCheckError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', selectedRole)
        .single();

      if (roleCheckError || !roleCheck) {
        localStorage.removeItem('isRegistering');
        localStorage.removeItem('registrationStartTime');
        toast({
          title: "System Configuration Error",
          description: `The ${selectedRole} role is not configured in the database. Please contact support.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 3: Store current role in localStorage BEFORE sign in attempt
      // This ensures AuthContext reads the correct role when onAuthStateChange fires
      localStorage.setItem('currentRole', selectedRole);

      // Step 3: First check if user already exists by trying to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInData?.user) {
        // User exists - check if they already have this role (reuse roleCheck from above)
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', signInData.user.id)
          .eq('role_id', roleCheck.id)
          .single();

        if (existingRole) {
          // User already has this role - reject registration
          localStorage.removeItem('currentRole');
          localStorage.removeItem('isRegistering');
          localStorage.removeItem('registrationStartTime');
          await supabase.auth.signOut();
          setLoading(false);
          toast({
            title: "Account already exists",
            description: `You already have a ${selectedRole} account. Please use the login form instead.`,
            variant: "destructive",
          });
          return;
        }

        // User exists but doesn't have this role - add it using atomic function
        console.log('Existing user adding new role using atomic function');

        const { data: result, error: rpcError } = await supabase.rpc('create_user_with_role', {
          p_user_id: signInData.user.id,
          p_name: signInData.user.user_metadata?.full_name || signInData.user.email?.split('@')[0] || 'User',
          p_email: signInData.user.email || '',
          p_role_name: selectedRole
        });

        console.log('RPC result for existing user:', result);

        if (rpcError) {
          console.error('RPC error for existing user:', rpcError);
          localStorage.removeItem('currentRole');
          throw rpcError;
        }

        if (result && !result.success) {
          console.error('Function returned error for existing user:', result);
          localStorage.removeItem('currentRole');
          throw new Error(result.error || 'Failed to add role to existing user');
        }

        // Role added successfully - localStorage already set, just redirect
        localStorage.removeItem('isRegistering');
        localStorage.removeItem('registrationStartTime');

        setLoading(false);
        toast({
          title: "Role added!",
          description: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} access has been added to your account.`,
        });
        setLocation(selectedRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
        return;
      }

      // Step 4: User doesn't exist in auth - proceed with sign up
      // localStorage already set at the beginning of try block
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        localStorage.removeItem('currentRole');
        throw error;
      }

      if (data.user) {
        // Step 5: Use atomic function to create user and assign role
        // This prevents foreign key constraint violations due to transaction timing
        console.log('Creating user with role using atomic function');

        const { data: result, error: rpcError } = await supabase.rpc('create_user_with_role', {
          p_user_id: data.user.id,
          p_name: name,
          p_email: email,
          p_role_name: selectedRole
        });

        console.log('RPC result:', result);

        if (rpcError) {
          console.error('RPC error:', rpcError);
          localStorage.removeItem('currentRole');
          throw rpcError;
        }

        // Check if the function returned an error
        if (result && !result.success) {
          console.error('Function returned error:', result);
          localStorage.removeItem('currentRole');
          throw new Error(result.error || 'Failed to create user with role');
        }

        console.log('User and role created successfully:', result);

        // Clear registration flags on success
        localStorage.removeItem('isRegistering');
        localStorage.removeItem('registrationStartTime');

        toast({
          title: "Account created!",
          description: "Welcome to MIMOS AI Marketplace.",
        });

        setLoading(false);
        setLocation(selectedRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      localStorage.removeItem('currentRole'); // Clean up on any error
      localStorage.removeItem('isRegistering'); // Clean up registration flags
      localStorage.removeItem('registrationStartTime');
      console.error('Registration error:', error);

      // Show detailed error information
      const errorMessage = error.message || "An error occurred during registration.";
      const errorDetails = error.details ? ` Details: ${error.details}` : '';
      const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
      const errorCode = error.code ? ` Code: ${error.code}` : '';

      // Alert to prevent page reload and see the full error
      alert(`Registration failed!\n\nError: ${errorMessage}\n${errorDetails}${errorHint}${errorCode}\n\nCheck console for more details.`);

      toast({
        title: "Registration failed",
        description: `${errorMessage}${errorDetails}${errorHint}`,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent, selectedRole: 'buyer' | 'publisher') => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get(selectedRole === 'buyer' ? 'email' : 'pub-email') as string;
    const password = formData.get(selectedRole === 'buyer' ? 'password' : 'pub-password') as string;

    try {
      // Step 1: Set login flag to prevent race conditions with ProtectedRoute
      localStorage.setItem('isLoggingIn', 'true');
      localStorage.setItem('loginStartTime', Date.now().toString());

      // Step 2: Store current role in localStorage BEFORE sign in
      // This ensures AuthContext reads the correct role when onAuthStateChange fires
      localStorage.setItem('currentRole', selectedRole);

      // Step 2: Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Clear localStorage if sign in fails
        localStorage.removeItem('currentRole');
        throw error;
      }

      // Step 3: Get role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', selectedRole)
        .single();

      if (roleError || !role) {
        localStorage.removeItem('currentRole');
        throw new Error('Role not found');
      }

      // Step 4: Check if user has the selected role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('role_id', role.id)
        .single();

      if (!userRole) {
        // User doesn't have this role - clean up and sign out
        localStorage.removeItem('currentRole');
        localStorage.removeItem('isLoggingIn');
        localStorage.removeItem('loginStartTime');
        await supabase.auth.signOut();
        setLoading(false);
        toast({
          title: "Access denied",
          description: `No ${selectedRole} account found for this email. Please check your account type or register.`,
          variant: "destructive",
        });
        return;
      }

      // Clear login flags on success
      localStorage.removeItem('isLoggingIn');
      localStorage.removeItem('loginStartTime');

      setLoading(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      setLocation(selectedRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
    } catch (error: any) {
      setLoading(false);
      localStorage.removeItem('currentRole'); // Clean up on any error
      localStorage.removeItem('isLoggingIn'); // Clean up login flags
      localStorage.removeItem('loginStartTime');
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async (selectedRole: 'buyer' | 'publisher') => {
    try {
      // Store role in localStorage BEFORE OAuth redirect
      // This ensures when user returns from Google, the role is already set
      localStorage.setItem('currentRole', selectedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        localStorage.removeItem('currentRole');
        throw error;
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        title: 'Authentication failed',
        description: 'Unable to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset email sent!",
        description: "Check your email for the password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <Input id="email" name="email" type="email" placeholder="name@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {!isRegistering && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <Input id="password" name="password" type="password" required />
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
                    <Input id="pub-email" name="pub-email" type="email" placeholder="name@mimos.my" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pub-password">Password</Label>
                      {!isRegistering && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <Input id="pub-password" name="pub-password" type="password" required />
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

            <Button variant="outline" className="w-full" type="button" onClick={() => handleGoogleLogin(activeTab as 'buyer' | 'publisher')}>
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
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForgotPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleForgotPassword} disabled={sendingReset}>
              {sendingReset ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
