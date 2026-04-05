import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingShellProps {
  currentStep: number;
  canContinue: boolean;
  isSaving: boolean;
  direction: 'forward' | 'backward';
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

const STEP_CTA_TEXT: Record<number, string> = {
  1: 'Continue',
  2: 'Continue',
  3: 'Continue',
  4: 'Continue',
  5: 'Continue',
  6: 'Continue',
  7: 'Continue',
  8: "Yes, I'm committed! →",
};

const OnboardingShell = ({
  currentStep,
  canContinue,
  isSaving,
  direction,
  onNext,
  onBack,
  children,
}: OnboardingShellProps) => {
  const showShellUI = currentStep >= 1 && currentStep <= 8;
  const showBackButton = currentStep >= 2 && currentStep <= 8;
  const progressWidth = `${(currentStep / 8) * 100}%`;

  if (!showShellUI) {
    return (
      <div
        key={currentStep}
        className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-[3px] bg-border/20">
        <div
          className="h-full bg-gradient-primary transition-all duration-500 ease-out"
          style={{ width: progressWidth }}
        />
      </div>

      {/* Header: back button + step counter */}
      <div className="container mx-auto px-6 pt-4 pb-2 flex items-center justify-between">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-sm text-muted-foreground">Step {currentStep} of 8</span>
      </div>

      {/* Step content */}
      <div className="flex-1 container mx-auto px-6 pb-24">
        <div
          key={currentStep}
          className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
        >
          {children}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/20">
        <div className="container mx-auto max-w-lg">
          <Button
            onClick={onNext}
            disabled={!canContinue || isSaving}
            variant="hero"
            className={`
              w-full py-6 text-base font-bold rounded-xl transition-opacity duration-200
              ${!canContinue ? 'opacity-35' : 'opacity-100'}
            `}
          >
            {isSaving ? 'Saving...' : STEP_CTA_TEXT[currentStep] || 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingShell;
