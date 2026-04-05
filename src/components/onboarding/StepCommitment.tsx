import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
}

const StepCommitment = ({ data }: Props) => {
  // Pick the first goal they selected to personalize the message
  const goalLabels: Record<string, string> = {
    side_income: 'building a side income',
    full_time: 'going full-time on YouTube',
    empire: 'building a content empire',
    agency_service: 'running a video agency',
  };

  const primaryGoal = data.goals[0];
  const goalText = goalLabels[primaryGoal] || 'reaching your YouTube goals';

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="text-5xl">🎯</div>
        <h2 className="text-2xl font-bold">You're on the right track</h2>
        <p className="text-muted-foreground">
          You've told us your goal is <span className="text-foreground font-medium">{goalText}</span>.
          ClipMixPro is built to get you there faster.
        </p>
      </div>

      <div className="bg-card/60 border border-border/50 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚡</span>
          <div className="text-sm">
            <span className="font-medium text-foreground">Save 10-40 hours per week</span>
            <span className="text-muted-foreground"> — automate the tedious parts of editing</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div className="text-sm">
            <span className="font-medium text-foreground">Stay copyright-safe</span>
            <span className="text-muted-foreground"> — our 3-6.9s algorithm keeps your channel protected</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">📈</span>
          <div className="text-sm">
            <span className="font-medium text-foreground">Scale faster</span>
            <span className="text-muted-foreground"> — publish 3-8x more content with the same effort</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Tap the button below to commit to your journey. Let's build something great.
      </p>
    </div>
  );
};

export default StepCommitment;
