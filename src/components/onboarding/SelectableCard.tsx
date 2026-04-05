import { Check } from 'lucide-react';

interface SelectableCardProps {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onToggle: () => void;
}

const SelectableCard = ({ icon, title, subtitle, selected, onToggle }: SelectableCardProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-primary bg-primary/10'
          : 'border-border/50 bg-card/60 hover:border-border'
        }
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{icon}</span>
        <div className="flex-1 pr-6">
          <div className="font-semibold text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{subtitle}</div>
        </div>
      </div>
    </button>
  );
};

export default SelectableCard;
