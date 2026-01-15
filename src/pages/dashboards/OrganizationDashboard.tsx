import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Briefcase,
  FileText,
  Plus,
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  ArrowUpRight,
  ArrowLeft,
  Building2,
  LayoutDashboard,
  Mail,
  Settings,
  User,
  Save,
  X,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jobsAPI, tendersAPI, applicationsAPI, organizationsAPI, type JobRecord, type TenderRecord, type ApplicationRecord, type OrganizationRecord } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const OrganizationDashboard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<{
    id: string;
    title: string;
    title_ar?: string;
    description: string;
    description_ar?: string;
    status: string;
    type?: string;
    type_ar?: string;
    sector?: string;
    about_company?: string;
    about_company_ar?: string;
    project_summary?: string;
    project_summary_ar?: string;
    requirements?: string;
    requirements_ar?: string;
    deadline?: string;
    tender_documents_link?: string;
    file_upload_url?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    employment_type_ar?: string;
    experience_level?: string;
    experience_level_ar?: string;
    location?: string;
    location_ar?: string;
    category?: string;
    category_ar?: string;
  } | null>(null);
  const [editingTender, setEditingTender] = useState<{
    id: string;
    title: string;
    title_ar?: string;
    description: string;
    description_ar?: string;
    status: string;
    type?: string;
    type_ar?: string;
    sector?: string;
    about_organization?: string;
    about_organization_ar?: string;
    project_summary?: string;
    project_summary_ar?: string;
    requirements?: string;
    requirements_ar?: string;
    deadline?: string;
    tender_documents_link?: string;
    file_upload_url?: string;
    location?: string;
    location_ar?: string;
    category?: string;
    category_ar?: string;
  } | null>(null);

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<OrganizationRecord>>({
    name: '',
    name_ar: '',
    description: '',
    registration_country: '',
    registration_number: '',
    registration_file_url: '',
    contact_person_name: '',
    contact_person_position: '',
    contact_person_email: '',
    logo_url: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);

  // Menu items organized by category
  const menuItems = [
    {
      category: t('dashboard.sections.dashboard'),
      items: [
        { id: 'overview', label: t('dashboard.organization.overview'), icon: LayoutDashboard },
        { id: 'profile', label: t('dashboard.user.profile'), icon: User },
      ],
    },
    {
      category: t('dashboard.sections.management'),
      items: [
        { id: 'jobs', label: t('dashboard.company.jobs'), icon: Briefcase },
        { id: 'tenders', label: t('dashboard.organization.tenders'), icon: FileText },
        { id: 'applications', label: t('dashboard.company.applications'), icon: Mail },
      ],
    },
  ];

  // Check if user has organization role
  const isOrganizationUser = user?.role === 'organization';

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user?.id || !isOrganizationUser) throw new Error(t('common.unauthorized'));
      return await organizationsAPI.updateProfile(user.id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-organizations', user?.id] });
      toast.success(t('dashboard.organization.profileUpdated'));
      setIsEditingProfile(false);
      setLogoFile(null);
      setRegistrationFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('dashboard.organization.profileUpdateFailed'));
    },
  });

  // Handle profile save
  const handleProfileSave = async () => {


    const formData = new FormData();

    // Add all text fields with correct API field names
    formData.append('full_name_en', profileData.name || '');
    if (profileData.name_ar) {
      formData.append('full_name_ar', profileData.name_ar);
    }
    formData.append('registration_country', profileData.registration_country || '');
    formData.append('registration_number', profileData.registration_number || '');
    formData.append('contact_person_name', profileData.contact_person_name || '');
    formData.append('contact_person_position', profileData.contact_person_position || '');
    formData.append('contact_person_email', profileData.contact_person_email || '');

    // Add files if they exist
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (registrationFile) {
      formData.append('registration', registrationFile);
    }

    updateOrganizationMutation.mutate(formData);
  };

  // Fetch organization profile data
  const { data: organizationProfileData } = useQuery({
    queryKey: ['my-organizations', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const organizations = await organizationsAPI.getMy();
        return Array.isArray(organizations) && organizations.length > 0 ? organizations[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Update profile data when organization profile is loaded
  useEffect(() => {
    if (organizationProfileData) {
      setProfileData({
        name: organizationProfileData.name || '',
        name_ar: organizationProfileData.name_ar || '',
        description: organizationProfileData.description || '',
        registration_country: organizationProfileData.registration_country || '',
        registration_number: organizationProfileData.registration_number || '',
        registration_file_url: organizationProfileData.registration_file_url || '',
        contact_person_name: organizationProfileData.contact_person_name || '',
        contact_person_position: organizationProfileData.contact_person_position || '',
        contact_person_email: organizationProfileData.contact_person_email || '',
        logo_url: organizationProfileData.logo_url || '',
      });
    }
  }, [organizationProfileData]);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobRecord[]>({
    queryKey: ['organization-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        // Use the userId filter to get jobs by user ID
        const all = await jobsAPI.getAll({ userId: user.id });
        const result = Array.isArray(all) ? all : all.data || [];
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const { data: tendersData, isLoading: tendersLoading } = useQuery({
    queryKey: ['organization-tenders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        // Use the userId filter to get tenders by user ID
        const all = await tendersAPI.getAll({ userId: user.id });
        const result = Array.isArray(all) ? all : all.data || [];
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const tenders: TenderRecord[] = Array.isArray(tendersData) ? tendersData : [];

  const { data: applications = [], isLoading: appsLoading } = useQuery<ApplicationRecord[]>({
    queryKey: ['organization-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const all = await applicationsAPI.getAll();
        const result = Array.isArray(all) ? all : all.data || [];
        // Filter applications for tenders belonging to this user
        const userTenderIds = tenders.map(t => t.id);
        return result.filter((app: ApplicationRecord) =>
          app.tender_id && userTenderIds.includes(app.tender_id)
        );
      } catch {
        return [];
      }
    },
    enabled: !!user?.id && tenders.length > 0,
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobRecord> }) => {
      return await jobsAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success(t('dashboard.admin.jobUpdated'));
      queryClient.invalidateQueries({ queryKey: ['organization-jobs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['organization-applications', user?.id] });
      setEditingJob(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('dashboard.admin.jobUpdateFailed'));
    },
  });

  const updateTenderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TenderRecord> }) => {
      return await tendersAPI.update(id, data);
    },
    onSuccess: () => {
      toast.success(t('dashboard.admin.tenderUpdated'));
      queryClient.invalidateQueries({ queryKey: ['organization-tenders', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['organization-applications', user?.id] });
      setEditingTender(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('dashboard.admin.tenderUpdateFailed'));
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return await jobsAPI.delete(id);
    },
    onSuccess: (_data, id) => {
      toast.success(t('dashboard.admin.jobDeleted'));
      queryClient.invalidateQueries({ queryKey: ['organization-jobs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['organization-applications', user?.id] });
      if (editingJob?.id === id) {
        setEditingJob(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('dashboard.admin.jobDeleteFailed'));
    },
  });

  const deleteTenderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await tendersAPI.delete(id);
    },
    onSuccess: (_data, id) => {
      toast.success(t('dashboard.admin.tenderDeleted'));
      queryClient.invalidateQueries({ queryKey: ['organization-tenders', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['organization-applications', user?.id] });
      if (editingTender?.id === id) {
        setEditingTender(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('dashboard.admin.tenderDeleteFailed'));
    },
  });

  const handleJobEdit = (job: JobRecord) => {
    if (editingJob?.id === job.id) {
      setEditingJob(null);
      return;
    }
    setEditingTender(null);
    setEditingJob({
      id: job.id,
      title: job.title || job.name || '',
      title_ar: job.title_ar || '',
      description: job.description || '',
      description_ar: job.description_ar || '',
      status: job.status || 'open',
      type: job.type || '',
      type_ar: job.type_ar || '',
      sector: job.sector || '',
      about_company: job.about_company || '',
      about_company_ar: job.about_company_ar || '',
      project_summary: job.project_summary || '',
      project_summary_ar: job.project_summary_ar || '',
      requirements: job.requirements || '',
      requirements_ar: job.requirements_ar || '',
      deadline: job.deadline || '',
      tender_documents_link: job.tender_documents_link || '',
      file_upload_url: job.file_upload_url || '',
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      employment_type: job.employment_type || '',
      employment_type_ar: job.employment_type_ar || '',
      experience_level: job.experience_level || '',
      experience_level_ar: job.experience_level_ar || '',
      location: job.location || '',
      location_ar: job.location_ar || '',
      category: job.category || '',
      category_ar: job.category_ar || '',
    });
  };

  const handleTenderEdit = (tender: TenderRecord) => {
    if (editingTender?.id === tender.id) {
      setEditingTender(null);
      return;
    }
    setEditingJob(null);
    setEditingTender({
      id: tender.id,
      title: tender.title || tender.name || '',
      title_ar: tender.title_ar || '',
      description: tender.description || '',
      description_ar: tender.description_ar || '',
      status: tender.status || 'open',
      type: tender.type || '',
      type_ar: tender.type_ar || '',
      sector: tender.sector || '',
      about_organization: tender.about_organization || '',
      about_organization_ar: tender.about_organization_ar || '',
      project_summary: tender.project_summary || '',
      project_summary_ar: tender.project_summary_ar || '',
      requirements: tender.requirements || '',
      requirements_ar: tender.requirements_ar || '',
      deadline: tender.deadline || '',
      tender_documents_link: tender.tender_documents_link || '',
      file_upload_url: tender.file_upload_url || '',
      location: tender.location || '',
      location_ar: tender.location_ar || '',
      category: tender.category || '',
      category_ar: tender.category_ar || '',
    });
  };

  const sectors = ['WASH', 'FSL', 'EDUCATION', 'HEALTH', 'PROTECTION', 'SHELTER', 'NFI', 'CCCM', 'OTHER'];

  const handleJobUpdate = () => {
    if (!editingJob) return;
    updateJobMutation.mutate({
      id: editingJob.id,
      data: {
        title: editingJob.title.trim(),
        title_ar: editingJob.title_ar?.trim() || undefined,
        description: editingJob.description.trim(),
        description_ar: editingJob.description_ar?.trim() || undefined,
        status: (editingJob.status.trim() || 'open') as JobRecord['status'],
        type: editingJob.type?.trim() || undefined,
        type_ar: editingJob.type_ar?.trim() || undefined,
        sector: editingJob.sector as JobRecord['sector'] || undefined,
        about_company: editingJob.about_company?.trim() || undefined,
        about_company_ar: editingJob.about_company_ar?.trim() || undefined,
        project_summary: editingJob.project_summary?.trim() || undefined,
        project_summary_ar: editingJob.project_summary_ar?.trim() || undefined,
        requirements: editingJob.requirements?.trim() || undefined,
        requirements_ar: editingJob.requirements_ar?.trim() || undefined,
        deadline: editingJob.deadline || undefined,
        tender_documents_link: editingJob.tender_documents_link?.trim() || undefined,
        file_upload_url: editingJob.file_upload_url?.trim() || undefined,
        salary_min: editingJob.salary_min || undefined,
        salary_max: editingJob.salary_max || undefined,
        employment_type: editingJob.employment_type?.trim() || undefined,
        employment_type_ar: editingJob.employment_type_ar?.trim() || undefined,
        experience_level: editingJob.experience_level?.trim() || undefined,
        experience_level_ar: editingJob.experience_level_ar?.trim() || undefined,
        location: editingJob.location?.trim() || undefined,
        location_ar: editingJob.location_ar?.trim() || undefined,
        category: editingJob.category?.trim() || undefined,
        category_ar: editingJob.category_ar?.trim() || undefined,
      },
    });
  };

  const handleTenderUpdate = () => {
    if (!editingTender) return;
    updateTenderMutation.mutate({
      id: editingTender.id,
      data: {
        title: editingTender.title.trim(),
        title_ar: editingTender.title_ar?.trim() || undefined,
        description: editingTender.description.trim(),
        description_ar: editingTender.description_ar?.trim() || undefined,
        status: (editingTender.status.trim() || 'open') as TenderRecord['status'],
        type: editingTender.type?.trim() || undefined,
        type_ar: editingTender.type_ar?.trim() || undefined,
        sector: editingTender.sector as TenderRecord['sector'] || undefined,
        about_organization: editingTender.about_organization?.trim() || undefined,
        about_organization_ar: editingTender.about_organization_ar?.trim() || undefined,
        project_summary: editingTender.project_summary?.trim() || undefined,
        project_summary_ar: editingTender.project_summary_ar?.trim() || undefined,
        requirements: editingTender.requirements?.trim() || undefined,
        requirements_ar: editingTender.requirements_ar?.trim() || undefined,
        deadline: editingTender.deadline || undefined,
        tender_documents_link: editingTender.tender_documents_link?.trim() || undefined,
        file_upload_url: editingTender.file_upload_url?.trim() || undefined,
        location: editingTender.location?.trim() || undefined,
        location_ar: editingTender.location_ar?.trim() || undefined,
        category: editingTender.category?.trim() || undefined,
        category_ar: editingTender.category_ar?.trim() || undefined,
      },
    });
  };

  const activeJobs = jobs.filter(job => job.status === 'open').length;
  const activeTenders = tenders.filter(tender => tender.status === 'open' || tender.status === 'closing-soon').length;
  const totalApplications = applications.length;

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
                    <img
                      src="/logos/3.png"
                      alt={t('logo.alt')}
                      className="h-20 w-auto object-contain flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-serif font-light text-base text-foreground leading-tight">RT-SYR</span>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {t('logo.tagline')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back Button and Organization Profile Logo */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = 'https://rt-syr.com'}
                      className="shrink-0 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-xs font-medium">{t('common.backToWebsite')}</span>
                    </Button>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex items-center justify-center bg-muted shrink-0">
                      {profileData.logo_url ? (
                        <img
                          src={profileData.logo_url}
                          alt={t('dashboard.organization.logoAlt')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Organization Panel Label */}
                  <div className="pt-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('dashboard.organization.panelLabel')}
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
                                className={`w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
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
                      <h1 className="text-3xl font-bold text-foreground">{t('dashboard.organization.title')}</h1>
                      <p className="text-muted-foreground mt-1 text-sm">{t('dashboard.organization.subtitle')}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                      <Link to="/jobs/post">
                        <Plus className="w-4 h-4" />
                        {t('dashboard.organization.postJob')}
                      </Link>
                    </Button>
                    <Button className="gap-2 shadow-md" asChild>
                      <Link to="/tenders/post">
                        <Plus className="w-4 h-4" />
                        {t('dashboard.organization.postTender')}
                      </Link>
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Professional Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.organization.activeJobs')}</CardTitle>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">{activeJobs}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{t('dashboard.organization.outOfTotal', { total: jobs.length })}</span>
                      {jobs.length > 0 && (
                        <span className="text-primary font-medium">
                          ({Math.round((activeJobs / jobs.length) * 100)}%)
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.organization.activeTenders')}</CardTitle>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">{activeTenders}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{t('dashboard.organization.outOfTotal', { total: tenders.length })}</span>
                      {tenders.length > 0 && (
                        <span className="text-accent font-medium">
                          ({Math.round((activeTenders / tenders.length) * 100)}%)
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.organization.totalApplications')}</CardTitle>
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">{totalApplications}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.organization.applicationsReceived')}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-info shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.organization.totalPosts')}</CardTitle>
                    <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-info" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">{jobs.length + tenders.length}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.organization.jobsAndTenders')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Sections */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{t('dashboard.organization.recentJobs')}</CardTitle>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="#" className="text-xs">
                              {t('common.view')} {t('common.all')} <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {jobsLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : jobs.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <Briefcase className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{t('dashboard.organization.noJobs')}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {jobs.slice(0, 4).map((job) => (
                              <div
                                key={job.id}
                                className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm mb-1 truncate">{job.title || job.name || t('common.notAvailable')}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(job.created_at || job.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {job.location}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant={job.status === 'open' ? 'default' : 'secondary'}
                                  className="ml-3 shrink-0"
                                >
                                  {job.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{t('dashboard.organization.recentTenders')}</CardTitle>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="#" className="text-xs">
                              {t('common.view')} {t('common.all')} <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {tendersLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : tenders.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{t('dashboard.organization.noTenders')}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tenders.slice(0, 4).map((tender) => (
                              <div
                                key={tender.id}
                                className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm mb-1 truncate">{tender.title || tender.name || t('common.notAvailable')}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(tender.deadline).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {tender.location}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-3 shrink-0">
                                  {tender.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === 'jobs' && (
                <div className="space-y-4">
                  {jobsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : jobs.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.organization.noJobsPosted')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('dashboard.organization.startPostingJobs')}
                        </p>
                        <Button asChild>
                          <Link to="/jobs/post">{t('dashboard.organization.postJob')}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {jobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg mb-2">{job.title || job.name || t('common.notAvailable')}</CardTitle>
                                    <CardDescription>
                                      <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <MapPin className="w-4 h-4 text-muted-foreground" />
                                          <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                          <span>
                                            {t('dashboard.organization.postedOn', {
                                              date: new Date(job.created_at || job.createdAt).toLocaleDateString(),
                                            })}
                                          </span>
                                        </div>
                                        {job.salary && (
                                          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                                            {job.salary}
                                          </div>
                                        )}
                                      </div>
                                    </CardDescription>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant={job.status === 'open' ? 'default' : 'secondary'}
                                className="shrink-0"
                              >
                                {job.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
                            <Separator className="mb-4" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleJobEdit(job)}
                                >
                                  <Edit className="w-4 h-4" />
                                  {t('common.edit')}
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  {t('dashboard.organization.viewApplications')}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => deleteJobMutation.mutate(job.id)}
                                  disabled={deleteJobMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t('common.delete')}
                                </Button>
                              </div>
                              <Button variant="ghost" size="sm" className="gap-2">
                                {t('common.view')} <ArrowUpRight className="w-4 h-4" />
                              </Button>
                            </div>
                            {editingJob?.id === job.id && (
                              <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldTitle')}</Label>
                                    <Input
                                      value={editingJob.title}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, title: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldTitle')} (العربية)</Label>
                                    <Input
                                      value={editingJob.title_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, title_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldStatus')}</Label>
                                    <Select
                                      value={editingJob.status}
                                      onValueChange={(value) => setEditingJob(prev => prev ? { ...prev, status: value } : prev)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">{t('common.open')}</SelectItem>
                                        <SelectItem value="active">{t('common.active')}</SelectItem>
                                        <SelectItem value="closed">{t('common.closed')}</SelectItem>
                                        <SelectItem value="closing_soon">{t('common.closingSoon')}</SelectItem>
                                        <SelectItem value="draft">{t('common.draft')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.location')}</Label>
                                    <Input
                                      value={editingJob.location || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, location: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.location')} (العربية)</Label>
                                    <Input
                                      value={editingJob.location_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, location_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.category')}</Label>
                                    <Input
                                      value={editingJob.category || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, category: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.category')} (العربية)</Label>
                                    <Input
                                      value={editingJob.category_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, category_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.type')}</Label>
                                    <Input
                                      value={editingJob.type || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, type: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.type')} (العربية)</Label>
                                    <Input
                                      value={editingJob.type_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, type_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.sector')}</Label>
                                    <Select
                                      value={editingJob.sector || ''}
                                      onValueChange={(value) => setEditingJob(prev => prev ? { ...prev, sector: value } : prev)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('jobs.selectSector')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sectors.map((sector) => (
                                          <SelectItem key={sector} value={sector}>
                                            {sector}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.employmentType')}</Label>
                                    <Input
                                      value={editingJob.employment_type || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, employment_type: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.employmentType')} (العربية)</Label>
                                    <Input
                                      value={editingJob.employment_type_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, employment_type_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.experienceLevel')}</Label>
                                    <Input
                                      value={editingJob.experience_level || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, experience_level: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.experienceLevel')} (العربية)</Label>
                                    <Input
                                      value={editingJob.experience_level_ar || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, experience_level_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.salaryMin')}</Label>
                                    <Input
                                      type="number"
                                      value={editingJob.salary_min || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, salary_min: e.target.value ? Number(e.target.value) : undefined } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('jobs.salaryMax')}</Label>
                                    <Input
                                      type="number"
                                      value={editingJob.salary_max || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, salary_max: e.target.value ? Number(e.target.value) : undefined } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.deadline')}</Label>
                                    <Input
                                      type="date"
                                      value={editingJob.deadline || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, deadline: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('jobs.documentsLink')}</Label>
                                    <Input
                                      value={editingJob.tender_documents_link || ''}
                                      onChange={(e) => setEditingJob(prev => prev ? { ...prev, tender_documents_link: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('dashboard.admin.fieldDescription')}</Label>
                                  <Textarea
                                    value={editingJob.description}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, description: e.target.value } : prev)}
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('dashboard.admin.fieldDescription')} (العربية)</Label>
                                  <Textarea
                                    value={editingJob.description_ar || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, description_ar: e.target.value } : prev)}
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.aboutCompany')}</Label>
                                  <Textarea
                                    value={editingJob.about_company || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, about_company: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.aboutCompany')} (العربية)</Label>
                                  <Textarea
                                    value={editingJob.about_company_ar || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, about_company_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.projectSummary')}</Label>
                                  <Textarea
                                    value={editingJob.project_summary || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, project_summary: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.projectSummary')} (العربية)</Label>
                                  <Textarea
                                    value={editingJob.project_summary_ar || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, project_summary_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.requirements')}</Label>
                                  <Textarea
                                    value={editingJob.requirements || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, requirements: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('jobs.requirements')} (العربية)</Label>
                                  <Textarea
                                    value={editingJob.requirements_ar || ''}
                                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, requirements_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingJob(null)}
                                  >
                                    {t('common.cancel')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleJobUpdate}
                                    disabled={updateJobMutation.isPending}
                                  >
                                    {updateJobMutation.isPending ? t('common.saving') : t('common.saveChanges')}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'tenders' && (
                <div className="space-y-4">
                  {tendersLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : tenders.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.organization.noTendersPosted')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('dashboard.organization.startPostingTenders')}
                        </p>
                        <Button asChild>
                          <Link to="/tenders/post">{t('dashboard.organization.postTender')}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {tenders.map((tender) => (
                        <Card key={tender.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                                    <FileText className="w-5 h-5 text-accent" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg mb-2">{tender.title || tender.name || t('common.notAvailable')}</CardTitle>
                                    <CardDescription>
                                      <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <MapPin className="w-4 h-4 text-muted-foreground" />
                                          <span>{tender.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <Clock className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-medium">
                                            {t('dashboard.organization.deadline')}: {new Date(tender.deadline).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </CardDescription>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant={tender.status === 'open' ? 'default' : tender.status === 'closing-soon' ? 'secondary' : 'outline'}
                                className="shrink-0"
                              >
                                {tender.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tender.description}</p>
                            <Separator className="mb-4" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleTenderEdit(tender)}
                                >
                                  <Edit className="w-4 h-4" />
                                  {t('common.edit')}
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  {t('dashboard.organization.viewProposals')}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => deleteTenderMutation.mutate(tender.id)}
                                  disabled={deleteTenderMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t('common.delete')}
                                </Button>
                              </div>
                              <Button variant="ghost" size="sm" className="gap-2">
                                {t('common.view')} <ArrowUpRight className="w-4 h-4" />
                              </Button>
                            </div>
                            {editingTender?.id === tender.id && (
                              <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldTitle')}</Label>
                                    <Input
                                      value={editingTender.title}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, title: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldTitle')} (العربية)</Label>
                                    <Input
                                      value={editingTender.title_ar || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, title_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('dashboard.admin.fieldStatus')}</Label>
                                    <Select
                                      value={editingTender.status}
                                      onValueChange={(value) => setEditingTender(prev => prev ? { ...prev, status: value } : prev)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">{t('common.open')}</SelectItem>
                                        <SelectItem value="active">{t('common.active')}</SelectItem>
                                        <SelectItem value="closed">{t('common.closed')}</SelectItem>
                                        <SelectItem value="closing_soon">{t('common.closingSoon')}</SelectItem>
                                        <SelectItem value="draft">{t('common.draft')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.location')}</Label>
                                    <Input
                                      value={editingTender.location || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, location: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('tenders.location')} (العربية)</Label>
                                    <Input
                                      value={editingTender.location_ar || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, location_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.category')}</Label>
                                    <Input
                                      value={editingTender.category || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, category: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('tenders.category')} (العربية)</Label>
                                    <Input
                                      value={editingTender.category_ar || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, category_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.type')}</Label>
                                    <Input
                                      value={editingTender.type || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, type: e.target.value } : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('tenders.type')} (العربية)</Label>
                                    <Input
                                      value={editingTender.type_ar || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, type_ar: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.sector')}</Label>
                                    <Select
                                      value={editingTender.sector || ''}
                                      onValueChange={(value) => setEditingTender(prev => prev ? { ...prev, sector: value } : prev)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('tenders.selectSector')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sectors.map((sector) => (
                                          <SelectItem key={sector} value={sector}>
                                            {sector}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.deadline')}</Label>
                                    <Input
                                      type="date"
                                      value={editingTender.deadline || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, deadline: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>{t('tenders.documentsLink')}</Label>
                                    <Input
                                      value={editingTender.tender_documents_link || ''}
                                      onChange={(e) => setEditingTender(prev => prev ? { ...prev, tender_documents_link: e.target.value } : prev)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('dashboard.admin.fieldDescription')}</Label>
                                  <Textarea
                                    value={editingTender.description}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, description: e.target.value } : prev)}
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('dashboard.admin.fieldDescription')} (العربية)</Label>
                                  <Textarea
                                    value={editingTender.description_ar || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, description_ar: e.target.value } : prev)}
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.aboutOrganization')}</Label>
                                  <Textarea
                                    value={editingTender.about_organization || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, about_organization: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.aboutOrganization')} (العربية)</Label>
                                  <Textarea
                                    value={editingTender.about_organization_ar || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, about_organization_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.projectSummary')}</Label>
                                  <Textarea
                                    value={editingTender.project_summary || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, project_summary: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.projectSummary')} (العربية)</Label>
                                  <Textarea
                                    value={editingTender.project_summary_ar || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, project_summary_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.requirements')}</Label>
                                  <Textarea
                                    value={editingTender.requirements || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, requirements: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('tenders.requirements')} (العربية)</Label>
                                  <Textarea
                                    value={editingTender.requirements_ar || ''}
                                    onChange={(e) => setEditingTender(prev => prev ? { ...prev, requirements_ar: e.target.value } : prev)}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingTender(null)}
                                  >
                                    {t('common.cancel')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleTenderUpdate}
                                    disabled={updateTenderMutation.isPending}
                                  >
                                    {updateTenderMutation.isPending ? t('common.saving') : t('common.saveChanges')}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{t('dashboard.organization.profileTitle')}</CardTitle>
                        <Button
                          variant={isEditingProfile ? "outline" : "default"}
                          onClick={() => {
                            if (isEditingProfile) {
                              setIsEditingProfile(false);
                              setLogoFile(null);
                              setRegistrationFile(null);
                            } else {
                              setIsEditingProfile(true);
                            }
                          }}
                        >
                          {isEditingProfile ? (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              {t('common.cancel')}
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              {t('dashboard.organization.editProfile')}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.logoLabel')}</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border flex items-center justify-center bg-muted shrink-0">
                            {profileData.logo_url ? (
                              <img
                                src={profileData.logo_url}
                                alt={t('dashboard.organization.logoAlt')}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          {isEditingProfile && (
                            <div className="flex flex-col gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setLogoFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      if (e.target?.result) {
                                        setProfileData(prev => ({ ...prev, logo_url: e.target.result as string }));
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">{t('dashboard.organization.logoHelp')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Full Name (English) */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.fullNameEnLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('dashboard.organization.fullNameEnPlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.name || '-'}</p>
                        )}
                      </div>

                      {/* Full Name (Arabic) */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.fullNameArLabel')}</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.name_ar || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name_ar: e.target.value }))}
                            placeholder={t('dashboard.organization.fullNameArPlaceholder')}
                            dir="rtl"
                          />
                        ) : (
                          <p className="text-sm py-2" dir="rtl">{profileData.name_ar || '-'}</p>
                        )}
                      </div>

                      {/* Registration Country */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.registrationCountryLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.registration_country || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, registration_country: e.target.value }))}
                            placeholder={t('dashboard.organization.registrationCountryPlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.registration_country || '-'}</p>
                        )}
                      </div>

                      {/* Registration Number */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.registrationNumberLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.registration_number || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, registration_number: e.target.value }))}
                            placeholder={t('dashboard.organization.registrationNumberPlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.registration_number || '-'}</p>
                        )}
                      </div>

                      {/* Registration File Upload */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.registrationDocumentLabel')}</Label>
                        {isEditingProfile ? (
                          <div className="space-y-2">
                            {profileData.registration_file_url && (
                              <a
                                href={profileData.registration_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                              >
                                {t('dashboard.organization.viewCurrentFile')}
                              </a>
                            )}
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setRegistrationFile(file);
                                }
                              }}
                            />
                            <p className="text-xs text-muted-foreground">{t('dashboard.organization.registrationHelp')}</p>
                          </div>
                        ) : (
                          profileData.registration_file_url ? (
                            <a
                              href={profileData.registration_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {t('dashboard.organization.viewRegistrationDocument')}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t('dashboard.organization.noFileUploaded')}</p>
                          )
                        )}
                      </div>

                      {/* Contact Person Name */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.contactPersonNameLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.contact_person_name || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, contact_person_name: e.target.value }))}
                            placeholder={t('dashboard.organization.contactPersonNamePlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.contact_person_name || '-'}</p>
                        )}
                      </div>

                      {/* Contact Person Position */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.contactPersonPositionLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.contact_person_position || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, contact_person_position: e.target.value }))}
                            placeholder={t('dashboard.organization.contactPersonPositionPlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.contact_person_position || '-'}</p>
                        )}
                      </div>

                      {/* Contact Person Email */}
                      <div className="space-y-2">
                        <Label>{t('dashboard.organization.contactPersonEmailLabel')} *</Label>
                        {isEditingProfile ? (
                          <Input
                            type="email"
                            value={profileData.contact_person_email || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, contact_person_email: e.target.value }))}
                            placeholder={t('dashboard.organization.contactPersonEmailPlaceholder')}
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.contact_person_email || '-'}</p>
                        )}
                      </div>

                      {isEditingProfile && (
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setLogoFile(null);
                              setRegistrationFile(null);
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            onClick={handleProfileSave}
                            disabled={updateOrganizationMutation.isPending}
                          >
                            {updateOrganizationMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                {t('common.saving')}
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                {t('common.saveChanges')}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === 'applications' && (
                <div className="space-y-4">
                  {appsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.organization.noApplications')}</h3>
                        <p className="text-muted-foreground">
                          {t('dashboard.organization.applicationsWillAppear')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {applications.map((application) => {
                        const getStatusIcon = () => {
                          switch (application.status) {
                            case 'accepted':
                              return <CheckCircle2 className="w-4 h-4 text-success" />;
                            case 'rejected':
                              return <XCircle className="w-4 h-4 text-destructive" />;
                            default:
                              return <Clock className="w-4 h-4 text-muted-foreground" />;
                          }
                        };

                        const getStatusVariant = () => {
                          switch (application.status) {
                            case 'accepted':
                              return 'default';
                            case 'rejected':
                              return 'destructive';
                            default:
                              return 'secondary';
                          }
                        };

                        return (
                          <Card key={application.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                      {application.jobId ? (
                                        <Briefcase className="w-5 h-5 text-primary" />
                                      ) : (
                                        <FileText className="w-5 h-5 text-primary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="text-lg mb-1">
                                        {application.jobId ? t('dashboard.organization.jobApplication') : t('dashboard.organization.tenderApplication')}
                                      </CardTitle>
                                      <CardDescription className="flex items-center gap-2">
                                        <span>{t('dashboard.organization.applicationId', { id: application.id.slice(0, 8) })}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {t('dashboard.organization.appliedOn')} {new Date(application.createdAt).toLocaleDateString()}
                                        </span>
                                      </CardDescription>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={getStatusVariant()} className="shrink-0 gap-1.5">
                                  {getStatusIcon()}
                                  {application.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {application.coverLetter && (
                                <>
                                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                    {application.coverLetter}
                                  </p>
                                  <Separator className="mb-4" />
                                </>
                              )}
                              <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  {t('common.viewDetails')}
                                </Button>
                                <div className="flex items-center gap-2">
                                  {application.status === 'pending' && (
                                    <>
                                      <Button variant="default" size="sm" className="gap-2 bg-success hover:bg-success/90">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {t('dashboard.organization.accept')}
                                      </Button>
                                      <Button variant="destructive" size="sm" className="gap-2">
                                        <XCircle className="w-4 h-4" />
                                        {t('dashboard.organization.reject')}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OrganizationDashboard;
