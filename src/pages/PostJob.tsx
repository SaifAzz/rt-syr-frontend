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
import { jobsAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
        location: '',
        salary: '',
        type: '' as 'full-time' | 'part-time' | 'contract' | 'remote' | '',
        category: '',
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
            const jobData: any = {
                title: data.title,
                description: data.description,
                location: data.location,
                type: data.type as 'full-time' | 'part-time' | 'contract' | 'remote',
                category: data.category,
                status: 'open' as const,
                isVerified: false,
            };

            // Add salary if provided
            if (data.salary.trim()) {
                jobData.salary = data.salary;
            }

            // Set companyId based on user type
            // Note: JobRecord only has companyId, so organizations will need to use their companyId
            // if they have one, or the backend will need to handle organizationId
            if (user?.type === 'company' && user?.companyId) {
                jobData.companyId = user.companyId;
            } else if (user?.type === 'organization') {
                // Organizations might have a companyId if they're also registered as a company
                // Otherwise, use organizationId and let the backend handle it
                if (user?.companyId) {
                    jobData.companyId = user.companyId;
                } else if (user?.organizationId) {
                    // Try using organizationId - backend may need to map this to companyId
                    jobData.companyId = user.organizationId;
                } else {
                    throw new Error('Organization must have a company or organization ID to post jobs');
                }
            } else {
                throw new Error('User must be a company or organization to post jobs');
            }

            return await jobsAPI.create(jobData);
        },
        onSuccess: () => {
            toast.success('Job posted successfully!');
            queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['organization-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });

            // Navigate to appropriate dashboard
            if (user?.type === 'company') {
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
        if (!formData.title || !formData.description || !formData.location || !formData.type || !formData.category) {
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
                            <Link to={user?.type === 'company' ? '/dashboard/company' : '/dashboard/organization'}>
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
                                        <Label htmlFor="type">Job Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => handleChange('type', value)}
                                            required
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Select job type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jobTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                        <Label htmlFor="salary">Salary (Optional)</Label>
                                        <Input
                                            id="salary"
                                            placeholder="e.g., $1,500 - $2,500 or Negotiable"
                                            value={formData.salary}
                                            onChange={(e) => handleChange('salary', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Salary range or compensation details
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

