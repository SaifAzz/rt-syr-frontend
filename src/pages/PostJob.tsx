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
import { jobsAPI, companiesAPI, organizationsAPI } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Briefcase, ArrowLeft, Mail, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostJob = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isArabic = i18n.language.startsWith('ar');

    // Fetch company/organization data to get names
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

    const [formData, setFormData] = useState({
        // 1. العنوان
        title: '',
        // 2. اسم المعلن (منظمة او شركة)
        publisher_name: '',
        // 3. أخر موعد للتقديم
        deadline: '',
        // 4. الموقع الجغرافي
        location: '',
        // 5. شرح عن المعلن (منظمة او شركة)
        about_publisher: '',
        // 6. نوع الوظيفة
        employment_type: '',
        // 7. المدة الزمنية للعمل
        work_duration: '',
        // 8. شرح تفصيلي عن الوظيفة
        detailed_description: '',
        // 9. المتطلبات الرئيسية
        main_requirements: '',
        // 10. الراتب المخصص (اختياري)
        salary: '',
        // 11. كيفية التقديم على الوظيفة مع البريد الالكتروني
        application_method: '',
        application_email: '',
        // 12. قطاع العمل
        work_sector: '',
    });

    // نوع الوظيفة options / Job Type options
    const jobTypes = [
        { value: 'full-time', labelAr: 'وقت كامل', labelEn: 'Full-time' },
        { value: 'remote', labelAr: 'عن بعد', labelEn: 'Remote' },
        { value: 'part-time', labelAr: 'دوام جزئي', labelEn: 'Part-time' },
        { value: 'contract', labelAr: 'عقد', labelEn: 'Contract' },
    ];

    // المدة الزمنية للعمل options / Work Duration options
    const workDurations = [
        { value: '1-year', labelAr: 'سنة', labelEn: '1 Year' },
        { value: '1-year-renewable', labelAr: 'سنة قابلة للتجديد', labelEn: '1 Year Renewable' },
        { value: '6-months', labelAr: 'ستة أشهر', labelEn: '6 Months' },
        { value: '6-months-renewable', labelAr: 'ستة أشهر قابلة للتجديد', labelEn: '6 Months Renewable' },
        { value: '3-months', labelAr: 'ثلاثة أشهر', labelEn: '3 Months' },
        { value: '3-months-renewable', labelAr: 'ثلاثة أشهر قابلة للتجديد', labelEn: '3 Months Renewable' },
        { value: 'project-based', labelAr: 'حسب المشروع', labelEn: 'Project-based' },
        { value: 'indefinite', labelAr: 'غير محدد', labelEn: 'Indefinite' },
    ];

    // قطاع العمل options / Work Sector options
    const workSectors = [
        { value: 'WASH', labelAr: 'المياه والاصحاح', labelEn: 'Water and Sanitation' },
        { value: 'NUTRITION', labelAr: 'التغذية', labelEn: 'Nutrition' },
        { value: 'EARLY_RECOVERY', labelAr: 'التعافي المبكر', labelEn: 'Early Recovery' },
        { value: 'TECHNOLOGY', labelAr: 'التكنولوجيا', labelEn: 'Technology' },
        { value: 'MONITORING_EVALUATION', labelAr: 'المراقبة والتقييم', labelEn: 'Monitoring and Evaluation' },
        { value: 'PROGRAM_MANAGER', labelAr: 'مدير برنامج', labelEn: 'Program Manager' },
        { value: 'ASSISTANT_PROGRAM_MANAGER', labelAr: 'مساعد مدير برنامج', labelEn: 'Assistant Program Manager' },
        { value: 'HUMAN_RESOURCES', labelAr: 'موارد بشرية', labelEn: 'Human Resources' },
        { value: 'EXECUTIVE_DIRECTOR', labelAr: 'مدير تنفيذي', labelEn: 'Executive Director' },
        { value: 'GENERAL_MANAGER', labelAr: 'مدير عام', labelEn: 'General Manager' },
        { value: 'ADMINISTRATIVE', labelAr: 'الإداريين', labelEn: 'Administrative' },
        { value: 'PUBLIC_RELATIONS_MANAGER', labelAr: 'مدير علاقات عامة', labelEn: 'Public Relations Manager' },
        { value: 'FINANCE', labelAr: 'المالية', labelEn: 'Finance' },
        { value: 'LOGISTICS', labelAr: 'اللوجستيات', labelEn: 'Logistics' },
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
            const jobData: any = {
                userId: user?.id,
                title: data.title,
                description: data.detailed_description || data.main_requirements || '',
                status: 'active' as const,
            };

            // Add all optional fields
            if (data.deadline?.trim()) {
                const deadlineDate = new Date(data.deadline);
                if (!isNaN(deadlineDate.getTime())) {
                    jobData.deadline = deadlineDate.toISOString();
                }
            }
            if (data.location?.trim()) jobData.location = data.location;
            if (data.about_publisher?.trim()) jobData.about_company = data.about_publisher;
            if (data.employment_type) jobData.employment_type = data.employment_type;
            if (data.work_duration?.trim()) jobData.duration = data.work_duration;
            if (data.detailed_description?.trim()) jobData.description = data.detailed_description;
            if (data.main_requirements?.trim()) jobData.requirements = data.main_requirements;
            if (data.salary?.trim()) {
                // Try to parse salary range or single value
                // Support formats like: "1500$ - 2500$", "$1,500 - $2,500", "2000$", "$2,000"
                const salaryStr = data.salary.replace(/,/g, '').replace(/\$/g, '');
                const rangeMatch = salaryStr.match(/(\d+)\s*-\s*(\d+)/);
                if (rangeMatch) {
                    // Range format: min - max
                    jobData.salary_min = parseInt(rangeMatch[1]);
                    jobData.salary_max = parseInt(rangeMatch[2]);
                } else {
                    // Single value
                    const singleMatch = salaryStr.match(/(\d+)/);
                    if (singleMatch) {
                        const salaryValue = parseInt(singleMatch[1]);
                        jobData.salary_min = salaryValue;
                        jobData.salary_max = salaryValue;
                    }
                }
            }
            if (data.work_sector) jobData.sector = data.work_sector;
            if (data.work_sector) jobData.category = data.work_sector;

            // Store application method in a custom field or description
            if (data.application_method?.trim() || data.application_email?.trim()) {
                const applicationInfo = [
                    data.application_method,
                    data.application_email ? `البريد الإلكتروني: ${data.application_email}` : '',
                ].filter(Boolean).join('\n');
                jobData.requirements = (jobData.requirements || '') + '\n\nكيفية التقديم:\n' + applicationInfo;
            }

            return await jobsAPI.create(jobData);
        },
        onSuccess: () => {
            toast.success(isArabic ? 'تم نشر الوظيفة بنجاح!' : 'Job posted successfully!');
            queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['organization-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });

            // Navigate to appropriate dashboard
            const userRole = user?.role || user?.type;
            if (userRole === 'company' || userRole === 'job_seeker') {
                navigate('/dashboard/company');
            } else {
                navigate('/dashboard/organization');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || (isArabic ? 'فشل في نشر الوظيفة' : 'Failed to post job'));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title) {
            toast.error(isArabic ? 'الرجاء إدخال عنوان الوظيفة' : 'Please enter the job title');
            return;
        }

        if (!formData.deadline) {
            toast.error(isArabic ? 'الرجاء إدخال آخر موعد للتقديم' : 'Please enter the submission deadline');
            return;
        }

        if (!formData.location) {
            toast.error(isArabic ? 'الرجاء إدخال الموقع الجغرافي' : 'Please enter the geographic location');
            return;
        }

        if (!formData.employment_type) {
            toast.error(isArabic ? 'الرجاء اختيار نوع الوظيفة' : 'Please select the job type');
            return;
        }

        if (!formData.work_duration) {
            toast.error(isArabic ? 'الرجاء اختيار المدة الزمنية للعمل' : 'Please select the work duration');
            return;
        }

        if (!formData.detailed_description) {
            toast.error(isArabic ? 'الرجاء إدخال شرح تفصيلي عن الوظيفة' : 'Please enter a detailed job description');
            return;
        }

        if (!formData.work_sector) {
            toast.error(isArabic ? 'الرجاء اختيار قطاع العمل' : 'Please select the work sector');
            return;
        }

        mutation.mutate(formData);
    };

    const handleChange = (field: string, value: string) => {
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
                            <Link to={(user?.role === 'company' || user?.type === 'company') ? '/dashboard/company' : '/dashboard/organization'}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            {isArabic ? 'نشر وظيفة' : 'Post a Job'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isArabic ? 'أنشئ إعلان وظيفة جديد لجذب المرشحين المؤهلين' : 'Create a new job posting to attract qualified candidates'}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{isArabic ? 'تفاصيل الوظيفة' : 'Job Details'}</CardTitle>
                            <CardDescription>
                                {isArabic ? 'املأ المعلومات حول فرصة العمل الخاصة بك' : 'Fill in the information about your job opportunity'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 1. العنوان / Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">{isArabic ? 'العنوان *' : 'Title *'}</Label>
                                    <Input
                                        id="title"
                                        placeholder={isArabic ? 'مثال: مهندس برمجيات أول' : 'e.g., Senior Software Engineer'}
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 2. اسم المعلن / Publisher Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="publisher_name">{isArabic ? 'اسم المعلن (منظمة أو شركة) *' : 'Publisher Name (Organization or Company) *'}</Label>
                                    <Input
                                        id="publisher_name"
                                        placeholder={isArabic ? 'اسم المنظمة أو الشركة' : 'Organization or Company Name'}
                                        value={formData.publisher_name}
                                        onChange={(e) => handleChange('publisher_name', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 3. أخر موعد للتقديم / Submission Deadline */}
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">{isArabic ? 'أخر موعد للتقديم *' : 'Submission Deadline *'}</Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        min={today}
                                        value={formData.deadline}
                                        onChange={(e) => handleChange('deadline', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 4. الموقع الجغرافي / Geographic Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="location">{isArabic ? 'الموقع الجغرافي *' : 'Geographic Location *'}</Label>
                                    <Input
                                        id="location"
                                        placeholder={isArabic ? 'مثال: دمشق، حلب، عن بُعد' : 'e.g., Damascus, Aleppo, Remote'}
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 5. شرح عن المعلن / About Publisher */}
                                <div className="space-y-2">
                                    <Label htmlFor="about_publisher">{isArabic ? 'شرح عن المعلن (منظمة أو شركة) *' : 'About Publisher (Organization or Company) *'}</Label>
                                    <Textarea
                                        id="about_publisher"
                                        placeholder={isArabic ? 'أخبرنا عن منظمتك أو شركتك...' : 'Tell us about your organization or company...'}
                                        value={formData.about_publisher}
                                        onChange={(e) => handleChange('about_publisher', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                {/* 6. نوع الوظيفة / Job Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="employment_type">{isArabic ? 'نوع الوظيفة *' : 'Job Type *'}</Label>
                                    <Select
                                        value={formData.employment_type}
                                        onValueChange={(value) => handleChange('employment_type', value)}
                                    >
                                        <SelectTrigger id="employment_type">
                                            <SelectValue placeholder={isArabic ? 'اختر نوع الوظيفة' : 'Select job type'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {isArabic ? type.labelAr : type.labelEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 7. المدة الزمنية للعمل / Work Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor="work_duration">{isArabic ? 'المدة الزمنية للعمل *' : 'Work Duration *'}</Label>
                                    <Select
                                        value={formData.work_duration}
                                        onValueChange={(value) => handleChange('work_duration', value)}
                                    >
                                        <SelectTrigger id="work_duration">
                                            <SelectValue placeholder={isArabic ? 'اختر المدة الزمنية' : 'Select work duration'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workDurations.map((duration) => (
                                                <SelectItem key={duration.value} value={duration.value}>
                                                    {isArabic ? duration.labelAr : duration.labelEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 8. شرح تفصيلي عن الوظيفة / Detailed Job Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="detailed_description">{isArabic ? 'شرح تفصيلي عن الوظيفة *' : 'Detailed Job Description *'}</Label>
                                    <Textarea
                                        id="detailed_description"
                                        placeholder={isArabic
                                            ? 'قدم شرحاً تفصيلياً عن الوظيفة، المسؤوليات، المهام، وأي معلومات أخرى ذات صلة...'
                                            : 'Provide a detailed description of the job, responsibilities, tasks, and any other relevant information...'}
                                        value={formData.detailed_description}
                                        onChange={(e) => handleChange('detailed_description', e.target.value)}
                                        rows={8}
                                        required
                                    />
                                </div>

                                {/* 9. المتطلبات الرئيسية / Main Requirements */}
                                <div className="space-y-2">
                                    <Label htmlFor="main_requirements">{isArabic ? 'المتطلبات الرئيسية *' : 'Main Requirements *'}</Label>
                                    <Textarea
                                        id="main_requirements"
                                        placeholder={isArabic
                                            ? 'اذكر المتطلبات الرئيسية مثل الشهادات، سنوات الخبرة، اللغات، المهارات المطلوبة...'
                                            : 'Mention the main requirements such as certificates, years of experience, languages, required skills...'}
                                        value={formData.main_requirements}
                                        onChange={(e) => handleChange('main_requirements', e.target.value)}
                                        rows={6}
                                        required
                                    />
                                </div>

                                {/* 10. الراتب المخصص / Salary (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="salary">{isArabic ? 'الراتب المخصص (اختياري)' : 'Salary (Optional)'}</Label>
                                    <Input
                                        id="salary"
                                        placeholder={isArabic ? 'مثال: 1500$ - 2500$ أو 2000$' : 'e.g., $1,500 - $2,500 or $2,000'}
                                        value={formData.salary}
                                        onChange={(e) => handleChange('salary', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {isArabic ? 'يمكنك إدخال نطاق راتب أو مبلغ محدد' : 'You can enter a salary range or a specific amount'}
                                    </p>
                                </div>

                                {/* 11. كيفية التقديم / How to Apply */}
                                <div className="space-y-4">
                                    <Label>{isArabic ? 'كيفية التقديم على الوظيفة *' : 'How to Apply *'}</Label>
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="application_method">{isArabic ? 'طريقة التقديم' : 'Application Method'}</Label>
                                            <Textarea
                                                id="application_method"
                                                placeholder={isArabic ? 'اشرح كيفية التقديم على الوظيفة...' : 'Explain how to apply for the job...'}
                                                value={formData.application_method}
                                                onChange={(e) => handleChange('application_method', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="application_email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                                            <Input
                                                id="application_email"
                                                type="email"
                                                placeholder="jobs@example.com"
                                                value={formData.application_email}
                                                onChange={(e) => handleChange('application_email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 12. قطاع العمل / Work Sector */}
                                <div className="space-y-2">
                                    <Label htmlFor="work_sector">{isArabic ? 'قطاع العمل *' : 'Work Sector *'}</Label>
                                    <Select
                                        value={formData.work_sector}
                                        onValueChange={(value) => handleChange('work_sector', value)}
                                    >
                                        <SelectTrigger id="work_sector">
                                            <SelectValue placeholder={isArabic ? 'اختر قطاع العمل' : 'Select work sector'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workSectors.map((sector) => (
                                                <SelectItem key={sector.value} value={sector.value}>
                                                    {isArabic ? sector.labelAr : sector.labelEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            : (isArabic ? 'نشر الوظيفة' : 'Post Job')}
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

export default PostJob;
