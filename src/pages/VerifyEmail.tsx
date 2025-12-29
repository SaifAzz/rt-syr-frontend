import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const { user, verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from URL params or user object
    const paramUserId = searchParams.get('userId');
    if (paramUserId) {
      setUserId(paramUserId);
    } else if (user?.id) {
      setUserId(user.id);
    } else {
      navigate('/login');
    }
  }, [searchParams, user, navigate]);

  if (!userId) {
    return null; // Will navigate in useEffect
  }

  if (user && (user.email_verified || user.emailVerified)) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userId) {
        setError('User ID not found');
        return;
      }

      const result = await verifyEmail(userId, code);
      
      // After verification, we get tokens - fetch user profile or update user
      // The verifyEmail function in AuthContext should handle this
      setSuccess(true);
      
      // Navigate to dashboard after successful verification
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) {
      setError('User ID not found');
      return;
    }

    setResending(true);
    setError('');
    try {
      await resendVerificationCode(userId);
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {t('auth.emailVerification')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.checkEmail')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('auth.emailVerified')}
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
                  <Label htmlFor="code">{t('auth.verificationCode')}</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    required
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || success}>
                  {loading ? t('common.loading') : t('auth.verifyEmail')}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                  {t('auth.resendCode')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;



