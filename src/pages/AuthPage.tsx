import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

type AuthMode = 'signin' | 'signup' | 'forgot';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithProvider, resetPassword, user, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      if (mode === 'signup') {
        // for signup we might want to go to verify-email, but logic below handles it
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from, mode]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const { error } = await loginWithGoogle(credentialResponse.credential);
      if (error) {
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      return handleForgotPassword(e);
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });
          navigate('/verify-email');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have signed in successfully.',
          });
          // Redirect handled by useEffect
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'forgot') return 'Reset Password';
    if (mode === 'signup') return 'Create Account';
    return 'Sign In';
  };

  const getSubtitle = () => {
    if (mode === 'forgot') return 'Enter your email to reset password';
    if (mode === 'signup') return 'Join the farming community';
    return 'Welcome back!';
  };

  // Show success screen for forgot password
  if (mode === 'forgot' && resetEmailSent) {
    return (
      <div className="min-h-screen bg-background max-w-[430px] mx-auto">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => {
              setMode('signin');
              setResetEmailSent(false);
            }}
            className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Reset Password</h1>
        </div>

        <div className="px-6 py-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We sent a password reset link to<br />
              <span className="font-medium text-foreground">{formData.email}</span>
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setMode('signin');
                setResetEmailSent(false);
              }}
              className="w-full h-12"
            >
              Back to Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => mode === 'forgot' ? setMode('signin') : navigate(-1)}
          className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{getHeaderTitle()}</h1>
      </div>

      <div className="px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Crop-Doc</h2>
          <p className="text-muted-foreground text-sm mt-1">{getSubtitle()}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your name"
                  className="pl-10 h-12"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'forgot'
                ? 'Send Reset Link'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
          </Button>
        </motion.form>

        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            {/* Google Sign In */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex justify-center"
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast({
                    title: 'Google Sign-In failed',
                    description: 'Could not connect to Google.',
                    variant: 'destructive',
                  });
                }}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text={mode === 'signin' ? 'signin_with' : 'signup_with'}
                width="100%"
              />
            </motion.div>
          </>
        )}

        {/* Toggle mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          {mode === 'forgot' ? (
            <p className="text-muted-foreground">
              Remember your password?
              <button
                onClick={() => setMode('signin')}
                className="text-primary font-medium ml-1 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-primary font-medium ml-1 hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
