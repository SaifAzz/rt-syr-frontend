import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { jobsAPI, companiesAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  Shield,
  TrendingUp,
  Award,
  Globe,
  ExternalLink,
  Users
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('auth.pleaseSignIn'));
      navigate('/login', { state: { from: `/jobs/${id}` } });
    }
  }, [user, navigate, id, t]);

  // Fetch job details
  const { data: job, isLoading: isLoadingJob, error: jobError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getById(id!),
    enabled: !!id && !!user,
  });

  // Fetch company details if job is loaded
  const { data: company } = useQuery({
    queryKey: ['company', job?.company_id],
    queryFn: () => companiesAPI.getById(job!.company_id),
    enabled: !!job?.company_id,
  });

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-center py-32">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary/20 rounded-full mx-auto"></div>
                </div>
                <p className="text-muted-foreground font-medium">{t('common.loading')}</p>
                <p className="text-sm text-muted-foreground/70">Loading job details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="max-w-2xl mx-auto space-y-6">
              <Alert variant="destructive" className="border-2 shadow-lg">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">{t('common.error')}</AlertTitle>
                <AlertDescription className="mt-2">
                  {t('jobs.jobNotFound')}
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/jobs')} 
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('jobs.backToJobs')}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeColors = {
    "full-time": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "part-time": "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "contract": "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "remote": "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  const statusColors = {
    "active": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "open": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "closing_soon": "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "closed": "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    "draft": "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  };

  const isClosingSoon = job.deadline && new Date(job.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const daysUntilDeadline = job.deadline 
    ? Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Helper function to get localized field value
  const getLocalizedField = (enValue?: string, arValue?: string) => {
    if (language === 'ar' && arValue) return arValue;
    return enValue || '';
  };

  // Get localized values
  const jobTitle = getLocalizedField(job.title, job.title_ar);
  const jobDescription = getLocalizedField(job.description, job.description_ar);
  const jobLocation = getLocalizedField(job.location, job.location_ar);
  const jobType = getLocalizedField(job.type, job.type_ar);
  const jobEmploymentType = getLocalizedField(job.employment_type, job.employment_type_ar);
  const jobDuration = getLocalizedField(job.duration, job.duration_ar);
  const jobCategory = getLocalizedField(job.category, job.category_ar);
  const jobExperienceLevel = getLocalizedField(job.experience_level, job.experience_level_ar);
  const jobAboutCompany = getLocalizedField(job.about_company, job.about_company_ar);
  const jobRequirements = getLocalizedField(job.requirements, job.requirements_ar);
  const jobProjectSummary = getLocalizedField(job.project_summary, job.project_summary_ar);
  const companyName = company ? getLocalizedField(company.name, company.name_ar) : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Enhanced Back button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/jobs')}
              className="gap-2 hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('jobs.backToJobs')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Header Card */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-6">
                    {/* Enhanced Company logo */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20 shadow-md">
                        {company?.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-10 h-10 text-primary" />
                        )}
                      </div>
                      {company?.status === 'approved' && (
                        <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 border-2 border-background shadow-sm">
                          <CheckCircle className="w-4 h-4 text-success-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-3xl font-bold mb-3 leading-tight">{jobTitle}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{companyName || jobAboutCompany || 'Company'}</span>
                            {company?.status === 'approved' && (
                              <Badge variant="outline" className="ml-2 border-success/30 text-success bg-success/5">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('common.verified') || 'Verified'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {jobEmploymentType && (
                            <Badge 
                              variant="outline" 
                              className={`${typeColors[job.employment_type as keyof typeof typeColors] || ''} border font-semibold px-3 py-1`}
                            >
                              <Briefcase className="w-3 h-3 mr-1" />
                              {jobEmploymentType}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`${statusColors[job.status as keyof typeof statusColors] || ''} border font-semibold px-3 py-1`}
                          >
                            {job.status === 'active' || job.status === 'open' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : null}
                            {job.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Enhanced Info Bar */}
                      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                        {jobLocation && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-foreground">{jobLocation}</span>
                          </div>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-foreground">
                              {job.salary_min && job.salary_max
                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                : job.salary_min
                                ? `From $${job.salary_min.toLocaleString()}`
                                : `Up to $${job.salary_max.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {jobCategory && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-info" />
                            </div>
                            <span className="text-foreground">{jobCategory}</span>
                          </div>
                        )}
                        {job.deadline && (
                          <div className={`flex items-center gap-2 text-sm font-medium ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isClosingSoon ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-primary/10'}`}>
                              <Calendar className={`w-4 h-4 ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
                            </div>
                            <div>
                              <span className="text-foreground">{t('jobs.deadline')}: </span>
                              <span className={isClosingSoon ? 'font-bold' : ''}>
                                {new Date(job.deadline).toLocaleDateString()}
                              </span>
                              {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({daysUntilDeadline} {daysUntilDeadline === 1 ? t('jobs.day') : t('jobs.days')} {t('jobs.left')})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Enhanced Job Description */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{t('jobs.jobDescription')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{jobDescription}</p>
                  </div>

                  {jobAboutCompany && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold text-foreground">{t('jobs.aboutCompany')}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{jobAboutCompany}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {jobRequirements && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <h3 className="text-lg font-bold text-foreground">{t('jobs.requirements')}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{jobRequirements}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {jobProjectSummary && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-accent" />
                          <h3 className="text-lg font-bold text-foreground">{t('jobs.projectSummary')}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{jobProjectSummary}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {jobDuration && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-info" />
                          <h3 className="text-lg font-bold text-foreground">{t('jobs.duration')}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground font-medium">{jobDuration}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {job.estimated_start_date && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-accent" />
                          <h3 className="text-lg font-bold text-foreground">{t('jobs.estimatedStartDate')}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground">
                            {new Date(job.estimated_start_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Job Info Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">{t('jobs.jobInformation')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    {job.created_at && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.postedOn')}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(job.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.deadline && (
                      <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isClosingSoon ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800' : 'bg-muted/30 hover:bg-muted/50'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isClosingSoon ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
                          <Calendar className={`w-5 h-5 ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.deadline')}
                          </p>
                          <p className={`text-sm font-medium ${isClosingSoon ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>
                            {new Date(job.deadline).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                            <p className={`text-xs mt-1 ${isClosingSoon ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                              {daysUntilDeadline} {daysUntilDeadline === 1 ? t('jobs.day') : t('jobs.days')} {t('jobs.remaining')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {job.sector && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.sector')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{job.sector}</p>
                        </div>
                      </div>
                    )}

                    {jobExperienceLevel && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.experienceLevel')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{jobExperienceLevel}</p>
                        </div>
                      </div>
                    )}

                    {jobType && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-info" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.jobType')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{jobType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Company Info Card */}
              {company && (
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-accent">
                  <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <CardTitle className="text-lg font-bold">{t('jobs.companyInfo')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {company.location && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.location')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{company.location}</p>
                        </div>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-info" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.website')}
                          </p>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1 transition-colors"
                          >
                            {company.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {company.industry && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.industry')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{company.industry}</p>
                        </div>
                      </div>
                    )}

                    {company.size && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('jobs.companySize')}
                          </p>
                          <p className="text-sm font-medium text-foreground">{company.size}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetails;

