import SelectableCard from './SelectableCard';
import { ROLE_OPTIONS } from '@/lib/onboarding-data';
import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepRoleSelection = ({ data, setData }: Props) => {
  const toggle = (value: string) => {
    const roles = data.roles.includes(value)
      ? data.roles.filter(r => r !== value)
      : [...data.roles, value];
    setData({ roles });
  };

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">How would you describe yourself?</h2>
        <p className="text-muted-foreground">We'll tailor the app to how you work. Select one or more.</p>
      </div>
      <div className="grid gap-3">
        {ROLE_OPTIONS.map(option => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.roles.includes(option.value)}
            onToggle={() => toggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepRoleSelection;
