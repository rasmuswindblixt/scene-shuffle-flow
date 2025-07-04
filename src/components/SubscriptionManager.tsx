import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle2 } from 'lucide-react';

const SubscriptionManager = () => {
  const { user, session, subscribed, freeExportsUsed, subscriptionTier, subscriptionEnd, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          Manage your Video Splitter subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {subscriptionTier} Plan
              </Badge>
            </div>
            
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                Renews on {formatDate(subscriptionEnd)}
              </p>
            )}
            
            <p className="text-sm text-green-600 font-medium">
              ✓ Unlimited exports
            </p>
            
            <Button 
              onClick={handleManageSubscription}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">
                Free Plan
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                You have {3 - freeExportsUsed} free exports remaining
              </p>
              <div className="bg-muted rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Free Exports</span>
                  <span className="text-sm font-bold">{freeExportsUsed}/3</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(freeExportsUsed / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <h4 className="font-semibold text-lg mb-2">Premium Plan</h4>
              <p className="text-2xl font-bold mb-1">$12.99<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm space-y-1 mb-3">
                <li>✓ Unlimited video uploads</li>
                <li>✓ AI-powered scene detection</li>
                <li>✓ Smart duration filtering</li>
                <li>✓ Intelligent scene shuffling</li>
                <li>✓ HD video export</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleSubscribe}
              disabled={loading}
              variant="hero"
              className="w-full"
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </Button>
          </div>
        )}
        
        <Button 
          onClick={checkSubscription}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;