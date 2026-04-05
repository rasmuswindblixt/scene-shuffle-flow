const FACTS = [
  {
    stat: '$500B+',
    label: 'YouTube creator economy by 2028',
    icon: '📈',
  },
  {
    stat: '$18K/mo',
    label: 'Average top automation channel revenue',
    icon: '💰',
  },
  {
    stat: '70%',
    label: 'of top channels use compilation/remix formats',
    icon: '🎬',
  },
  {
    stat: '3–6.9s',
    label: 'clip length = copyright safe & algorithm friendly',
    icon: '✅',
  },
];

const StepFacts = () => {
  return (
    <div className="max-w-lg mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">YouTube Automation is booming</h2>
        <p className="text-muted-foreground">
          Creators are building real income streams with smart content strategies.
        </p>
      </div>

      <div className="grid gap-3">
        {FACTS.map((fact, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-card/60 border border-border/50 rounded-xl p-4 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
          >
            <span className="text-2xl">{fact.icon}</span>
            <div>
              <div className="text-xl font-bold gradient-text">{fact.stat}</div>
              <div className="text-sm text-muted-foreground">{fact.label}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground pt-2">
        The opportunity is massive — and the right tools make all the difference.
      </p>
    </div>
  );
};

export default StepFacts;
