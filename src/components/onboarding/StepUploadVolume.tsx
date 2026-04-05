import SelectableCard from './SelectableCard';
import { VOLUME_OPTIONS } from '@/lib/onboarding-data';
import type { OnboardingData } from '@/hooks/useOnboarding';

interface Props {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
}

const StepUploadVolume = ({ data, setData }: Props) => {
  const select = (value: string) => {
    setData({ upload_volume: data.upload_volume === value ? null : value });
  };

  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">How many videos do you want to publish per week?</h2>
        <p className="text-muted-foreground">We'll calculate exactly how much time we can save you.</p>
      </div>
      <div className="grid gap-3">
        {VOLUME_OPTIONS.map(option => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.upload_volume === option.value}
            onToggle={() => select(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepUploadVolume;
