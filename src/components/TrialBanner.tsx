import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';

interface TrialBannerProps {
  className?: string;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ className = '' }) => {
  const { subscribed, trialStatus, remainingExports, exportCount } = useAuth();
  const navigate = useNavigate();

  // Don't show banner for subscribed users
  if (subscribed) {
    return null;
  }

  const handleUpgrade = () => {
    const urgency = getTrialUrgency();
    track('trial_banner_upgrade_click', { 
      export_count: exportCount, 
      trial_status: trialStatus,
      remaining_exports: remainingExports,
      urgency: urgency
    });
    navigate('/checkout');
  };

  const getTrialProgress = () => {
    const totalTrialExports = 3;
    const usedExports = exportCount;
    return (usedExports / totalTrialExports) * 100;
  };

  const getTrialStatusColor = () => {
    if (trialStatus === 'expired') return 'bg-red-500';
    if (remainingExports === 1) return 'bg-yellow-500';
    if (remainingExports === 2) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTrialStatusIcon = () => {
    if (trialStatus === 'expired') return <AlertTriangle className="w-4 h-4" />;
    if (remainingExports <= 1) return <Zap className="w-4 h-4" />;
    return <Crown className="w-4 h-4" />;
  };

  const getTrialMessage = () => {
    if (trialStatus === 'expired') {
      return 'Free trial expired - Subscribe to continue';
    }
    if (remainingExports === 0) {
      return 'Last free export used - Upgrade for unlimited exports';
    }
    if (remainingExports === 1) {
      return '1 free export remaining';
    }
    return `${remainingExports} free exports remaining`;
  };

  const getTrialUrgency = () => {
    if (trialStatus === 'expired' || remainingExports === 0) return 'urgent';
    if (remainingExports === 1) return 'warning';
    return 'info';
  };

  const urgency = getTrialUrgency();

  return (
    <div className={`w-full ${className}`}>
      {/* Main Banner */}
      <div className="flex items-center justify-between px-4 py-3 text-sm bg-card/60 backdrop-blur-sm border-b border-primary/10 transition-colors">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-white
            ${getTrialStatusColor()}
          `}>
            {getTrialStatusIcon()}
          </div>

          {/* Message and Progress */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{getTrialMessage()}</span>
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-2 py-0.5 border
                  ${urgency === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                  ${urgency === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                  ${urgency === 'info' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                `}
              >
                FREE TRIAL
              </Badge>
            </div>
            
            {/* Progress Bar - only show if trial is active */}
            {trialStatus === 'active' && (
              <div className="flex items-center gap-2 min-w-0">
                <Progress 
                  value={getTrialProgress()} 
                  className="h-2 w-32"
                />
                <span className="text-xs opacity-75 whitespace-nowrap">
                  {exportCount}/3 used
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="whitespace-nowrap font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {urgency === 'urgent' ? 'Subscribe Now' : 'Upgrade'}
        </Button>
      </div>
    </div>
  );
};

export default TrialBanner;
