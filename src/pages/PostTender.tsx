import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tendersAPI, organizationsAPI, companiesAPI, uploadAPI } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostTender = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isArabic = i18n.language.startsWith('ar');
  const isAdmin = user?.role === 'admin' || user?.type === 'admin';

  // Fetch organization/company data to get names
  const { data: myOrganizations = [] } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: async () => {
      try {
        return await organizationsAPI.getMy();
      } catch {
        return [];
      }
    },
    enabled: (user?.role === 'organization' || user?.type === 'organization'),
  });

  const { data: myCompanies = [] } = useQuery({
    queryKey: ['my-companies'],
    queryFn: async () => {
      try {
        return await companiesAPI.getMy();
      } catch {
        return [];
      }
    },
    enabled: (user?.role === 'company' || user?.type === 'company'),
  });

  // For admin: fetch all companies and organizations
  const { data: allCompanies = [] } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      try {
        return await companiesAPI.getAll();
      } catch {
        return [];
      }
    },
    enabled: isAdmin,
  });

  const { data: allOrganizations = [] } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      try {
        return await organizationsAPI.getAll();
      } catch {
        return [];
      }
    },
    enabled: isAdmin,
  });

  const [formData, setFormData] = useState({
    // 1. عنوان المناقصة
    title: '',
    title_ar: '',
    // 2. اسم المعلن (المنظمة أو الشركة)
    publisher_name: '',
    // 3. الموقع الجغرافي
    location: '',
    location_ar: '',
    // 4. أخر موعد للتقديم (تاريخ)
    deadline: '',
    // 5. نبذة عن المعلن (المنظمة أو الشركة)
    about_publisher: '',
    about_organization_ar: '',
    // 6. قطاع المناقصة
    sector: '',
    category_ar: '',
    type_ar: '',
    // 7. نبذة عن المشروع
    project_summary: '',
    project_summary_ar: '',
    // 8. المتطلبات
    requirements: '',
    requirements_ar: '',
    // 9. رفع مستندات المناقصة
    tender_documents_link: '',
    file_upload_url: '',
    tender_document_file: null as File | null,
    // Additional fields
    duration: '',
    duration_ar: '',
    description_ar: '',
    // Admin fields
    selected_company_id: '',
    selected_organization_id: '',
    publisher_type: 'organization' as 'company' | 'organization',
  });

  // قطاع المناقصة options
  const tenderSectors = [
    { value: 'WASH', labelAr: 'المياه والاصحاح', labelEn: 'Water and Sanitation' },
    { value: 'FSL', labelAr: 'الأمن الغذائي وسبل العيش', labelEn: 'Food Security and Livelihoods' },
    { value: 'EDUCATION', labelAr: 'التعليم', labelEn: 'Education' },
    { value: 'HEALTH', labelAr: 'الصحة', labelEn: 'Health' },
    { value: 'PROTECTION', labelAr: 'الحماية', labelEn: 'Protection' },
    { value: 'SHELTER', labelAr: 'المأوى', labelEn: 'Shelter' },
    { value: 'NFI', labelAr: 'المواد غير الغذائية', labelEn: 'Non-Food Items' },
    { value: 'CCCM', labelAr: 'إدارة المخيمات', labelEn: 'Camp Coordination and Management' },
    { value: 'OTHER', labelAr: 'أخرى', labelEn: 'Other' },
  ];

  // Get publisher name from organization or company
  const getPublisherName = () => {
    if (isAdmin) {
      // For admin, use selected company/organization
      if (formData.publisher_type === 'organization' && formData.selected_organization_id) {
        const org = allOrganizations.find(o => o.id === formData.selected_organization_id);
        return org?.name || '';
      } else if (formData.publisher_type === 'company' && formData.selected_company_id) {
        const company = allCompanies.find(c => c.id === formData.selected_company_id);
        return company?.name || '';
      }
      return '';
    }
    if (user?.role === 'organization' || user?.type === 'organization') {
      const org = myOrganizations[0];
      return org?.name || user?.full_name || '';
    } else if (user?.role === 'company' || user?.type === 'company') {
      const company = myCompanies[0];
      return company?.name || user?.full_name || '';
    }
    return user?.full_name || '';
  };

  // Set publisher name on mount
  useEffect(() => {
    if (!isAdmin) {
      const publisherName = getPublisherName();
      if (publisherName) {
        setFormData(prev => {
          if (!prev.publisher_name) {
            return { ...prev, publisher_name: publisherName };
          }
          return prev;
        });
      }
    }
  }, [user, myOrganizations, myCompanies]);

  // For admin: update publisher name when selection changes
  useEffect(() => {
    if (isAdmin) {
      const publisherName = getPublisherName();
      setFormData(prev => ({ ...prev, publisher_name: publisherName }));
    }
  }, [formData.publisher_type, formData.selected_company_id, formData.selected_organization_id, allOrganizations, allCompanies]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tenderData: any = {
        userId: user?.id,
        title: data.title,
        description: data.project_summary || data.requirements || '', // Use project_summary or requirements as description
        status: 'active' as const,
      };

      // Set description_ar from Arabic fields if available
      if (data.description_ar?.trim()) {
        tenderData.description_ar = data.description_ar;
      } else if (data.project_summary_ar?.trim() || data.requirements_ar?.trim()) {
        tenderData.description_ar = data.project_summary_ar || data.requirements_ar || '';
      }

      // Add all optional fields
      if (data.location?.trim()) tenderData.location = data.location;
      if (data.deadline?.trim()) {
        const deadlineDate = new Date(data.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          tenderData.deadline = deadlineDate.toISOString();
        }
      }
      if (data.about_publisher?.trim()) tenderData.about_organization = data.about_publisher;
      if (data.sector) tenderData.sector = data.sector;
      if (data.project_summary?.trim()) tenderData.project_summary = data.project_summary;
      if (data.requirements?.trim()) tenderData.requirements = data.requirements;
      if (data.duration?.trim()) tenderData.duration = data.duration;
      if (data.tender_documents_link?.trim()) tenderData.tender_documents_link = data.tender_documents_link;

      // Add Arabic fields
      if (data.title_ar?.trim()) tenderData.title_ar = data.title_ar;
      if (data.location_ar?.trim()) tenderData.location_ar = data.location_ar;
      if (data.about_organization_ar?.trim()) tenderData.about_organization_ar = data.about_organization_ar;
      if (data.type_ar?.trim()) tenderData.type_ar = data.type_ar;
      if (data.category_ar?.trim()) tenderData.category_ar = data.category_ar;
      if (data.project_summary_ar?.trim()) tenderData.project_summary_ar = data.project_summary_ar;
      if (data.requirements_ar?.trim()) tenderData.requirements_ar = data.requirements_ar;
      if (data.duration_ar?.trim()) tenderData.duration_ar = data.duration_ar;
      if (data.description_ar?.trim()) tenderData.description_ar = data.description_ar;

      // Add company_id or organization_id for admin
      if (isAdmin) {
        if (data.publisher_type === 'company' && data.selected_company_id) {
          tenderData.company_id = data.selected_company_id;
        } else if (data.publisher_type === 'organization' && data.selected_organization_id) {
          tenderData.organization_id = data.selected_organization_id;
        }
      } else {
        // For regular users, use their company/organization
        if (user?.role === 'company' || user?.type === 'company') {
          const company = myCompanies[0];
          if (company?.id) tenderData.company_id = company.id;
        } else if (user?.role === 'organization' || user?.type === 'organization') {
          const org = myOrganizations[0];
          if (org?.id) tenderData.organization_id = org.id;
        }
      }

      // Handle PDF file upload
      if (data.tender_document_file) {
        try {
          const uploadResult = await uploadAPI.tenderDocument(data.tender_document_file);
          if (uploadResult?.url) {
            tenderData.file_upload_url = uploadResult.url;
          }
        } catch (error) {
          console.error('File upload failed:', error);
          toast.error(isArabic ? 'فشل رفع الملف' : 'File upload failed');
          throw error;
        }
      } else if (data.file_upload_url?.trim()) {
        tenderData.file_upload_url = data.file_upload_url;
      }

      return await tendersAPI.create(tenderData);
    },
    onSuccess: () => {
      toast.success(isArabic ? 'تم نشر المناقصة بنجاح!' : 'Tender posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['tenders'] });

      // Navigate to appropriate dashboard
      if (isAdmin) {
        navigate('/dashboard/admin');
      } else if (user?.type === 'company') {
        navigate('/dashboard/company');
      } else {
        navigate('/dashboard/organization');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (isArabic ? 'فشل في نشر المناقصة' : 'Failed to post tender'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Admin validation
    if (isAdmin) {
      if (!formData.selected_company_id && !formData.selected_organization_id) {
        toast.error(isArabic ? 'الرجاء اختيار شركة أو منظمة' : 'Please select a company or organization');
        return;
      }
    }

    // Validation
    if (!formData.title) {
      toast.error(isArabic ? 'الرجاء إدخال عنوان المناقصة' : 'Please enter the tender title');
      return;
    }

    if (!formData.location) {
      toast.error(isArabic ? 'الرجاء إدخال الموقع الجغرافي' : 'Please enter the geographic location');
      return;
    }

    if (!formData.deadline) {
      toast.error(isArabic ? 'الرجاء إدخال آخر موعد للتقديم' : 'Please enter the submission deadline');
      return;
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    if (deadlineDate <= today) {
      toast.error(isArabic
        ? 'يجب أن يكون آخر موعد للتقديم في المستقبل (لا يمكن اختيار تاريخ قديم)'
        : 'Deadline must be in the future (old dates are not allowed)');
      return;
    }

    if (!formData.sector) {
      toast.error(isArabic ? 'الرجاء اختيار قطاع المناقصة' : 'Please select the tender sector');
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date for deadline input
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to={isAdmin ? '/dashboard/admin' : user?.type === 'company' ? '/dashboard/company' : '/dashboard/organization'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              {isArabic ? 'نشر مناقصة' : 'Post a Tender'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'أنشئ فرصة مناقصة جديدة للمقدمين المحتملين' : 'Create a new tender opportunity for potential bidders'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تفاصيل المناقصة' : 'Tender Details'}</CardTitle>
              <CardDescription>
                {isArabic ? 'املأ المعلومات حول فرصة المناقصة الخاصة بك' : 'Fill in the information about your tender opportunity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Admin: Select Company or Organization */}
                {isAdmin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="publisher_type">{isArabic ? 'نوع المعلن *' : 'Publisher Type *'}</Label>
                      <Select
                        value={formData.publisher_type}
                        onValueChange={(value: 'company' | 'organization') => {
                          setFormData(prev => ({
                            ...prev,
                            publisher_type: value,
                            selected_company_id: value === 'company' ? prev.selected_company_id : '',
                            selected_organization_id: value === 'organization' ? prev.selected_organization_id : '',
                          }));
                        }}
                      >
                        <SelectTrigger id="publisher_type">
                          <SelectValue placeholder={isArabic ? 'اختر نوع المعلن' : 'Select publisher type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">{isArabic ? 'شركة' : 'Company'}</SelectItem>
                          <SelectItem value="organization">{isArabic ? 'منظمة' : 'Organization'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.publisher_type === 'company' && (
                      <div className="space-y-2">
                        <Label htmlFor="selected_company_id">{isArabic ? 'اختر الشركة *' : 'Select Company *'}</Label>
                        <Select
                          value={formData.selected_company_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, selected_company_id: value }))}
                        >
                          <SelectTrigger id="selected_company_id">
                            <SelectValue placeholder={isArabic ? 'اختر الشركة' : 'Select company'} />
                          </SelectTrigger>
                          <SelectContent>
                            {allCompanies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.publisher_type === 'organization' && (
                      <div className="space-y-2">
                        <Label htmlFor="selected_organization_id">{isArabic ? 'اختر المنظمة *' : 'Select Organization *'}</Label>
                        <Select
                          value={formData.selected_organization_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, selected_organization_id: value }))}
                        >
                          <SelectTrigger id="selected_organization_id">
                            <SelectValue placeholder={isArabic ? 'اختر المنظمة' : 'Select organization'} />
                          </SelectTrigger>
                          <SelectContent>
                            {allOrganizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {/* 1. عنوان المناقصة / Tender Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{isArabic ? 'عنوان المناقصة *' : 'Tender Title *'}</Label>
                  <Input
                    id="title"
                    placeholder={isArabic ? 'مثال: مشروع ترقية البنية التحتية لتقنية المعلومات' : 'e.g., IT Infrastructure Upgrade Project'}
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                {/* 1. عنوان المناقصة بالعربية / Tender Title (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="title_ar">{isArabic ? 'عنوان المناقصة بالعربية (اختياري)' : 'Tender Title (Arabic) (Optional)'}</Label>
                  <Input
                    id="title_ar"
                    placeholder={isArabic ? 'مثال: مناقصة مشروع البناء' : 'e.g., مناقصة مشروع البناء'}
                    value={formData.title_ar}
                    onChange={(e) => handleChange('title_ar', e.target.value)}
                  />
                </div>

                {/* 2. اسم المعلن / Publisher Name */}
                <div className="space-y-2">
                  <Label htmlFor="publisher_name">{isArabic ? 'اسم المعلن (المنظمة أو الشركة) *' : 'Publisher Name (Organization or Company) *'}</Label>
                  <Input
                    id="publisher_name"
                    placeholder={isArabic ? 'اسم المنظمة أو الشركة' : 'Organization or Company Name'}
                    value={formData.publisher_name}
                    onChange={(e) => handleChange('publisher_name', e.target.value)}
                    required
                  />
                </div>

                {/* 3. الموقع الجغرافي / Geographic Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">{isArabic ? 'الموقع الجغرافي *' : 'Geographic Location *'}</Label>
                  <Input
                    id="location"
                    placeholder={isArabic ? 'مثال: دمشق، حلب، وطني' : 'e.g., Damascus, Aleppo, National'}
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    required
                  />
                </div>

                {/* 3. الموقع الجغرافي بالعربية / Geographic Location (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="location_ar">{isArabic ? 'الموقع الجغرافي بالعربية (اختياري)' : 'Geographic Location (Arabic) (Optional)'}</Label>
                  <Input
                    id="location_ar"
                    placeholder={isArabic ? 'مثال: دمشق، سوريا' : 'e.g., دمشق، سوريا'}
                    value={formData.location_ar}
                    onChange={(e) => handleChange('location_ar', e.target.value)}
                  />
                </div>

                {/* 4. أخر موعد للتقديم / Submission Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">{isArabic ? 'أخر موعد للتقديم (تاريخ) *' : 'Submission Deadline (Date) *'}</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={today}
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'الموعد النهائي لتقديم العروض' : 'Deadline for submitting proposals'}
                  </p>
                </div>

                {/* 5. نبذة عن المعلن / About Publisher */}
                <div className="space-y-2">
                  <Label htmlFor="about_publisher">{isArabic ? 'نبذة عن المعلن (المنظمة أو الشركة) *' : 'About Publisher (Organization or Company) *'}</Label>
                  <Textarea
                    id="about_publisher"
                    placeholder={isArabic ? 'أخبرنا عن منظمتك أو شركتك...' : 'Tell us about your organization or company...'}
                    value={formData.about_publisher}
                    onChange={(e) => handleChange('about_publisher', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* 5. نبذة عن المعلن بالعربية / About Publisher (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="about_organization_ar">{isArabic ? 'نبذة عن المعلن بالعربية (اختياري)' : 'About Publisher (Arabic) (Optional)'}</Label>
                  <Textarea
                    id="about_organization_ar"
                    placeholder={isArabic ? 'أخبرنا عن منظمتك أو شركتك...' : 'أخبرنا عن منظمتك أو شركتك...'}
                    value={formData.about_organization_ar}
                    onChange={(e) => handleChange('about_organization_ar', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* 6. قطاع المناقصة / Tender Sector */}
                <div className="space-y-2">
                  <Label htmlFor="sector">{isArabic ? 'قطاع المناقصة *' : 'Tender Sector *'}</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => handleChange('sector', value)}
                  >
                    <SelectTrigger id="sector">
                      <SelectValue placeholder={isArabic ? 'اختر قطاع المناقصة' : 'Select tender sector'} />
                    </SelectTrigger>
                    <SelectContent>
                      {tenderSectors.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {isArabic ? sector.labelAr : sector.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 6. قطاع المناقصة بالعربية / Tender Sector (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="category_ar">{isArabic ? 'قطاع المناقصة بالعربية (اختياري)' : 'Tender Sector (Arabic) (Optional)'}</Label>
                  <Input
                    id="category_ar"
                    placeholder={isArabic ? 'مثال: بناء' : 'e.g., بناء'}
                    value={formData.category_ar}
                    onChange={(e) => handleChange('category_ar', e.target.value)}
                  />
                </div>

                {/* Type (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="type_ar">{isArabic ? 'نوع المناقصة بالعربية (اختياري)' : 'Tender Type (Arabic) (Optional)'}</Label>
                  <Input
                    id="type_ar"
                    placeholder={isArabic ? 'مثال: بناء' : 'e.g., بناء'}
                    value={formData.type_ar}
                    onChange={(e) => handleChange('type_ar', e.target.value)}
                  />
                </div>

                {/* 7. نبذة عن المشروع / Project Summary */}
                <div className="space-y-2">
                  <Label htmlFor="project_summary">{isArabic ? 'نبذة عن المشروع *' : 'Project Summary *'}</Label>
                  <Textarea
                    id="project_summary"
                    placeholder={isArabic ? 'قدم ملخصاً عن المشروع الذي تخصه هذه المناقصة...' : 'Provide a summary of the project this tender is for...'}
                    value={formData.project_summary}
                    onChange={(e) => handleChange('project_summary', e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                {/* 7. نبذة عن المشروع بالعربية / Project Summary (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="project_summary_ar">{isArabic ? 'نبذة عن المشروع بالعربية (اختياري)' : 'Project Summary (Arabic) (Optional)'}</Label>
                  <Textarea
                    id="project_summary_ar"
                    placeholder={isArabic ? 'قدم ملخصاً عن المشروع الذي تخصه هذه المناقصة...' : 'قدم ملخصاً عن المشروع الذي تخصه هذه المناقصة...'}
                    value={formData.project_summary_ar}
                    onChange={(e) => handleChange('project_summary_ar', e.target.value)}
                    rows={5}
                  />
                </div>

                {/* 8. المتطلبات / Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">{isArabic ? 'المتطلبات *' : 'Requirements *'}</Label>
                  <Textarea
                    id="requirements"
                    placeholder={isArabic
                      ? 'اشرح أهم المتطلبات في الإعلان مثل شركة لديها خبرة سابقة بعدد سنوات كذا أو مشاريع عدد كذا أو أي متطلبات أخرى...'
                      : 'Explain the main requirements in the announcement, such as a company with previous experience of X years or X number of projects, or any other requirements...'}
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                {/* 8. المتطلبات بالعربية / Requirements (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="requirements_ar">{isArabic ? 'المتطلبات بالعربية (اختياري)' : 'Requirements (Arabic) (Optional)'}</Label>
                  <Textarea
                    id="requirements_ar"
                    placeholder={isArabic
                      ? 'اشرح أهم المتطلبات في الإعلان مثل شركة لديها خبرة سابقة بعدد سنوات كذا أو مشاريع عدد كذا أو أي متطلبات أخرى...'
                      : 'اشرح أهم المتطلبات في الإعلان مثل شركة لديها خبرة سابقة بعدد سنوات كذا أو مشاريع عدد كذا أو أي متطلبات أخرى...'}
                    value={formData.requirements_ar}
                    onChange={(e) => handleChange('requirements_ar', e.target.value)}
                    rows={6}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">{isArabic ? 'المدة الزمنية (اختياري)' : 'Duration (Optional)'}</Label>
                  <Input
                    id="duration"
                    placeholder={isArabic ? 'مثال: 12 شهرًا' : 'e.g., 12 months'}
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                  />
                </div>

                {/* Duration (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="duration_ar">{isArabic ? 'المدة الزمنية بالعربية (اختياري)' : 'Duration (Arabic) (Optional)'}</Label>
                  <Input
                    id="duration_ar"
                    placeholder={isArabic ? 'مثال: 12 شهرًا' : 'e.g., 12 شهرًا'}
                    value={formData.duration_ar}
                    onChange={(e) => handleChange('duration_ar', e.target.value)}
                  />
                </div>

                {/* Description (Arabic) */}
                <div className="space-y-2">
                  <Label htmlFor="description_ar">{isArabic ? 'الوصف بالعربية (اختياري)' : 'Description (Arabic) (Optional)'}</Label>
                  <Textarea
                    id="description_ar"
                    placeholder={isArabic ? 'وصف تفصيلي بالعربية...' : 'وصف تفصيلي بالعربية...'}
                    value={formData.description_ar}
                    onChange={(e) => handleChange('description_ar', e.target.value)}
                    rows={6}
                  />
                </div>

                {/* 9. رفع مستندات المناقصة / Upload Tender Document */}
                <div className="space-y-4">
                  <Label>{isArabic ? 'رفع مستند المناقصة (اختياري)' : 'Upload Tender Document (Optional)'}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tender_documents_link">{isArabic ? 'رابط مستند المناقصة (اختياري)' : 'Tender Document Link (Optional)'}</Label>
                      <Input
                        id="tender_documents_link"
                        type="url"
                        placeholder="https://example.com/tender-document"
                        value={formData.tender_documents_link}
                        onChange={(e) => handleChange('tender_documents_link', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tender_document_file">{isArabic ? 'رفع ملف PDF (اختياري)' : 'Upload PDF File (Optional)'}</Label>
                      <Input
                        id="tender_document_file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type !== 'application/pdf') {
                              toast.error(isArabic ? 'يرجى رفع ملف PDF فقط' : 'Please upload a PDF file only');
                              return;
                            }
                            setFormData(prev => ({ ...prev, tender_document_file: file }));
                          }
                        }}
                      />
                      {formData.tender_document_file && (
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? 'تم اختيار الملف:' : 'Selected file:'} {formData.tender_document_file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? (isArabic ? 'جاري النشر...' : 'Posting...')
                      : (isArabic ? 'نشر المناقصة' : 'Post Tender')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostTender;
