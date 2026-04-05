import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StepCreateAccountProps {
  onComplete: (userId: string) => void;
}

const StepCreateAccount = ({ onComplete }: StepCreateAccountProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password || password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 8) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { label: 'Fair', color: 'bg-yellow-500', width: '66%' };
    }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        if (error.message?.includes('already registered')) {
          setErrors({ email: 'This email is already registered' });
        } else {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
        return;
      }

      // Use the user from signup response directly
      if (data?.user) {
        onComplete(data.user.id);
        return;
      }

      // Fallback: try to get user from session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        onComplete(currentUser.id);
      } else {
        toast({ title: 'Check your email', description: 'Please verify your email to continue.', variant: 'default' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/onboarding?step=1` },
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Google sign-in failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold">Get Started with ClipMixPro</h1>
          <p className="text-muted-foreground mt-1">Create your account — it takes 30 seconds</p>
        </div>

        {/* Google OAuth */}
        <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" className="w-full py-5">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="onb-email">Email address</Label>
            <Input
              id="onb-email" type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              placeholder="you@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="onb-password">Password</Label>
            <Input
              id="onb-password" type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
              placeholder="At least 8 characters"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            {strength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="onb-confirm">Confirm password</Label>
            <Input
              id="onb-confirm" type="password" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirm: undefined })); }}
              placeholder="Re-enter your password"
              className={errors.confirm ? 'border-red-500' : ''}
            />
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
          </div>

          <Button type="submit" disabled={loading} variant="hero" className="w-full py-5 font-bold">
            {loading ? 'Creating account...' : 'Create Account →'}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate('/auth')} className="text-primary hover:underline font-medium">
            Sign in
          </button>
        </p>

        {/* Dev skip button */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <button
            onClick={() => onComplete('dev-skip')}
            className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground py-2"
          >
            [Dev] Skip step
          </button>
        )}
      </div>
    </div>
  );
};

export default StepCreateAccount;
