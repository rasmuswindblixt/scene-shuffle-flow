import SelectableChip from './SelectableChip';
import { NICHE_GROUPS } from '@/lib/onboarding-data';
import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepNicheSelection = ({ data, setData }: Props) => {
  const toggle = (value: string) => {
    const niches = data.niches.includes(value)
      ? data.niches.filter(n => n !== value)
      : [...data.niches, value];
    setData({ niches });
  };

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What niches do you create content in?</h2>
        <p className="text-muted-foreground">Select all that apply — we'll show relevant tips and settings.</p>
      </div>
      <div className="space-y-6">
        {NICHE_GROUPS.map(group => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.chips.map(chip => (
                <SelectableChip
                  key={chip.value}
                  label={chip.label}
                  selected={data.niches.includes(chip.value)}
                  onToggle={() => toggle(chip.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepNicheSelection;
