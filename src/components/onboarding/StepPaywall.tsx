import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Props {
  selectedPlan: 'monthly' | 'yearly' | null;
  onPlanChange: (plan: 'monthly' | 'yearly') => void;
}

const StepPaywall = ({ selectedPlan, onPlanChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const plan = selectedPlan || 'yearly';

  const handleCheckout = async (planOverride?: 'monthly' | 'yearly') => {
    const checkoutPlan = planOverride || plan;

    setLoading(true);
    try {
      // Get fresh session — signup with email confirmation may not have set it in context yet
      const activeSession = session || (await supabase.auth.getSession()).data.session;
      if (!activeSession) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to continue.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: checkoutPlan },
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not start payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited projects & uploads',
    'Auto-clip + shuffle + export',
    'Copyright-safe 3-6.9s algorithm',
    'All niches & formats',
    'Priority support',
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Almost there — Choose your plan</p>
          <h2 className="text-2xl font-bold">Start saving time today</h2>
        </div>

        {/* Plan cards */}
        <div className="grid gap-3">
          {/* Monthly */}
          <button
            onClick={() => onPlanChange('monthly')}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all duration-200
              ${plan === 'monthly'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card/60 hover:border-border'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Monthly</div>
                <div className="text-sm text-muted-foreground">Pay monthly, cancel anytime</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">$12.95</div>
                <div className="text-xs text-muted-foreground">/ month</div>
              </div>
            </div>
          </button>

          {/* Yearly (pre-selected) */}
          <button
            onClick={() => onPlanChange('yearly')}
            className={`
              relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200
              ${plan === 'yearly'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card/60 hover:border-border'
              }
            `}
          >
            <Badge className="absolute -top-2.5 left-4 bg-primary text-white border-0 text-xs">
              MOST POPULAR
            </Badge>
            <div className="flex items-center justify-between mt-1">
              <div>
                <div className="font-semibold">Yearly</div>
                <div className="text-sm text-muted-foreground">Pay once per year</div>
                <div className="text-sm font-medium text-green-500 mt-1">Save 39%</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">$95</div>
                <div className="text-xs text-muted-foreground">/ year (~$7.90/mo)</div>
              </div>
            </div>

            {/* Features list */}
            <div className="mt-4 pt-3 border-t border-border/20 space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>7-day money-back guarantee — no questions asked</span>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={() => handleCheckout()}
          disabled={loading}
          variant="hero"
          className="w-full py-6 text-base font-bold rounded-xl"
        >
          {loading ? 'Loading...' : 'Activate my account →'}
        </Button>

        {/* Secondary CTA */}
        {plan === 'yearly' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button
              onClick={() => handleCheckout('monthly')}
              disabled={loading}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Start with monthly plan ($12.95/mo)
            </Button>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Secure payment via Stripe · Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default StepPaywall;
