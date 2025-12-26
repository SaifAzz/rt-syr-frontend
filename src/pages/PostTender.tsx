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
import { tendersAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    location: '',
    deadline: '',
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

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tenderData: any = {
        ...data,
        status: 'open' as const,
        isVerified: false,
      };

      // Set companyId or organizationId based on user type
      if (user?.type === 'company' && user?.companyId) {
        tenderData.companyId = user.companyId;
      } else if (user?.type === 'organization' && user?.organizationId) {
        tenderData.organizationId = user.organizationId;
      } else {
        throw new Error('User must be a company or organization to post tenders');
      }

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
    
    // Validation
    if (!formData.title || !formData.description || !formData.location || !formData.deadline || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

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
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Damascus, Aleppo, National"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      required
                    />
                  </div>

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={today}
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The deadline for submitting proposals
                  </p>
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

