import SelectableCard from './SelectableCard';
import { PAIN_POINT_OPTIONS } from '@/lib/onboarding-data';
import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepPainPoints = ({ data, setData }: Props) => {
  const toggle = (value: string) => {
    const pain_points = data.pain_points.includes(value)
      ? data.pain_points.filter(p => p !== value)
      : [...data.pain_points, value];
    setData({ pain_points });
  };

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are your biggest challenges?</h2>
        <p className="text-muted-foreground">Select all that apply — you can choose multiple.</p>
      </div>
      <div className="grid gap-3">
        {PAIN_POINT_OPTIONS.map(option => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.pain_points.includes(option.value)}
            onToggle={() => toggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepPainPoints;
