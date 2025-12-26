import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '@/lib/api';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('rt@admin.com');
  const [password, setPassword] = useState('P@ss0rd$$');
  const [name, setName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await authAPI.signup(email, password, name, 'admin');
      
      // Auto-verify admin email for convenience
      if (result.user) {
        const verifiedUser = { ...result.user, emailVerified: true };
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        // Update the result user to be verified
        result.user = verifiedUser;
      }

      setSuccess(true);
      toast.success('Admin user created successfully!');
      
      // Auto-login the admin user
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/dashboard/admin');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create admin user. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Create Admin User
              </CardTitle>
              <CardDescription className="text-center">
                Create an administrator account to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Admin user created successfully! Redirecting to admin dashboard...
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Admin User"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || success}>
                  <Shield className="w-4 h-4 mr-2" />
                  {loading ? 'Creating Admin...' : success ? 'Admin Created!' : 'Create Admin User'}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>⚠️ This page should be removed or protected in production</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateAdmin;

