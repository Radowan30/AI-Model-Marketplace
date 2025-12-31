import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('buyer' | 'publisher')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRoles, loading } = useAuth();

  // Check if registration or login is in progress
  const isRegistering = typeof window !== 'undefined' && localStorage.getItem('isRegistering') === 'true';
  const isLoggingIn = typeof window !== 'undefined' && localStorage.getItem('isLoggingIn') === 'true';

  // Show loading state while checking authentication, during registration, or during login
  if (loading || isRegistering || isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRegistering ? 'Setting up your account...' : isLoggingIn ? 'Logging you in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Check if user has at least one of the allowed roles
  if (allowedRoles && !userRoles.some(role => allowedRoles.includes(role as 'buyer' | 'publisher'))) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
