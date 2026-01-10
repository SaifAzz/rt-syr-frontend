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

  const [formData, setFormData] = useState({
    // 1. عنوان المناقصة
    title: '',
    // 2. اسم المعلن (المنظمة أو الشركة)
    publisher_name: '',
    // 3. الموقع الجغرافي
    location: '',
    // 4. أخر موعد للتقديم (تاريخ)
    deadline: '',
    // 5. نبذة عن المعلن (المنظمة أو الشركة)
    about_publisher: '',
    // 6. قطاع المناقصة
    sector: '',
    // 7. نبذة عن المشروع
    project_summary: '',
    // 8. المتطلبات
    requirements: '',
    // 9. رفع مستندات المناقصة
    tender_documents_link: '',
    file_upload_url: '',
    tender_document_file: null as File | null,
  });

  // قطاع المناقصة options
  const tenderSectors = [
    { value: 'WASH', labelAr: 'المياه والاصحاح', labelEn: 'Water and Sanitation' },
    { value: 'ELECTRICITY', labelAr: 'الكهرباء', labelEn: 'Electricity' },
    { value: 'FOOD', labelAr: 'الغذاء', labelEn: 'Food' },
    { value: 'CONSTRUCTION', labelAr: 'الإنشاءات', labelEn: 'Construction' },
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
    const publisherName = getPublisherName();
    if (publisherName) {
      setFormData(prev => {
        if (!prev.publisher_name) {
          return { ...prev, publisher_name: publisherName };
        }
        return prev;
      });
    }
  }, [user, myOrganizations, myCompanies]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tenderData: any = {
        userId: user?.id,
        title: data.title,
        description: data.project_summary || data.requirements || '', // Use project_summary or requirements as description
        status: 'active' as const,
      };

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
      if (data.tender_documents_link?.trim()) tenderData.tender_documents_link = data.tender_documents_link;

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
      if (user?.type === 'company') {
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
              <Link to={user?.type === 'company' ? '/dashboard/company' : '/dashboard/organization'}>
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

                {/* 9. رفع مستندات المناقصة / Upload Tender Document */}
                <div className="space-y-4">
                  <Label>{isArabic ? 'رفع مستند المناقصة' : 'Upload Tender Document'}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tender_documents_link">{isArabic ? 'رابط مستند المناقصة' : 'Tender Document Link'}</Label>
                      <Input
                        id="tender_documents_link"
                        type="url"
                        placeholder="https://example.com/tender-document"
                        value={formData.tender_documents_link}
                        onChange={(e) => handleChange('tender_documents_link', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tender_document_file">{isArabic ? 'رفع ملف PDF' : 'Upload PDF File'}</Label>
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
