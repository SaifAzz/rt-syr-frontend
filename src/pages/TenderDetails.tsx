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
import { tendersAPI, organizationsAPI, companiesAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  MapPin,
  Building2,
  Clock,
  Calendar,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Shield,
  TrendingUp,
  Users,
  Award,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TenderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('auth.pleaseSignIn'));
      navigate('/login', { state: { from: `/tenders/${id}` } });
    }
  }, [user, navigate, id, t]);

  // Fetch tender details
  const { data: tender, isLoading: isLoadingTender, error: tenderError } = useQuery({
    queryKey: ['tender', id],
    queryFn: () => tendersAPI.getById(id!),
    enabled: !!id && !!user,
  });

  // Fetch organization/company details if tender is loaded
  const { data: organization } = useQuery({
    queryKey: ['organization', tender?.organization_id],
    queryFn: () => organizationsAPI.getById(tender!.organization_id!),
    enabled: !!tender?.organization_id,
  });

  const { data: company } = useQuery({
    queryKey: ['company', tender?.company_id],
    queryFn: () => companiesAPI.getById(tender!.company_id!),
    enabled: !!tender?.company_id && !tender?.organization_id,
  });

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoadingTender) {
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
                <p className="text-sm text-muted-foreground/70">Loading tender details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (tenderError || !tender) {
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
                  {t('tenders.tenderNotFound') || 'Tender not found or has been removed'}
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/tenders')} 
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('tenders.backToTenders') || 'Back to Tenders'}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusColors = {
    "active": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "open": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "closing_soon": "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "closed": "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    "draft": "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  };

  const publisher = organization || company;
  const isClosingSoon = tender.deadline && new Date(tender.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const daysUntilDeadline = tender.deadline 
    ? Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Helper function to get localized field value
  const getLocalizedField = (enValue?: string, arValue?: string) => {
    if (language === 'ar' && arValue) return arValue;
    return enValue || '';
  };

  // Get localized values
  const tenderTitle = getLocalizedField(tender.title, tender.title_ar);
  const tenderDescription = getLocalizedField(tender.description, tender.description_ar);
  const tenderLocation = getLocalizedField(tender.location, tender.location_ar);
  const tenderType = getLocalizedField(tender.type, tender.type_ar);
  const tenderDuration = getLocalizedField(tender.duration, tender.duration_ar);
  const tenderCategory = getLocalizedField(tender.category, tender.category_ar);
  const tenderAboutOrganization = getLocalizedField(tender.about_organization, tender.about_organization_ar);
  const tenderRequirements = getLocalizedField(tender.requirements, tender.requirements_ar);
  const tenderProjectSummary = getLocalizedField(tender.project_summary, tender.project_summary_ar);
  const publisherName = publisher ? getLocalizedField(publisher.name, publisher.name_ar) : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Back button with enhanced styling */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/tenders')}
              className="gap-2 hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('tenders.backToTenders') || 'Back to Tenders'}
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
                    {/* Enhanced Publisher logo */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20 shadow-md">
                        {publisher?.logo_url ? (
                          <img src={publisher.logo_url} alt={publisher.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-10 h-10 text-primary" />
                        )}
                      </div>
                      {publisher && (publisher as any).status === 'approved' && (
                        <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 border-2 border-background shadow-sm">
                          <CheckCircle className="w-4 h-4 text-success-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-3xl font-bold mb-3 leading-tight">{tenderTitle}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{publisherName || tenderAboutOrganization || 'Organization'}</span>
                            {publisher && (publisher as any).status === 'approved' && (
                              <Badge variant="outline" className="ml-2 border-success/30 text-success bg-success/5">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('common.verified') || 'Verified'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`${statusColors[tender.status as keyof typeof statusColors] || ''} border font-semibold px-3 py-1`}
                          >
                            {tender.status === 'active' || tender.status === 'open' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : null}
                            {tender.status}
                          </Badge>
                          {tender.sector && (
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-medium">
                              <Award className="w-3 h-3 mr-1" />
                              {tender.sector}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Info Bar */}
                      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                        {tenderLocation && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-foreground">{tenderLocation}</span>
                          </div>
                        )}
                        {tender.deadline && (
                          <div className={`flex items-center gap-2 text-sm font-medium ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isClosingSoon ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-primary/10'}`}>
                              <Calendar className={`w-4 h-4 ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
                            </div>
                            <div>
                              <span className="text-foreground">{t('tenders.deadline') || 'Deadline'}: </span>
                              <span className={isClosingSoon ? 'font-bold' : ''}>
                                {new Date(tender.deadline).toLocaleDateString()}
                              </span>
                              {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({daysUntilDeadline} {daysUntilDeadline === 1 ? t('tenders.day') : t('tenders.days')} {t('tenders.left')})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {tenderCategory && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-foreground">{tenderCategory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Enhanced Tender Description */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{t('tenders.tenderDescription') || 'Tender Description'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{tenderDescription}</p>
                  </div>

                  {tenderAboutOrganization && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold text-foreground">{t('tenders.aboutOrganization') || 'About Organization'}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tenderAboutOrganization}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {tenderProjectSummary && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-accent" />
                          <h3 className="text-lg font-bold text-foreground">{t('tenders.projectSummary') || 'Project Summary'}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tenderProjectSummary}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {tenderRequirements && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <h3 className="text-lg font-bold text-foreground">{t('tenders.requirements') || 'Requirements'}</h3>
                        </div>
                        <div className="pl-7">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tenderRequirements}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Tender Documents */}
              {(tender.tender_documents_link || tender.file_upload_url) && (
                <Card className="border-2 border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold">{t('tenders.tenderDocuments') || 'Tender Documents'}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    {tender.tender_documents_link && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start h-auto py-4 px-4 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                      >
                        <a
                          href={tender.tender_documents_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <LinkIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-foreground">{t('tenders.viewDocuments') || 'View Tender Documents'}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Open in new tab</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      </Button>
                    )}
                    {tender.file_upload_url && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start h-auto py-4 px-4 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                      >
                        <a
                          href={tender.file_upload_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Download className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-foreground">{t('tenders.downloadDocument') || 'Download Tender Document'}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">PDF Document</div>
                          </div>
                          <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Tender Info Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">{t('tenders.tenderInformation') || 'Tender Information'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    {tender.created_at && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('tenders.postedOn') || 'Posted On'}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(tender.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {tender.deadline && (
                      <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isClosingSoon ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800' : 'bg-muted/30 hover:bg-muted/50'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isClosingSoon ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
                          <Calendar className={`w-5 h-5 ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('tenders.deadline') || 'Deadline'}
                          </p>
                          <p className={`text-sm font-medium ${isClosingSoon ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>
                            {new Date(tender.deadline).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                            <p className={`text-xs mt-1 ${isClosingSoon ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                              {daysUntilDeadline} {daysUntilDeadline === 1 ? t('tenders.day') : t('tenders.days')} {t('tenders.remaining')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {tender.sector && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('tenders.sector') || 'Sector'}
                          </p>
                          <p className="text-sm font-medium text-foreground">{tender.sector}</p>
                        </div>
                      </div>
                    )}

                    {tenderCategory && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-info" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            {t('tenders.category') || 'Category'}
                          </p>
                          <p className="text-sm font-medium text-foreground">{tenderCategory}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TenderDetails;

