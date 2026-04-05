import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { LOADING_STEPS } from '@/lib/onboarding-data';

interface Props {
  onComplete: () => void;
}

const StepLoading = ({ onComplete }: Props) => {
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show items and mark them as completed with staggered timing
    LOADING_STEPS.forEach((step, index) => {
      // Show the item
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, step.delay);

      // Complete the item 600ms after showing
      setTimeout(() => {
        setCompletedItems(prev => [...prev, index]);
      }, step.delay + 600);
    });

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.25; // ~100% in 8 seconds (80 ticks * 100ms)
      });
    }, 100);

    // Auto-advance after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, 8500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Building your profile...
          </p>
          <h2 className="text-2xl font-bold">Analyzing your workflow</h2>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{Math.round(Math.min(progress, 100))}%</p>
        </div>

        {/* Checklist */}
        <div className="space-y-4 text-left">
          {LOADING_STEPS.map((step, index) => {
            const isVisible = visibleItems.includes(index);
            const isCompleted = completedItems.includes(index);

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 transition-all duration-400
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}
                style={{
                  transitionDelay: '0ms',
                }}
              >
                {/* Icon/Check */}
                <div className="w-8 h-8 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-check-bounce">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>

                {/* Text */}
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepLoading;
