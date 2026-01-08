import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
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
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{t('common.loading')}</p>
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>
                {t('jobs.jobNotFound')}
              </AlertDescription>
            </Alert>
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/jobs')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('jobs.backToJobs')}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeColors = {
    "full-time": "bg-success/10 text-success",
    "part-time": "bg-info/10 text-info",
    "contract": "bg-warning/10 text-warning",
    "remote": "bg-primary/10 text-primary",
  };

  const statusColors = {
    "active": "bg-success/10 text-success",
    "open": "bg-success/10 text-success",
    "closing_soon": "bg-warning/10 text-warning",
    "closed": "bg-destructive/10 text-destructive",
    "draft": "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/jobs')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('jobs.backToJobs')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Company logo */}
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{company?.name || job.about_company || 'Company'}</span>
                            {company?.status === 'approved' && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {job.employment_type && (
                            <Badge variant="secondary" className={typeColors[job.employment_type as keyof typeof typeColors] || ''}>
                              {job.employment_type}
                            </Badge>
                          )}
                          <Badge variant="secondary" className={statusColors[job.status as keyof typeof statusColors] || ''}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary_min && job.salary_max
                              ? `$${job.salary_min} - $${job.salary_max}`
                              : job.salary_min
                              ? `From $${job.salary_min}`
                              : `Up to $${job.salary_max}`}
                          </span>
                        )}
                        {job.category && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.category}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {t('jobs.deadline')}: {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('jobs.jobDescription')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.about_company && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">{t('jobs.aboutCompany')}</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{job.about_company}</p>
                      </div>
                    </>
                  )}

                  {job.requirements && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">{t('jobs.requirements')}</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                      </div>
                    </>
                  )}

                  {job.project_summary && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">{t('jobs.projectSummary')}</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{job.project_summary}</p>
                      </div>
                    </>
                  )}

                  {job.duration && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">{t('jobs.duration')}</h3>
                        <p className="text-muted-foreground">{job.duration}</p>
                      </div>
                    </>
                  )}

                  {job.estimated_start_date && (
                    <div>
                      <h3 className="font-semibold mb-2">{t('jobs.estimatedStartDate')}</h3>
                      <p className="text-muted-foreground">{new Date(job.estimated_start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('jobs.jobInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {job.created_at && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.postedOn')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.sector && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.sector')}</p>
                          <p className="text-sm text-muted-foreground">{job.sector}</p>
                        </div>
                      </div>
                    )}

                    {job.experience_level && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.experienceLevel')}</p>
                          <p className="text-sm text-muted-foreground">{job.experience_level}</p>
                        </div>
                      </div>
                    )}

                    {job.type && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.jobType')}</p>
                          <p className="text-sm text-muted-foreground">{job.type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Share Card */}
              {company && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('jobs.companyInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.location')}</p>
                          <p className="text-sm text-muted-foreground">{company.location}</p>
                        </div>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-start gap-3">
                        <LinkIcon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.website')}</p>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {company.industry && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.industry')}</p>
                          <p className="text-sm text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>
                    )}

                    {company.size && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('jobs.companySize')}</p>
                          <p className="text-sm text-muted-foreground">{company.size}</p>
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

