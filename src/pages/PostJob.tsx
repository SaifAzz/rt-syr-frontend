import { useState } from 'react';
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
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostJob = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        sector: '' as 'WASH' | 'FSL' | 'EDUCATION' | 'HEALTH' | 'PROTECTION' | 'SHELTER' | 'NFI' | 'CCCM' | 'OTHER' | '',
        about_company: '',
        project_summary: '',
        requirements: '',
        deadline: '',
        duration: '',
        estimated_start_date: '',
        tender_documents_link: '',
        file_upload_url: '',
        location: '',
        salary_min: '',
        salary_max: '',
        employment_type: '' as 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | '',
        experience_level: '',
        category: '',
    });

    // Fetch company/organization data to get IDs
    const { data: myCompanies = [] } = useQuery({
        queryKey: ['my-companies'],
        queryFn: async () => {
            try {
                return await companiesAPI.getMy();
            } catch {
                return [];
            }
        },
        enabled: (user?.role === 'company' || user?.type === 'company') && !user?.company_id && !user?.companyId,
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
        enabled: (user?.role === 'organization' || user?.type === 'organization') && !user?.organization_id && !user?.organizationId,
    });

    const jobTypes = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
        { value: 'remote', label: 'Remote' },
    ];

    const categories = [
        'Technology',
        'Marketing',
        'Finance',
        'Design',
        'Management',
        'Sales',
        'Content',
        'Human Resources',
        'Healthcare',
        'Education',
        'Construction',
        'Other',
    ];

    const sectors = [
        { value: 'WASH', label: 'WASH' },
        { value: 'FSL', label: 'FSL' },
        { value: 'EDUCATION', label: 'Education' },
        { value: 'HEALTH', label: 'Health' },
        { value: 'PROTECTION', label: 'Protection' },
        { value: 'SHELTER', label: 'Shelter' },
        { value: 'NFI', label: 'NFI' },
        { value: 'CCCM', label: 'CCCM' },
        { value: 'OTHER', label: 'Other' },
    ];

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // Get company/organization ID
            const userRole = user?.role || user?.type;
            const companyId = user?.company_id || user?.companyId || myCompanies[0]?.id;
            const jobData: any = {
                userId: user?.id,
                title: data.title,
                description: data.description,
                company_id: companyId,
                status: 'active' as const,
            };

            // Add optional fields if provided
            if (data.type?.trim()) jobData.type = data.type;
            if (data.sector) jobData.sector = data.sector;
            if (data.about_company?.trim()) jobData.about_company = data.about_company;
            if (data.project_summary?.trim()) jobData.project_summary = data.project_summary;
            if (data.requirements?.trim()) jobData.requirements = data.requirements;
            if (data.deadline?.trim()) {
                const deadlineDate = new Date(data.deadline);
                if (!isNaN(deadlineDate.getTime())) {
                    jobData.deadline = deadlineDate.toISOString();
                }
            }
            if (data.duration?.trim()) jobData.duration = data.duration;
            if (data.estimated_start_date?.trim()) {
                const startDate = new Date(data.estimated_start_date);
                if (!isNaN(startDate.getTime())) {
                    jobData.estimated_start_date = startDate.toISOString();
                }
            }
            if (data.tender_documents_link?.trim()) jobData.tender_documents_link = data.tender_documents_link;
            if (data.file_upload_url?.trim()) jobData.file_upload_url = data.file_upload_url;
            if (data.location?.trim()) jobData.location = data.location;
            if (data.category?.trim()) jobData.category = data.category;
            if (data.employment_type) jobData.employment_type = data.employment_type;
            if (data.experience_level?.trim()) jobData.experience_level = data.experience_level;
            if (data.salary_min?.trim()) {
                const minSalary = parseInt(data.salary_min);
                if (!isNaN(minSalary)) jobData.salary_min = minSalary;
            }
            if (data.salary_max?.trim()) {
                const maxSalary = parseInt(data.salary_max);
                if (!isNaN(maxSalary)) jobData.salary_max = maxSalary;
            }

            return await jobsAPI.create(jobData);
        },
        onSuccess: () => {
            toast.success('Job posted successfully!');
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
            toast.error(error.message || 'Failed to post job');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation - only title and description are required according to API
        if (!formData.title || !formData.description) {
            toast.error('Please fill in all required fields (Title and Description)');
            return;
        }

        mutation.mutate(formData);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
                    <div className="mb-6">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link to={(user?.role === 'company' || user?.type === 'company') ? '/dashboard/company' : '/dashboard/organization'}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            Post a Job
                        </h1>
                        <p className="text-muted-foreground">
                            Create a new job posting to attract qualified candidates
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>
                                Fill in the information about your job opportunity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Job Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide a detailed description of the job, including responsibilities, requirements, qualifications, and any other relevant information..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={8}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type (Optional)</Label>
                                        <Input
                                            id="type"
                                            placeholder="e.g., Full-time, Part-time, Contract"
                                            value={formData.type}
                                            onChange={(e) => handleChange('type', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sector">Sector (Optional)</Label>
                                        <Select
                                            value={formData.sector}
                                            onValueChange={(value) => handleChange('sector', value)}
                                        >
                                            <SelectTrigger id="sector">
                                                <SelectValue placeholder="Select sector" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectors.map((sector) => (
                                                    <SelectItem key={sector.value} value={sector.value}>
                                                        {sector.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="about_company">About Company (Optional)</Label>
                                    <Textarea
                                        id="about_company"
                                        placeholder="Tell us about your company..."
                                        value={formData.about_company}
                                        onChange={(e) => handleChange('about_company', e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="project_summary">Project Summary (Optional)</Label>
                                    <Textarea
                                        id="project_summary"
                                        placeholder="Provide a summary of the project this job is part of..."
                                        value={formData.project_summary}
                                        onChange={(e) => handleChange('project_summary', e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location (Optional)</Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g., Damascus, Aleppo, Remote"
                                            value={formData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employment_type">Employment Type (Optional)</Label>
                                        <Select
                                            value={formData.employment_type}
                                            onValueChange={(value) => handleChange('employment_type', value)}
                                        >
                                            <SelectTrigger id="employment_type">
                                                <SelectValue placeholder="Select employment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Remote">Remote</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requirements">Requirements (Optional)</Label>
                                    <Textarea
                                        id="requirements"
                                        placeholder="List the requirements, qualifications, and skills needed for this position..."
                                        value={formData.requirements}
                                        onChange={(e) => handleChange('requirements', e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category (Optional)</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => handleChange('category', value)}
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience_level">Experience Level (Optional)</Label>
                                        <Input
                                            id="experience_level"
                                            placeholder="e.g., Senior, Mid-level, Entry-level"
                                            value={formData.experience_level}
                                            onChange={(e) => handleChange('experience_level', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                                        <Input
                                            id="deadline"
                                            type="datetime-local"
                                            value={formData.deadline}
                                            onChange={(e) => handleChange('deadline', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (Optional)</Label>
                                        <Input
                                            id="duration"
                                            placeholder="e.g., 6 months, 1 year"
                                            value={formData.duration}
                                            onChange={(e) => handleChange('duration', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_start_date">Estimated Start Date (Optional)</Label>
                                    <Input
                                        id="estimated_start_date"
                                        type="datetime-local"
                                        value={formData.estimated_start_date}
                                        onChange={(e) => handleChange('estimated_start_date', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tender_documents_link">Tender Documents Link (Optional)</Label>
                                        <Input
                                            id="tender_documents_link"
                                            type="url"
                                            placeholder="https://example.com/documents"
                                            value={formData.tender_documents_link}
                                            onChange={(e) => handleChange('tender_documents_link', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file_upload_url">File Upload URL (Optional)</Label>
                                        <Input
                                            id="file_upload_url"
                                            type="url"
                                            placeholder="https://storage.example.com/files/document.pdf"
                                            value={formData.file_upload_url}
                                            onChange={(e) => handleChange('file_upload_url', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salary_min">Minimum Salary (Optional)</Label>
                                        <Input
                                            id="salary_min"
                                            type="number"
                                            placeholder="e.g., 1500"
                                            value={formData.salary_min}
                                            onChange={(e) => handleChange('salary_min', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Minimum salary in USD
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="salary_max">Maximum Salary (Optional)</Label>
                                        <Input
                                            id="salary_max"
                                            type="number"
                                            placeholder="e.g., 2500"
                                            value={formData.salary_max}
                                            onChange={(e) => handleChange('salary_max', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum salary in USD
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? 'Posting...' : 'Post Job'}
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

