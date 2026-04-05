import { Button } from '@/components/ui/button';
import { getPersonalizedStats } from '@/lib/onboarding-data';

interface Props {
  uploadVolume: string | null;
  onNext: () => void;
}

const StepReveal = ({ uploadVolume, onNext }: Props) => {
  const stats = getPersonalizedStats(uploadVolume);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-500 uppercase tracking-wide animate-fade-in-up">
            Your profile is ready ✓
          </p>
          <h2 className="text-3xl font-bold animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            What ClipMixPro can do for you
          </h2>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <div
            className="bg-card/60 border border-border/50 rounded-xl p-4 space-y-1 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="text-3xl font-bold gradient-text">
              {stats.hoursSaved}h
            </div>
            <div className="text-xs text-muted-foreground">
              saved per week on editing
            </div>
          </div>

          <div
            className="bg-card/60 border border-border/50 rounded-xl p-4 space-y-1 animate-fade-in-up"
            style={{ animationDelay: '350ms' }}
          >
            <div className="text-3xl font-bold gradient-text">
              {stats.multiplier}x
            </div>
            <div className="text-xs text-muted-foreground">
              more videos in the same time
            </div>
          </div>

          <div
            className="bg-card/60 border border-border/50 rounded-xl p-4 space-y-1 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="text-3xl font-bold text-green-500">
              100%
            </div>
            <div className="text-xs text-muted-foreground">
              copyright-safe with 3-6.9s clips
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="bg-card/40 border border-border/30 rounded-xl p-6 text-left animate-fade-in-up"
          style={{ animationDelay: '650ms' }}
        >
          <p className="text-sm italic text-foreground/90 mb-3">
            "I went from 1 video per week to 5. ClipMixPro is the only tool I actually use every day."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
              MK
            </div>
            <div>
              <div className="text-sm font-medium">Marcus K.</div>
              <div className="text-xs text-muted-foreground">Finance Channel, 84k subscribers</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <Button
            onClick={onNext}
            variant="hero"
            className="w-full py-6 text-base font-bold rounded-xl"
          >
            Unlock my account →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepReveal;
