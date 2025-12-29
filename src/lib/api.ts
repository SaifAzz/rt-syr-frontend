// Lovable Cloud API integration
// This file contains functions to interact with the Lovable Cloud database

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface DatabaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types - matching API_DOCUMENTATION.md
export interface UserRecord extends DatabaseRecord {
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'company' | 'organization' | 'admin';
  email_verified: boolean;
  avatar_url?: string;
  bio?: string;
  plan_status?: string;
  plan_id?: string;
  company_id?: string;
  organization_id?: string;
}

export interface CompanyRecord extends DatabaseRecord {
  name: string;
  description: string;
  location: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

export interface OrganizationRecord extends DatabaseRecord {
  name: string;
  description: string;
  location: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  license_number?: string;
  license_file_url?: string;
  work_sectors?: string[];
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

export interface JobRecord extends DatabaseRecord {
  title: string;
  description: string;
  requirements?: string;
  company_id: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
  category: string;
  status: 'open' | 'closed';
  created_at: string;
}

export interface TenderRecord extends DatabaseRecord {
  title: string;
  description: string;
  requirements?: string;
  organization_id?: string;
  company_id?: string;
  location: string;
  deadline: string;
  category: string;
  status: 'open' | 'closing-soon' | 'closed';
  created_at: string;
}

export interface ApplicationRecord extends DatabaseRecord {
  job_id?: string;
  tender_id?: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  resume_url?: string;
  created_at: string;
}

// Generic API functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get JWT token from localStorage
  const userStr = localStorage.getItem('user');
  let token: string | null = null;
  
  // Try to get token from user object or separate token storage
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token || user.access_token;
    } catch {
      // Ignore parse errors
    }
  }
  
  // Also check for token in localStorage directly
  if (!token) {
    token = localStorage.getItem('access_token');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401/403 for authentication errors
    if (response.status === 401 || response.status === 403) {
      const error = new Error('Unauthorized');
      (error as any).status = response.status;
      (error as any).isAuthError = true;
      throw error;
    }

    // Handle 404 specifically for development
    if (response.status === 404) {
      const error = new Error('API endpoint not found. Using development fallback.');
      (error as any).status = 404;
      (error as any).isNetworkError = true;
      throw error;
    }
    
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const apiError = new Error(error.message || 'Request failed');
    (apiError as any).status = response.status;
    throw apiError;
  }

  return response.json();
}

