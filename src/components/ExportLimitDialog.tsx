import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Zap, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';

interface ExportLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportCount: number;
  trialStatus: 'active' | 'expired' | 'converted';
}

const ExportLimitDialog: React.FC<ExportLimitDialogProps> = ({
  open,
  onOpenChange,
  exportCount,
  trialStatus
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    track('trial_expired_upgrade_click', { 
      export_count: exportCount, 
      trial_status: trialStatus 
    });
    navigate('/checkout');
    onOpenChange(false);
  };

  const handleClose = () => {
    track('trial_expired_maybe_later', { 
      export_count: exportCount, 
      trial_status: trialStatus 
    });
    onOpenChange(false);
  };

  const features = [
    { icon: <Zap className="w-4 h-4" />, text: "Unlimited video exports" },
    { icon: <Star className="w-4 h-4" />, text: "Priority processing" },
    { icon: <Crown className="w-4 h-4" />, text: "Advanced features" },
    { icon: <Check className="w-4 h-4" />, text: "No watermarks" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Free Trial Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base">
            You've used all {exportCount} of your free exports. Upgrade to continue creating amazing videos!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trial Status */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    FREE TRIAL
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {exportCount}/3 exports used
                  </span>
                </div>
                <div className="w-16 h-2 bg-orange-200 rounded-full">
                  <div className="w-full h-full bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Unlock Premium Features
              </h3>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="text-green-500">
                      {feature.icon}
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleClose}
              variant="ghost" 
              className="w-full text-gray-600"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>✨ Join thousands of satisfied creators</p>
            <p>🔒 Secure payment • Cancel anytime</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportLimitDialog;
