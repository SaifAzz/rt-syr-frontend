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
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserPlus, Mail, Lock, User, Building2, Briefcase, AlertCircle, Phone, Link as LinkIcon, FileText } from 'lucide-react';
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
  const [driveLink, setDriveLink] = useState('');
  const [commercialFileUrl, setCommercialFileUrl] = useState('');
  const [userType, setUserType] = useState<UserType>(
    (searchParams.get('type') as UserType) || 'job_seeker'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password validation function
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[@$!%*?&]/.test(pwd)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate terms acceptance
    if (!acceptedTerms) {
      setError('You must accept the terms and conditions and privacy policy to continue');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate URLs if provided
    if (driveLink && !isValidUrl(driveLink)) {
      setError('Drive link must be a valid URL');
      return;
    }
    if (commercialFileUrl && !isValidUrl(commercialFileUrl)) {
      setError('Commercial file URL must be a valid URL');
      return;
    }

    setLoading(true);

    try {
      // Map userType to role: job_seeker -> user, others stay the same
      const role = userType === 'job_seeker' ? 'user' : userType;
      
      // Call signup API with optional fields
      const result = await signup(
        email,
        password,
        fullName,
        role,
        phone || undefined,
        driveLink || undefined,
        commercialFileUrl || undefined
      );
      
      // Always redirect to OTP verification page after successful signup
      // The API returns userId for OTP verification
      const userId = result.userId || result.requestId;
      
      if (userId) {
        // Redirect to OTP verification page immediately
        navigate(`/verify-email?userId=${userId}`, { replace: true });
      } else {
        // If no userId is returned, show error
        setError('Signup successful but no user ID received. Please contact support.');
      }
    } catch (err: any) {
      // Handle API error responses
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.message) {
        // Check if it's an array of validation errors
        if (Array.isArray(err.message)) {
          errorMessage = err.message.join(', ');
        } else {
          errorMessage = err.message;
        }
      } else if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
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
              {success && (
                <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <p className="font-semibold mb-2">Signup request submitted successfully!</p>
                    <p className="text-sm">
                      Your signup request has been submitted and is pending admin approval. 
                      You will be able to log in once your account is approved.
                    </p>
                    {requestId && (
                      <p className="text-xs mt-2 opacity-75">
                        Request ID: {requestId}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {!success && (
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
                  <Label htmlFor="phone">{t('auth.phone')} (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If provided, must be unique
                    </p>
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
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                  </p>
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
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveLink">Google Drive Link (Optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="driveLink"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commercialFileUrl">Commercial File URL (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="commercialFileUrl"
                      type="url"
                      placeholder="https://storage.example.com/commercial/file.pdf"
                      value={commercialFileUrl}
                      onChange={(e) => setCommercialFileUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I accept the{' '}
                    <Link to="/about#terms" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/about#privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? t('common.loading') : t('auth.signup')}
                </Button>
              </form>
              )}
              {!success && (
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">{t('auth.alreadyHaveAccount')} </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('auth.signInHere')}
                </Link>
              </div>
              )}
              {success && (
              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Go to Login
                </Link>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;



