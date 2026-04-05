interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

const SelectableChip = ({ label, selected, onToggle }: SelectableChipProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center px-3 py-2 rounded-full text-sm font-medium
        border transition-all duration-200 cursor-pointer whitespace-nowrap
        ${selected
          ? 'border-primary bg-primary/10 text-primary-foreground'
          : 'border-border/50 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground'
        }
      `}
    >
      {label}
    </button>
  );
};

export default SelectableChip;
