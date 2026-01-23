import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          // No session found, redirect to auth page
          // AuthContext will clear flags
          window.location.href = '/auth';
          return;
        }

        // Get role from URL params or localStorage
        // Role is always set before OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        const roleFromUrl = urlParams.get('role') as 'buyer' | 'publisher' | null;
        const roleFromStorage = localStorage.getItem('currentRole') as 'buyer' | 'publisher' | null;
        const selectedRole = roleFromUrl || roleFromStorage || 'buyer'; // Default to buyer if somehow not set

        // Store the role in localStorage
        localStorage.setItem('currentRole', selectedRole);

        // Get the role ID from the database
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('role_name', selectedRole)
          .single();

        if (roleError || !role) {
          // AuthContext will clear flags
          toast({
            title: "Role configuration error",
            description: "Please contact support.",
            variant: "destructive",
          });
          window.location.href = '/auth';
          return;
        }

        // Check if user already has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('role_id', role.id)
          .single();

        if (!existingRole) {
          // User doesn't have this role, add it using atomic function
          console.log('Adding role for OAuth user');

          const { data: result, error: rpcError } = await supabase.rpc('create_user_with_role', {
            p_user_id: session.user.id,
            p_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            p_email: session.user.email || '',
            p_role_name: selectedRole
          });

          if (rpcError) {
            console.error('Error adding role for OAuth user:', rpcError);
            throw rpcError;
          }

          if (result && !result.success) {
            console.error('Function returned error for OAuth user:', result);
            throw new Error(result.error || 'Failed to add role');
          }

          toast({
            title: "Welcome!",
            description: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} access has been set up for your account.`,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in with Google.",
          });
        }

        // Redirect to appropriate dashboard
        // Use window.location.href for immediate navigation, preventing race conditions
        // with AuthContext's onAuthStateChange handler
        // DON'T clear isRegistering here - let AuthContext clear it after roles are fetched
        const targetPath = selectedRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard';
        window.location.href = targetPath;

      } catch (error: any) {
        console.error('OAuth callback error:', error);

        // AuthContext will clear flags
        toast({
          title: "Authentication failed",
          description: error.message || "Unable to complete sign in. Please try again.",
          variant: "destructive",
        });
        window.location.href = '/auth';
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary [stroke-width:1.5]" />
        <h2 className="text-xl font-semibold">Setting up your account...</h2>
        <p className="text-muted-foreground text-sm">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
