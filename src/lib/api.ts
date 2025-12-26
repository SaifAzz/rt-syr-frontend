// Lovable Cloud API integration
// This file contains functions to interact with the Lovable Cloud database

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface DatabaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface UserRecord extends DatabaseRecord {
  email: string;
  name: string;
  type: 'job_seeker' | 'company' | 'organization' | 'admin';
  emailVerified: boolean;
  passwordHash: string;
  companyId?: string;
  organizationId?: string;
}

export interface CompanyRecord extends DatabaseRecord {
  name: string;
  description: string;
  location: string;
  website?: string;
  logo?: string;
  verified: boolean;
  userId: string;
}

export interface OrganizationRecord extends DatabaseRecord {
  name: string;
  description: string;
  location: string;
  website?: string;
  logo?: string;
  verified: boolean;
  userId: string;
}

export interface JobRecord extends DatabaseRecord {
  title: string;
  description: string;
  companyId: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  category: string;
  status: 'open' | 'closed';
  isVerified: boolean;
}

export interface TenderRecord extends DatabaseRecord {
  title: string;
  description: string;
  organizationId?: string;
  companyId?: string;
  location: string;
  deadline: string;
  category: string;
  status: 'open' | 'closing-soon' | 'closed';
  isVerified: boolean;
}

export interface ApplicationRecord extends DatabaseRecord {
  jobId?: string;
  tenderId?: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume?: string;
}

// Generic API functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<{ user: UserRecord; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email: string, password: string, name: string, type: string) => {
    return apiRequest<{ user: UserRecord; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, type }),
    });
  },

  verifyEmail: async (userId: string, code: string) => {
    return apiRequest<{ user: UserRecord }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });
  },

  resendVerification: async (userId: string) => {
    return apiRequest<{ success: boolean }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
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

  create: async (data: Omit<CompanyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<CompanyRecord>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CompanyRecord>) => {
    return apiRequest<CompanyRecord>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  create: async (data: Omit<OrganizationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<OrganizationRecord>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<OrganizationRecord>) => {
    return apiRequest<OrganizationRecord>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async (filters?: { category?: string; location?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiRequest<JobRecord[]>(`/jobs${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<JobRecord>(`/jobs/${id}`);
  },

  create: async (data: Omit<JobRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<JobRecord>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<JobRecord>) => {
    return apiRequest<JobRecord>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tenders API
export const tendersAPI = {
  getAll: async (filters?: { category?: string; location?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiRequest<TenderRecord[]>(`/tenders${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<TenderRecord>(`/tenders/${id}`);
  },

  create: async (data: Omit<TenderRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest<TenderRecord>('/tenders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<TenderRecord>) => {
    return apiRequest<TenderRecord>(`/tenders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/tenders/${id}`, {
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



