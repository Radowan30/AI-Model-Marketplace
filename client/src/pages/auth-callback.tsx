import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the role from localStorage first (set before OAuth redirect)
        // Fall back to URL parameter if localStorage is not set
        const storedRole = localStorage.getItem('currentRole') as 'buyer' | 'publisher' | null;
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as 'buyer' | 'publisher' | null;

        // Prefer localStorage over URL (more secure, can't be manipulated)
        const selectedRole = storedRole || urlRole;

        if (!selectedRole || (selectedRole !== 'buyer' && selectedRole !== 'publisher')) {
          throw new Error('Invalid or missing role parameter');
        }

        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) throw new Error('No session found');

        const user = session.user;

        // Step 1: Check if user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        // Step 2: Create user record if doesn't exist
        if (!existingUser) {
          const { error: insertUserError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
              email: user.email
            });

          if (insertUserError) throw insertUserError;
        }

        // Step 3: Get role ID
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('role_name', selectedRole)
          .single();

        if (roleError || !role) throw new Error('Role not found');

        // Step 4: Check if user already has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role_id', role.id)
          .single();

        // Step 5: Add role if doesn't exist
        if (!existingRole) {
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role_id: role.id
            });

          if (insertRoleError) throw insertRoleError;

          toast({
            title: "Account created!",
            description: `Welcome to MIMOS AI Marketplace as a ${selectedRole}.`,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: `Logged in as ${selectedRole}.`,
          });
        }

        // Step 6: Store current role in localStorage for routing
        localStorage.setItem('currentRole', selectedRole);

        // Step 7: Redirect to appropriate dashboard
        setLocation(selectedRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        localStorage.removeItem('currentRole'); // Clean up on error
        setError(error.message || 'An error occurred during authentication');
        toast({
          title: 'Authentication failed',
          description: error.message || 'An error occurred during authentication',
          variant: 'destructive',
        });

        // Redirect back to auth page after 3 seconds
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