// Auth API - matching API_DOCUMENTATION.md
export const authAPI = {
  login: async (email: string, password: string) => {
    const result = await apiRequest<{ 
      access_token: string; 
      refresh_token: string; 
      user: UserRecord 
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store tokens
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      if (result.refresh_token) {
        localStorage.setItem('refresh_token', result.refresh_token);
      }
    }
    
    return result;
  },

  signup: async (email: string, password: string, full_name: string, phone: string, role: string) => {
    const result = await apiRequest<{ 
      message: string; 
      userId: string; 
      email: string 
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, phone, role }),
    });
    
    return result;
  },

  verifyEmail: async (userId: string, code: string) => {
    const result = await apiRequest<{ 
      message: string; 
      access_token: string; 
      refresh_token: string 
    }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });
    
    // Store tokens
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      if (result.refresh_token) {
        localStorage.setItem('refresh_token', result.refresh_token);
      }
    }
    
    return result;
  },

  resendVerification: async (userId: string) => {
    return apiRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  refresh: async (refresh_token: string) => {
    const result = await apiRequest<{ 
      access_token: string; 
      refresh_token: string 
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
    
    // Store new tokens
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      if (result.refresh_token) {
        localStorage.setItem('refresh_token', result.refresh_token);
      }
    }
    
    return result;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return apiRequest<UserRecord[]>('/users');
  },

  getById: async (id: string) => {
    return apiRequest<UserRecord>(`/users/${id}`);
  },

  update: async (id: string, data: Partial<UserRecord>) => {
    return apiRequest<UserRecord>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Companies API
export const companiesAPI = {
  getAll: async () => {
    return apiRequest<CompanyRecord[]>('/companies');
  },

  getById: async (id: string) => {
    return apiRequest<CompanyRecord>(`/companies/${id}`);
  },

  getMy: async () => {
    return apiRequest<CompanyRecord[]>('/companies/my');
  },

  create: async (data: Omit<CompanyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<CompanyRecord>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CompanyRecord>) => {
    return apiRequest<CompanyRecord>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/companies/${id}`, {
      method: 'DELETE',
    });
  },

  getQuota: async (id: string) => {
    return apiRequest<{
      company_id: string;
      plan_id: string;
      plan_name: string;
      job_quota: { used: number; limit: number; unlimited: boolean };
      tender_quota: { used: number; limit: number; unlimited: boolean };
    }>(`/companies/${id}/quota`);
  },
};

// Organizations API
export const organizationsAPI = {
  getAll: async () => {
    return apiRequest<OrganizationRecord[]>('/organizations');
  },

  getById: async (id: string) => {
    return apiRequest<OrganizationRecord>(`/organizations/${id}`);
  },

  getMy: async () => {
    return apiRequest<OrganizationRecord[]>('/organizations/my');
  },

  create: async (data: Omit<OrganizationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<OrganizationRecord>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<OrganizationRecord>) => {
    return apiRequest<OrganizationRecord>(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },

  getQuota: async (id: string) => {
    return apiRequest<{
      organization_id: string;
      plan_id: string;
      plan_name: string;
      job_quota: { used: number; limit: number; unlimited: boolean };
      tender_quota: { used: number; limit: number; unlimited: boolean };
    }>(`/organizations/${id}/quota`);
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async (filters?: { category?: string; location?: string; status?: string; page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return apiRequest<{ data: JobRecord[]; total: number; page: number; limit: number } | JobRecord[]>(`/jobs${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<JobRecord>(`/jobs/${id}`);
  },

  getByCompany: async (companyId: string) => {
    return apiRequest<JobRecord[]>(`/jobs/company/${companyId}`);
  },

  create: async (data: Omit<JobRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<JobRecord>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<JobRecord>) => {
    return apiRequest<JobRecord>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tenders API
export const tendersAPI = {
  getAll: async (filters?: { category?: string; location?: string; status?: string; page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return apiRequest<{ data: TenderRecord[]; total: number; page: number; limit: number } | TenderRecord[]>(`/tenders${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<TenderRecord>(`/tenders/${id}`);
  },

  getByOrganization: async (organizationId: string) => {
    return apiRequest<TenderRecord[]>(`/tenders/organization/${organizationId}`);
  },

  create: async (data: Omit<TenderRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<TenderRecord>('/tenders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<TenderRecord>) => {
    return apiRequest<TenderRecord>(`/tenders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/tenders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async (filters?: { userId?: string; jobId?: string; tenderId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.tenderId) params.append('tenderId', filters.tenderId);
    
    const query = params.toString();
    return apiRequest<ApplicationRecord[]>(`/applications${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<ApplicationRecord>(`/applications/${id}`);
  },

  create: async (data: Omit<ApplicationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<ApplicationRecord>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<ApplicationRecord>) => {
    return apiRequest<ApplicationRecord>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  },
};

// Content Management API
export interface ContentRecord extends DatabaseRecord {
  key: string;
  section: string; // 'home', 'footer', 'form', 'general'
  language: string; // 'en', 'ar'
  value: string | object;
  type: 'text' | 'html' | 'json';
}

export interface FooterContent {
  description: string;
  contactEmail: string;
  contactLocation: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  platformLinks: Array<{ name: string; href: string }>;
  supportLinks: Array<{ name: string; href: string }>;
  copyright: string;
  hashtags: {
    jobs: string;
    tenders: string;
  };
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'number' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    accept?: string; // For file fields, e.g., "image/*", ".pdf"
  };
  order: number;
  visible: boolean;
}

export interface FormConfig {
  formType: 'registration' | 'job' | 'tender';
  fields: FormField[];
  submitButtonText: string;
  title: string;
  description: string;
}

export const contentAPI = {
  getAll: async (filters?: { section?: string; language?: string }) => {
    const params = new URLSearchParams();
    if (filters?.section) params.append('section', filters.section);
    if (filters?.language) params.append('language', filters.language);
    
    const query = params.toString();
    return apiRequest<ContentRecord[]>(`/content${query ? `?${query}` : ''}`);
  },

  getByKey: async (key: string, language: string = 'en') => {
    return apiRequest<ContentRecord>(`/content/${key}?language=${language}`);
  },

  create: async (data: Omit<ContentRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<ContentRecord>('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (key: string, language: string, data: Partial<ContentRecord>) => {
    return apiRequest<ContentRecord>(`/content/${key}?language=${language}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (key: string, language: string) => {
    return apiRequest<{ success: boolean }>(`/content/${key}?language=${language}`, {
      method: 'DELETE',
    });
  },

  // Footer specific
  getFooter: async (language: string = 'en') => {
    return apiRequest<FooterContent>(`/content/footer?language=${language}`);
  },

  updateFooter: async (language: string, data: FooterContent) => {
    return apiRequest<FooterContent>(`/content/footer?language=${language}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Form configuration
  getFormConfig: async (formType: string, language: string = 'en') => {
    return apiRequest<FormConfig>(`/content/form/${formType}?language=${language}`);
  },

  updateFormConfig: async (formType: string, language: string, data: FormConfig) => {
    return apiRequest<FormConfig>(`/content/form/${formType}?language=${language}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Admin API
export const adminAPI = {
  approve: async (entityType: 'company' | 'organization', entityId: string, approved: boolean) => {
    return apiRequest<{
      message: string;
      entity: {
        id: string;
        type: string;
        status: string;
      };
    }>('/admin/approve', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, approved }),
    });
  },

  getPending: async () => {
    return apiRequest<{
      companies: Array<{
        id: string;
        name: string;
        status: string;
        created_at: string;
      }>;
      organizations: Array<{
        id: string;
        name: string;
        status: string;
        created_at: string;
      }>;
    }>('/admin/pending');
  },

  getAnalytics: async () => {
    return apiRequest<{
      users: { total: number; verified: number; new_this_month: number };
      jobs: { total: number; active: number; closed: number };
      tenders: { total: number; active: number; closed: number };
      companies: { total: number; approved: number; pending: number };
      organizations: { total: number; approved: number; pending: number };
    }>('/admin/analytics');
  },
};



