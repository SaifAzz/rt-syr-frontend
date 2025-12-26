import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Bookmark, 
  User, 
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { applicationsAPI, type ApplicationRecord } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');

  const { data: applications = [], isLoading } = useQuery<ApplicationRecord[]>({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await applicationsAPI.getAll({ userId: user.id });
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.user.title')}</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="applications">
                <FileText className="w-4 h-4 mr-2" />
                {t('dashboard.user.applications')}
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="w-4 h-4 mr-2" />
                {t('dashboard.user.savedJobs')}
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                {t('dashboard.user.profile')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('dashboard.user.noApplications')}</h3>
                    <p className="text-muted-foreground mb-4">
                      Start applying to jobs to see your applications here
                    </p>
                    <Button asChild>
                      <Link to="/jobs">{t('dashboard.user.applyNow')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {application.jobId ? 'Job Application' : 'Tender Application'}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Applied on {new Date(application.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(application.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {application.coverLetter && (
                          <p className="mt-4 text-sm line-clamp-2">{application.coverLetter}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
                  <p className="text-muted-foreground mb-4">
                    Save jobs you're interested in to view them here
                  </p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.user.profile')}</CardTitle>
                  <CardDescription>Manage your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-muted-foreground">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type</label>
                    <p className="text-muted-foreground capitalize">{user?.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Verified</label>
                    <p className="text-muted-foreground">
                      {user?.emailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;



