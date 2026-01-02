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
    // Redirect to admin login if trying to access admin routes
    if (allowedUserTypes?.includes('admin')) {
      return <Navigate to="/admin/dashboard/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins don't need email verification
  if (requireEmailVerification && user && !user.emailVerified && user.role !== 'admin' && user.type !== 'admin') {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedUserTypes && user) {
    // Check both type and role for admin access
    const userType = user.type || (user.role === 'admin' ? 'admin' : user.role === 'user' ? 'job_seeker' : user.role);
    if (!allowedUserTypes.includes(userType as any)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};



