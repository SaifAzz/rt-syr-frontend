import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserPlus, Mail, Lock, User, Building2, Briefcase, AlertCircle, Phone } from 'lucide-react';
import type { UserType } from '@/contexts/AuthContext';

const Signup = () => {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserType>(
    (searchParams.get('type') as UserType) || 'job_seeker'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Map userType to role: job_seeker -> user, others stay the same
      const role = userType === 'job_seeker' ? 'user' : userType;
      
      // Call signup API
      const result = await signup(email, password, fullName, phone, role);
      
      // If company or organization, auto-create the profile
      if (userType === 'company' || userType === 'organization') {
        try {
          const { companiesAPI, organizationsAPI } = await import('@/lib/api');
          
          if (userType === 'company') {
            await companiesAPI.create({
              name: fullName,
              description: '',
              location: '',
              user_id: result.userId,
              status: 'pending',
            });
          } else if (userType === 'organization') {
            await organizationsAPI.create({
              name: fullName,
              description: '',
              location: '',
              user_id: result.userId,
              status: 'pending',
            });
          }
        } catch (createError: any) {
          // If company/org creation fails, still proceed with verification
          console.error('Failed to create company/organization:', createError);
          // Don't throw - user can create it later
        }
      }
      
      // Navigate to verify-email with userId
      navigate(`/verify-email?userId=${result.userId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: UserType) => {
    switch (type) {
      case 'job_seeker':
        return t('auth.jobSeeker');
      case 'company':
        return t('auth.company');
      case 'organization':
        return t('auth.organization');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {t('auth.signup')}
              </CardTitle>
              <CardDescription className="text-center">
                Create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">{t('auth.accountType')}</Label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="job_seeker" id="job_seeker" />
                      <Label htmlFor="job_seeker" className="flex items-center gap-2 cursor-pointer">
                        <Briefcase className="w-4 h-4" />
                        {t('auth.jobSeeker')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="w-4 h-4" />
                        {t('auth.company')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="organization" id="organization" />
                      <Label htmlFor="organization" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="w-4 h-4" />
                        {t('auth.organization')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {userType === 'company'
                      ? t('auth.companyName')
                      : userType === 'organization'
                      ? t('auth.organizationName')
                      : t('auth.fullName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={
                        userType === 'company'
                          ? 'Company Name'
                          : userType === 'organization'
                          ? 'Organization Name'
                          : 'Full Name'
                      }
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('auth.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? t('common.loading') : t('auth.signup')}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">{t('auth.alreadyHaveAccount')} </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('auth.signInHere')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;



