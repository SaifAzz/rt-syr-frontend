import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  allowedUserTypes?: Array<'job_seeker' | 'company' | 'organization' | 'admin'>;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireEmailVerification = false,
  allowedUserTypes,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.type)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};



