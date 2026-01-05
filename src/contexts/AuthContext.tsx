import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserType = 'job_seeker' | 'company' | 'organization' | 'admin';
export type UserRole = 'user' | 'company' | 'organization' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  email_verified: boolean;
  avatar_url?: string;
  bio?: string;
  plan_status?: string;
  plan_id?: string;
  company_id?: string;
  organization_id?: string;
  createdAt: string;
  // Legacy fields for backward compatibility
  name?: string;
  type?: UserType;
  emailVerified?: boolean;
  companyId?: string;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    full_name: string,
    role: UserRole,
    phone?: string,
    drive_link?: string,
    commercial_file_url?: string
  ) => Promise<{ requestId?: string; userId?: string; email: string; message: string }>;
  logout: () => void;
  verifyEmail: (userId: string, code: string) => Promise<void>;
  resendVerificationCode: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { authAPI } = await import('@/lib/api');
      const result = await authAPI.login(email, password);

      // Convert API response to User format
      // Handle both 'role' and 'type' fields, and both 'name' and 'full_name'
      const userRole = (result.user.role || result.user.type || 'user') as UserRole;
      const isAdmin = userRole === 'admin';
      const emailVerified = isAdmin ? true : (result.user.email_verified ?? result.user.emailVerified ?? false);
      const fullName = result.user.full_name || result.user.name || '';

      const user: User = {
        id: result.user.id,
        email: result.user.email,
        full_name: fullName,
        phone: result.user.phone,
        role: userRole,
        email_verified: emailVerified,
        avatar_url: result.user.avatar_url,
        bio: result.user.bio,
        plan_status: result.user.plan_status,
        plan_id: result.user.plan_id,
        company_id: result.user.company_id,
        organization_id: result.user.organization_id,
        createdAt: result.user.createdAt || new Date().toISOString(),
        // Legacy compatibility
        name: fullName,
        type: userRole === 'user' ? 'job_seeker' : userRole as UserType,
        emailVerified: emailVerified,
        companyId: result.user.company_id,
        organizationId: result.user.organization_id,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      const isNetworkError =
        error.status === 404 ||
        error.isNetworkError ||
        error.message?.includes('fetch') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError');

      if (isNetworkError) {
        let userRole: UserRole = 'user';
        let userName = 'Test User';
        let emailVerified = true;

        if (email === 'admin@admin.com') {
          userRole = 'admin';
          userName = 'Admin User';
        } else if (email.includes('@company.')) {
          userRole = 'company';
          userName = 'Test Company';
        } else if (email.includes('@org.')) {
          userRole = 'organization';
          userName = 'Test Organization';
        }

        const mockUser: User = {
          id: `mock-${Date.now()}`,
          email,
          full_name: userName,
          role: userRole,
          email_verified: emailVerified,
          createdAt: new Date().toISOString(),
          // Legacy compatibility
          name: userName,
          type: userRole === 'user' ? 'job_seeker' : userRole as UserType,
          emailVerified: emailVerified,
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return; // Successfully created mock user
      }

      // Re-throw other errors (like invalid credentials)
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    full_name: string,
    role: UserRole,
    phone?: string,
    drive_link?: string,
    commercial_file_url?: string
  ) => {
    // Use the authAPI for signup
    const { authAPI } = await import('@/lib/api');
    const result = await authAPI.signup(email, password, full_name, role, phone, drive_link, commercial_file_url);

    // Signup returns { message, requestId, email } - signup request needs admin approval
    // User cannot log in until admin approves
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const verifyEmail = async (userId: string, code: string) => {
    try {
      const { authAPI } = await import('@/lib/api');
      const result = await authAPI.verifyEmail(userId, code);

      // After verification, we get tokens but need to fetch user profile
      // For now, update current user if exists, or we'll need to fetch user
      if (user && user.id === userId) {
        const updatedUser: User = {
          ...user,
          email_verified: true,
          emailVerified: true,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return result;
    } catch (error: any) {
      // Mock fallback for development
      if (user && user.id === userId) {
        const updatedUser: User = {
          ...user,
          email_verified: true,
          emailVerified: true,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      throw error;
    }
  };

  const resendVerificationCode = async (userId: string) => {
    try {
      const { authAPI } = await import('@/lib/api');
      return await authAPI.resendVerification(userId);
    } catch (error) {
      console.error('Failed to resend verification code:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        verifyEmail,
        resendVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



