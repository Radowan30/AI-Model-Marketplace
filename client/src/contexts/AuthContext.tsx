import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRoles: string[];
  currentRole: string | null;
  loading: boolean;
  switchRole: (newRole: 'buyer' | 'publisher') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (handles session expiration and multi-tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle session expiration and logout
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        // Session expired or user logged out - clear state and redirect to landing page
        setUser(null);
        setUserProfile(null);
        setUserRoles([]);
        setCurrentRole(null);
        localStorage.removeItem('currentRole');
        setLoading(false);

        // Only redirect if we're not already on public pages
        if (window.location.pathname !== '/' && window.location.pathname !== '/auth' && window.location.pathname !== '/auth/callback' && window.location.pathname !== '/reset-password') {
          window.location.href = '/';
        }
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserProfile(null);
        setUserRoles([]);
        setCurrentRole(null);
        localStorage.removeItem('currentRole');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        setUserProfile(profile);
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            role_name
          )
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setUserRoles([]);
        setCurrentRole(null);
        localStorage.removeItem('currentRole');

        // Redirect to auth if network error fetching roles
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      } else {
        const roleNames = roles?.map((r: any) => r.roles.role_name) || [];
        setUserRoles(roleNames);

        // Handle role deletion scenarios
        if (roleNames.length === 0) {
          // Check if this is a brand new registration or login in progress
          const isRegistering = localStorage.getItem('isRegistering');
          const isLoggingIn = localStorage.getItem('isLoggingIn');

          if (isRegistering === 'true' || isLoggingIn === 'true') {
            // Give registration/login flow time to complete (up to 10 seconds)
            const registrationStartTime = parseInt(localStorage.getItem('registrationStartTime') || '0');
            const loginStartTime = parseInt(localStorage.getItem('loginStartTime') || '0');
            const startTime = Math.max(registrationStartTime, loginStartTime);
            const elapsedTime = Date.now() - startTime;

            if (elapsedTime < 10000) {
              console.log('Registration or login in progress, skipping auto-signout');
              setLoading(false);
              return;
            } else {
              // Registration/login took too long, clean up and proceed with signout
              localStorage.removeItem('isRegistering');
              localStorage.removeItem('registrationStartTime');
              localStorage.removeItem('isLoggingIn');
              localStorage.removeItem('loginStartTime');
            }
          }

          // User has no roles - redirect to auth page for re-registration
          setCurrentRole(null);
          localStorage.removeItem('currentRole');

          // Sign out the user and redirect
          await supabase.auth.signOut();
          window.location.href = '/auth';
          return;
        }

        // Get current role from localStorage or default to first role
        const storedRole = localStorage.getItem('currentRole');

        // Check if stored role still exists in user's roles
        if (storedRole && roleNames.includes(storedRole)) {
          setCurrentRole(storedRole);
        } else {
          // Current role was deleted - switch to first available role
          const newRole = roleNames[0];
          setCurrentRole(newRole);
          localStorage.setItem('currentRole', newRole);

          // Redirect to appropriate dashboard for the new role
          const targetPath = newRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard';
          const excludedPaths = [targetPath, '/auth', '/auth/callback', '/reset-password', '/'];

          if (!excludedPaths.includes(window.location.pathname)) {
            window.location.href = targetPath;
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: 'buyer' | 'publisher') => {
    if (userRoles.includes(newRole)) {
      setCurrentRole(newRole);
      localStorage.setItem('currentRole', newRole);
      // Redirect to appropriate portal
      window.location.href = newRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userRoles,
        currentRole,
        loading,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
