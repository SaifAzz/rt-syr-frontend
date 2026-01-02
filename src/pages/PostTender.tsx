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
import { tendersAPI, organizationsAPI } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostTender = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    sector: '' as 'WASH' | 'FSL' | 'EDUCATION' | 'HEALTH' | 'PROTECTION' | 'SHELTER' | 'NFI' | 'CCCM' | 'OTHER' | '',
    about_organization: '',
    project_summary: '',
    requirements: '',
    deadline: '',
    duration: '',
    estimated_start_date: '',
    tender_documents_link: '',
    file_upload_url: '',
    location: '',
    category: '',
  });

  const categories = [
    'Technology',
    'Construction',
    'Procurement',
    'Education',
    'Healthcare',
    'Transportation',
    'Agriculture',
    'Energy',
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

  // Fetch organization data to get IDs
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

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get organization_id from authenticated user
      const organizationId = user?.organization_id || user?.organizationId || myOrganizations[0]?.id;
      const tenderData: any = {
        userId: user?.id,
        title: data.title,
        description: data.description,
        organization_id: organizationId,
        status: 'active' as const,
      };

      // Add optional fields if provided
      if (data.type?.trim()) tenderData.type = data.type;
      if (data.sector) tenderData.sector = data.sector;
      if (data.about_organization?.trim()) tenderData.about_organization = data.about_organization;
      if (data.project_summary?.trim()) tenderData.project_summary = data.project_summary;
      if (data.requirements?.trim()) tenderData.requirements = data.requirements;
      if (data.deadline?.trim()) {
        const deadlineDate = new Date(data.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          tenderData.deadline = deadlineDate.toISOString();
        }
      }
      if (data.duration?.trim()) tenderData.duration = data.duration;
      if (data.estimated_start_date?.trim()) {
        const startDate = new Date(data.estimated_start_date);
        if (!isNaN(startDate.getTime())) {
          tenderData.estimated_start_date = startDate.toISOString();
        }
      }
      if (data.tender_documents_link?.trim()) tenderData.tender_documents_link = data.tender_documents_link;
      if (data.file_upload_url?.trim()) tenderData.file_upload_url = data.file_upload_url;
      if (data.location?.trim()) tenderData.location = data.location;
      if (data.category?.trim()) tenderData.category = data.category;

      return await tendersAPI.create(tenderData);
    },
    onSuccess: () => {
      toast.success('Tender posted successfully!');
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
      toast.error(error.message || 'Failed to post tender');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - only title and description are required according to API
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields (Title and Description)');
      return;
    }

    // Validate deadline is in the future if provided
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        toast.error('Deadline must be in the future');
        return;
      }
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date/time (now) for datetime-local inputs
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const today = `${year}-${month}-${day}T${hours}:${minutes}`;

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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              {t('dashboard.organization.postTender')}
            </h1>
            <p className="text-muted-foreground">
              Create a new tender opportunity for potential bidders
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tender Details</CardTitle>
              <CardDescription>
                Fill in the information about your tender opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., IT Infrastructure Upgrade Project"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the tender requirements, scope of work, and any specific qualifications needed..."
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
                      placeholder="e.g., Construction, Procurement"
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
                  <Label htmlFor="about_organization">About Organization (Optional)</Label>
                  <Textarea
                    id="about_organization"
                    placeholder="Tell us about your organization..."
                    value={formData.about_organization}
                    onChange={(e) => handleChange('about_organization', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_summary">Project Summary (Optional)</Label>
                  <Textarea
                    id="project_summary"
                    placeholder="Provide a summary of the project this tender is for..."
                    value={formData.project_summary}
                    onChange={(e) => handleChange('project_summary', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the requirements, qualifications, and skills needed..."
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Damascus, Aleppo, National"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                    />
                  </div>

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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      min={today}
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The deadline for submitting proposals
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Optional)</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 12 months, 1 year"
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
                      placeholder="https://example.com/tender-documents"
                      value={formData.tender_documents_link}
                      onChange={(e) => handleChange('tender_documents_link', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_upload_url">File Upload URL (Optional)</Label>
                    <Input
                      id="file_upload_url"
                      type="url"
                      placeholder="https://storage.example.com/files/tender.pdf"
                      value={formData.file_upload_url}
                      onChange={(e) => handleChange('file_upload_url', e.target.value)}
                    />
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
                    {mutation.isPending ? 'Posting...' : 'Post Tender'}
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

