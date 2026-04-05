import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  onComplete: () => void;
}

const StepSuccess = ({ onComplete }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Celebration emoji */}
        <div className="text-6xl animate-pop-in">
          🎉
        </div>

        {/* Header */}
        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-3xl font-bold">Welcome to ClipMixPro!</h2>
          <p className="text-muted-foreground">Your account is activated. Start saving time right away.</p>
        </div>

        {/* Quick start guide */}
        <div
          className="bg-card/60 border border-border/50 rounded-xl p-6 text-left space-y-4 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            Three steps to get started
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-medium text-sm">Upload 1-3 competitor videos</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-medium text-sm">Let the app clip & shuffle automatically</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-medium text-sm">Pick your clips, export & publish</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Button
            onClick={() => navigate('/app')}
            variant="hero"
            className="w-full py-6 text-base font-bold rounded-xl"
          >
            Open ClipMixPro →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepSuccess;
