import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/Footer';
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
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  ArrowUpRight,
  LayoutDashboard,
  Mail,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jobsAPI, tendersAPI, applicationsAPI, type JobRecord, type TenderRecord, type ApplicationRecord } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const CompanyDashboard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Menu items organized by category
  const menuItems = [
    {
      category: 'Dashboard',
      items: [
        { id: 'overview', label: t('dashboard.organization.overview'), icon: LayoutDashboard },
      ],
    },
    {
      category: 'Management',
      items: [
        { id: 'jobs', label: t('dashboard.company.jobs'), icon: Briefcase },
        { id: 'tenders', label: t('dashboard.organization.tenders'), icon: FileText },
        { id: 'applications', label: t('dashboard.company.applications'), icon: Mail },
      ],
    },
  ];

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobRecord[]>({
    queryKey: ['company-jobs', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return [];
      try {
        return await jobsAPI.getAll();
      } catch {
        return [];
      }
    },
    enabled: !!user?.companyId,
  });

  const { data: allTenders = [], isLoading: tendersLoading } = useQuery<TenderRecord[]>({
    queryKey: ['company-tenders', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return [];
      try {
        const all = await tendersAPI.getAll();
        // Filter tenders by companyId (client-side filtering as fallback)
        return all.filter(tender => tender.companyId === user?.companyId);
      } catch {
        return [];
      }
    },
    enabled: !!user?.companyId,
  });

  const tenders = allTenders;

  const { data: applications = [], isLoading: appsLoading } = useQuery<ApplicationRecord[]>({
    queryKey: ['company-applications', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return [];
      try {
        return await applicationsAPI.getAll();
      } catch {
        return [];
      }
    },
    enabled: !!user?.companyId,
  });

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
                  {/* Company Panel Label */}
                  <div className="pt-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company Panel
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
                      <h1 className="text-3xl font-bold text-foreground">{t('dashboard.company.title')}</h1>
                      <p className="text-muted-foreground mt-1 text-sm">Manage your jobs, tenders, and applications</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                      <Link to="/jobs/post">
                        <Plus className="w-4 h-4" />
                        {t('dashboard.company.postJob')}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.company.activeJobs')}</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{activeJobs}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>out of {jobs.length} total</span>
                  {jobs.length > 0 && (
                    <span className="text-primary font-medium">
                      ({Math.round((activeJobs / jobs.length) * 100)}%)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.company.totalApplications')}</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{totalApplications}</div>
                <p className="text-xs text-muted-foreground">applications received</p>
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
                  <span>out of {tenders.length} total</span>
                  {tenders.length > 0 && (
                    <span className="text-accent font-medium">
                      ({Math.round((activeTenders / tenders.length) * 100)}%)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-info shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-info" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <p className="text-xs text-muted-foreground">job views this month</p>
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
                          {t('common.view')} All <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-8">
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
                              <p className="font-semibold text-sm mb-1 truncate">{job.title}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(job.createdAt).toLocaleDateString()}
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
                          {t('common.view')} All <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tendersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : tenders.length === 0 ? (
                      <div className="text-center py-8">
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
                              <p className="font-semibold text-sm mb-1 truncate">{tender.title}</p>
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
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{t('dashboard.company.recentApplications')}</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="#" className="text-xs">
                        {t('common.view')} All <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {appsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((application) => {
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
                          <div
                            key={application.id}
                            className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm mb-1">Application #{application.id.slice(0, 8)}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Applied on {new Date(application.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getStatusVariant()} className="shrink-0 gap-1.5">
                              {getStatusIcon()}
                              {application.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start posting jobs to attract candidates
                    </p>
                    <Button asChild>
                      <Link to="/jobs/post">{t('dashboard.company.postJob')}</Link>
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
                                <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                                <CardDescription>
                                  <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <MapPin className="w-4 h-4 text-muted-foreground" />
                                      <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
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
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="w-4 h-4" />
                              {t('common.edit')}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="w-4 h-4" />
                              {t('dashboard.company.applications')}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            {t('common.view')} <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
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
                                <CardTitle className="text-lg mb-2">{tender.title}</CardTitle>
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
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="w-4 h-4" />
                              {t('common.edit')}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="w-4 h-4" />
                              {t('dashboard.organization.viewProposals')}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            {t('common.view')} <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
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
              ) : applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">
                      Applications will appear here when candidates apply to your jobs
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
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg mb-1">Application #{application.id.slice(0, 8)}</CardTitle>
                                  <CardDescription className="flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Applied on {new Date(application.createdAt).toLocaleDateString()}
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
                              View Details
                            </Button>
                            <div className="flex items-center gap-2">
                              {application.status === 'pending' && (
                                <>
                                  <Button variant="default" size="sm" className="gap-2 bg-success hover:bg-success/90">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Accept
                                  </Button>
                                  <Button variant="destructive" size="sm" className="gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Reject
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
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default CompanyDashboard;



