import SelectableCard from './SelectableCard';
import { GOAL_OPTIONS } from '@/lib/onboarding-data';
import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepGoals = ({ data, setData }: Props) => {
  const toggle = (value: string) => {
    const goals = data.goals.includes(value)
      ? data.goals.filter(g => g !== value)
      : [...data.goals, value];
    setData({ goals });
  };

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your goal with YouTube Automation?</h2>
        <p className="text-muted-foreground">Be honest — you can have multiple goals.</p>
      </div>
      <div className="grid gap-3">
        {GOAL_OPTIONS.map(option => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.goals.includes(option.value)}
            onToggle={() => toggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepGoals;
