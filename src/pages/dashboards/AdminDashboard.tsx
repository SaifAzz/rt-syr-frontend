import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Globe,
  Layout,
  FormInput,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Mail,
  Shield,
  BarChart3,
  Eye,
  MoreVertical,
  LayoutDashboard,
  FolderTree,
} from 'lucide-react';
import {
  usersAPI,
  companiesAPI,
  organizationsAPI,
  jobsAPI,
  tendersAPI,
  applicationsAPI,
  type UserRecord,
  type CompanyRecord,
  type OrganizationRecord,
  type JobRecord,
  type TenderRecord,
  type ApplicationRecord,
} from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { FooterManagement } from '@/components/admin/FooterManagement';
import { FormManagement } from '@/components/admin/FormManagement';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingEntity, setEditingEntity] = useState<{
    type: string;
    id: string;
    data: any;
  } | null>(null);

  // Menu items organized by category
  const menuItems = [
    {
      category: 'Dashboard',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Content Management',
      items: [
        { id: 'content', label: 'Content', icon: Globe },
        { id: 'footer', label: 'Footer', icon: Layout },
        { id: 'forms', label: 'Forms', icon: FormInput },
      ],
    },
    {
      category: 'Users & Organizations',
      items: [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'organizations', label: 'Organizations', icon: FolderTree },
      ],
    },
    {
      category: 'Jobs & Tenders',
      items: [
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'tenders', label: 'Tenders', icon: FileText },
        { id: 'applications', label: 'Applications', icon: Mail },
      ],
    },
  ];

  // Fetch all data
  const { data: users = [], isLoading: usersLoading } = useQuery<UserRecord[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        return await usersAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery<CompanyRecord[]>({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      try {
        return await companiesAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  const { data: organizations = [], isLoading: orgsLoading } = useQuery<OrganizationRecord[]>({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      try {
        return await organizationsAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobRecord[]>({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      try {
        return await jobsAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  const { data: tenders = [], isLoading: tendersLoading } = useQuery<TenderRecord[]>({
    queryKey: ['admin-tenders'],
    queryFn: async () => {
      try {
        return await tendersAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  const { data: applications = [], isLoading: appsLoading } = useQuery<ApplicationRecord[]>({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      try {
        return await applicationsAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  // Delete mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      // Note: Delete endpoint might not exist, adjust based on API
      return await fetch(`/api/users/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return await jobsAPI.delete(id);
    },
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: () => {
      toast.error('Failed to delete job');
    },
  });

  const deleteTenderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await tendersAPI.delete(id);
    },
    onSuccess: () => {
      toast.success('Tender deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tenders'] });
    },
    onError: () => {
      toast.error('Failed to delete tender');
    },
  });

  // Update mutations
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobRecord> }) => {
      return await jobsAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      setEditingEntity(null);
    },
    onError: () => {
      toast.error('Failed to update job');
    },
  });

  const updateTenderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TenderRecord> }) => {
      return await tendersAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success('Tender updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tenders'] });
      setEditingEntity(null);
    },
    onError: () => {
      toast.error('Failed to update tender');
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyRecord> }) => {
      return await companiesAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success('Company updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setEditingEntity(null);
    },
    onError: () => {
      toast.error('Failed to update company');
    },
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrganizationRecord> }) => {
      return await organizationsAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success('Organization updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setEditingEntity(null);
    },
    onError: () => {
      toast.error('Failed to update organization');
    },
  });

  const stats = {
    totalUsers: users.length,
    totalCompanies: companies.length,
    totalOrganizations: organizations.length,
    totalJobs: jobs.length,
    totalTenders: tenders.length,
    totalApplications: applications.length,
    activeJobs: jobs.filter((j) => j.status === 'open').length,
    openTenders: tenders.filter((t) => t.status === 'open').length,
    verifiedCompanies: companies.filter((c) => c.verified).length,
    verifiedOrganizations: organizations.filter((o) => o.verified).length,
    verifiedUsers: users.filter((u) => u.emailVerified).length,
  };

  // Filter functions
  const filterJobs = (jobsList: JobRecord[]) => {
    let filtered = jobsList;
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }
    return filtered;
  };

  const filterTenders = (tendersList: TenderRecord[]) => {
    let filtered = tendersList;
    if (searchQuery) {
      filtered = filtered.filter(
        (tender) =>
          tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tender.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((tender) => tender.status === filterStatus);
    }
    return filtered;
  };

  const filterUsers = (usersList: UserRecord[]) => {
    if (!searchQuery) return usersList;
    return usersList.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredJobs = filterJobs(jobs);
  const filteredTenders = filterTenders(tenders);
  const filteredUsers = filterUsers(users);

  const handleEdit = (type: string, id: string, data: any) => {
    setEditingEntity({ type, id, data });
  };

  const handleSaveEdit = () => {
    if (!editingEntity) return;

    const { type, id, data } = editingEntity;

    switch (type) {
      case 'job':
        updateJobMutation.mutate({ id, data });
        break;
      case 'tender':
        updateTenderMutation.mutate({ id, data });
        break;
      case 'company':
        updateCompanyMutation.mutate({ id, data });
        break;
      case 'organization':
        updateOrganizationMutation.mutate({ id, data });
        break;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="flex w-full">
          {/* Sidebar */}
          <Sidebar variant="inset" className="border-r bg-white">
            <SidebarContent className="bg-white">
              <div className="px-4 py-6 border-b border-border">
                <div className="flex flex-col gap-3">
                  {/* Logo and Branding */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-lg">RT</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-display font-bold text-base text-foreground leading-tight">RT-SYR</span>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {t('logo.tagline')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Admin Panel Label */}
                  <div className="pt-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Admin Panel
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-2 bg-white">
                {menuItems.map((category, categoryIndex) => (
                  <SidebarGroup key={categoryIndex} className="px-2">
                    <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category.category}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <SidebarMenuItem key={item.id}>
                              <SidebarMenuButton
                                onClick={() => setActiveSection(item.id)}
                                isActive={isActive}
                                className={`w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isActive 
                                    ? 'bg-muted text-foreground font-medium' 
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                                tooltip={item.label}
                              >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-white">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-muted-foreground hover:bg-muted hover:text-foreground" 
                  size="sm"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{t('common.settings')}</span>
                </Button>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 pt-8 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
              {/* Header with sidebar toggle */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{t('dashboard.admin.title')}</h1>
                      <p className="text-muted-foreground mt-1 text-sm">{t('dashboard.admin.subtitle')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('dashboard.admin.export')}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('common.settings')}</span>
                    </Button>
                  </div>
                </div>
              </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.admin.totalUsers')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {stats.verifiedUsers} {t('dashboard.admin.verified')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.admin.activeJobs')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.admin.active')} / {stats.totalJobs} {t('dashboard.admin.jobs').toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.admin.openTenders')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.openTenders}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.admin.active')} / {stats.totalTenders} {t('dashboard.admin.tenders').toLowerCase()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.admin.verifiedCompanies')}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats.verifiedCompanies}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.verifiedCompanies} / {stats.totalCompanies} {t('dashboard.admin.verified')}
                </p>
              </CardContent>
            </Card>
          </div>

              {/* Content Sections */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {t('dashboard.admin.platformOverview')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.admin.quickStats')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('dashboard.admin.totalUsers')}</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('dashboard.admin.activeJobs')}</p>
                        <p className="text-2xl font-bold">{stats.activeJobs}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('dashboard.admin.openTenders')}</p>
                        <p className="text-2xl font-bold">{stats.openTenders}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">{t('dashboard.admin.verifiedCompanies')}</p>
                        <p className="text-2xl font-bold">{stats.verifiedCompanies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {t('dashboard.admin.recentActivity')}
                    </CardTitle>
                    <CardDescription>Latest platform activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {jobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{job.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {jobs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t('dashboard.admin.noData')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-6">
              <ContentManagement />
                </div>
              )}

              {activeSection === 'footer' && (
                <div className="space-y-6">
              <FooterManagement />
                </div>
              )}

              {activeSection === 'forms' && (
                <div className="space-y-6">
              <FormManagement />
                </div>
              )}

              {activeSection === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('dashboard.admin.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t('dashboard.admin.filter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="job_seeker">{t('auth.jobSeeker')}</SelectItem>
                    <SelectItem value="company">{t('auth.company')}</SelectItem>
                    <SelectItem value="organization">{t('auth.organization')}</SelectItem>
                    <SelectItem value="admin">{t('dashboard.admin.title')}</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
                  {usersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">{t('dashboard.admin.loading')}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.admin.noData')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                          </div>
                          <Badge variant="outline">{user.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
                </div>
              )}

              {activeSection === 'companies' && (
                <div className="space-y-4">
                  {companiesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {companies.map((company) => (
                    <Card key={company.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <CardDescription>{company.location}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {company.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unverified</Badge>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit('company', company.id, company)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Company</DialogTitle>
                                </DialogHeader>
                                {editingEntity && editingEntity.type === 'company' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Name</Label>
                                      <Input
                                        value={editingEntity.data.name}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, name: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        value={editingEntity.data.description}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              description: e.target.value,
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input
                                        value={editingEntity.data.location}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, location: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editingEntity.data.verified}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              verified: e.target.checked,
                                            },
                                          })
                                        }
                                      />
                                      <Label>Verified</Label>
                                    </div>
                                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
                </div>
              )}

              {activeSection === 'organizations' && (
                <div className="space-y-4">
                  {orgsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{org.name}</CardTitle>
                            <CardDescription>{org.location}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {org.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unverified</Badge>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit('organization', org.id, org)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Organization</DialogTitle>
                                </DialogHeader>
                                {editingEntity && editingEntity.type === 'organization' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Name</Label>
                                      <Input
                                        value={editingEntity.data.name}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, name: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        value={editingEntity.data.description}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              description: e.target.value,
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Location</Label>
                                      <Input
                                        value={editingEntity.data.location}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, location: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editingEntity.data.verified}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              verified: e.target.checked,
                                            },
                                          })
                                        }
                                      />
                                      <Label>Verified</Label>
                                    </div>
                                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'jobs' && (
                <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('dashboard.admin.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t('dashboard.admin.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="open">{t('dashboard.admin.active')}</SelectItem>
                    <SelectItem value="closed">{t('dashboard.admin.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('dashboard.admin.export')}
                </Button>
              </div>
              {jobsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">{t('dashboard.admin.loading')}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.admin.noData')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <CardDescription>
                              {job.location} • {job.category} • {job.type}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit('job', job.id, job)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Job</DialogTitle>
                                </DialogHeader>
                                {editingEntity && editingEntity.type === 'job' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Title</Label>
                                      <Input
                                        value={editingEntity.data.title}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, title: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        value={editingEntity.data.description}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              description: e.target.value,
                                            },
                                          })
                                        }
                                        rows={6}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                          value={editingEntity.data.location}
                                          onChange={(e) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: {
                                                ...editingEntity.data,
                                                location: e.target.value,
                                              },
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Salary</Label>
                                        <Input
                                          value={editingEntity.data.salary || ''}
                                          onChange={(e) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: {
                                                ...editingEntity.data,
                                                salary: e.target.value,
                                              },
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                          value={editingEntity.data.type}
                                          onValueChange={(value) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: { ...editingEntity.data, type: value },
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="remote">Remote</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                          value={editingEntity.data.status}
                                          onValueChange={(value) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: { ...editingEntity.data, status: value },
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editingEntity.data.isVerified}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              isVerified: e.target.checked,
                                            },
                                          })
                                        }
                                      />
                                      <Label>Verified</Label>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={handleSaveEdit}>Save Changes</Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          deleteJobMutation.mutate(job.id);
                                          setEditingEntity(null);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteJobMutation.mutate(job.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  </div>
                )}
                </div>
              )}

              {activeSection === 'tenders' && (
                <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('dashboard.admin.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t('dashboard.admin.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="open">{t('dashboard.admin.active')}</SelectItem>
                    <SelectItem value="closing-soon">Closing Soon</SelectItem>
                    <SelectItem value="closed">{t('dashboard.admin.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('dashboard.admin.export')}
                </Button>
              </div>
              {tendersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">{t('dashboard.admin.loading')}</p>
                </div>
              ) : filteredTenders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.admin.noData')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredTenders.map((tender) => (
                    <Card key={tender.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{tender.title}</CardTitle>
                            <CardDescription>
                              {tender.location} • {tender.category} • Deadline:{' '}
                              {new Date(tender.deadline).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tender.status}</Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit('tender', tender.id, tender)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Tender</DialogTitle>
                                </DialogHeader>
                                {editingEntity && editingEntity.type === 'tender' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Title</Label>
                                      <Input
                                        value={editingEntity.data.title}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: { ...editingEntity.data, title: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        value={editingEntity.data.description}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              description: e.target.value,
                                            },
                                          })
                                        }
                                        rows={6}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                          value={editingEntity.data.location}
                                          onChange={(e) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: {
                                                ...editingEntity.data,
                                                location: e.target.value,
                                              },
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Input
                                          type="date"
                                          value={editingEntity.data.deadline.split('T')[0]}
                                          onChange={(e) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: {
                                                ...editingEntity.data,
                                                deadline: e.target.value,
                                              },
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                          value={editingEntity.data.status}
                                          onValueChange={(value) =>
                                            setEditingEntity({
                                              ...editingEntity,
                                              data: { ...editingEntity.data, status: value },
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="closing-soon">Closing Soon</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editingEntity.data.isVerified}
                                        onChange={(e) =>
                                          setEditingEntity({
                                            ...editingEntity,
                                            data: {
                                              ...editingEntity.data,
                                              isVerified: e.target.checked,
                                            },
                                          })
                                        }
                                      />
                                      <Label>Verified</Label>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={handleSaveEdit}>Save Changes</Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          deleteTenderMutation.mutate(tender.id);
                                          setEditingEntity(null);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTenderMutation.mutate(tender.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
                </div>
              )}

              {activeSection === 'applications' && (
                <div className="space-y-4">
              {appsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Application #{application.id.slice(0, 8)}
                            </CardTitle>
                            <CardDescription>
                              Status: {application.status} • Created:{' '}
                              {new Date(application.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{application.status}</Badge>
                        </div>
                      </CardHeader>
                      {application.coverLetter && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
                </div>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
