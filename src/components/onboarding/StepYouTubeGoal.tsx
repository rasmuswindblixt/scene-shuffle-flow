import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepYouTubeGoal = ({ data, setData }: Props) => {
  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your #1 YouTube goal?</h2>
        <p className="text-muted-foreground">
          Write it down — people who define their goal are 42% more likely to achieve it. Or skip if you prefer.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          value={data.youtube_goal}
          onChange={(e) => setData({ youtube_goal: e.target.value })}
          placeholder='e.g. "Hit $3,000/month passive income from 3 channels within 6 months"'
          rows={4}
          className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          Optional — you can skip this step
        </p>
      </div>
    </div>
  );
};

export default StepYouTubeGoal;
