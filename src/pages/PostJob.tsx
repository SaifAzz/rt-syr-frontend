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
        requirements: '',
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

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // Get company/organization ID
            const userRole = user?.role || user?.type;
            let companyId: string | undefined;

            if (userRole === 'company' || userRole === 'job_seeker') {
                // For companies, get company_id from user or from myCompanies
                companyId = user?.company_id || user?.companyId || myCompanies[0]?.id;
                if (!companyId) {
                    throw new Error('Company ID not found. Please ensure your company profile is set up.');
                }
            } else if (userRole === 'organization') {
                // For organizations, they typically can't post jobs, but if they can, use organization_id
                // Note: According to API, jobs require company_id, so organizations might need a company profile
                companyId = user?.company_id || user?.companyId || myCompanies[0]?.id;
                const organizationId = user?.organization_id || user?.organizationId || myOrganizations[0]?.id;

                if (!companyId && !organizationId) {
                    throw new Error('Organization must have a company or organization ID to post jobs');
                }
                // If no companyId but has organizationId, use organizationId (backend may handle this)
                if (!companyId && organizationId) {
                    companyId = organizationId;
                }
            } else {
                throw new Error('User must be a company or organization to post jobs');
            }

            const jobData: any = {
                title: data.title,
                description: data.description,
                location: data.location,
                company_id: companyId,
                category: data.category,
                status: 'open' as const,
            };

            // Add employment_type if provided
            if (data.employment_type) {
                jobData.employment_type = data.employment_type;
            }

            // Add requirements if provided
            if (data.requirements.trim()) {
                jobData.requirements = data.requirements;
            }

            // Add experience_level if provided
            if (data.experience_level.trim()) {
                jobData.experience_level = data.experience_level;
            }

            // Add salary if provided
            if (data.salary_min.trim()) {
                jobData.salary_min = parseInt(data.salary_min);
            }
            if (data.salary_max.trim()) {
                jobData.salary_max = parseInt(data.salary_max);
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

        // Validation
        if (!formData.title || !formData.description || !formData.location || !formData.employment_type || !formData.category) {
            toast.error('Please fill in all required fields');
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
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g., Damascus, Aleppo, Remote"
                                            value={formData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employment_type">Job Type *</Label>
                                        <Select
                                            value={formData.employment_type}
                                            onValueChange={(value) => handleChange('employment_type', value)}
                                            required
                                        >
                                            <SelectTrigger id="employment_type">
                                                <SelectValue placeholder="Select job type" />
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
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => handleChange('category', value)}
                                            required
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

