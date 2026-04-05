export interface CardOption {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
}

export interface ChipOption {
  label: string;
  value: string;
}

export interface ChipGroup {
  title: string;
  chips: ChipOption[];
}

export interface VolumeOption extends CardOption {
  hoursSaved: number;
  multiplier: number;
}

// Step 1: Roles
export const ROLE_OPTIONS: CardOption[] = [
  { icon: '🎬', title: 'Solo Creator', subtitle: 'Running channels on your own', value: 'solo' },
  { icon: '🏢', title: 'Agency / Team', subtitle: 'Producing content for clients', value: 'agency' },
  { icon: '💼', title: 'Brand / Business', subtitle: 'Marketing for your own brand', value: 'brand' },
  { icon: '🌱', title: 'New to YouTube Automation', subtitle: 'Still learning the ropes', value: 'new' },
];

// Step 2: Niches
export const NICHE_GROUPS: ChipGroup[] = [
  {
    title: 'Highest CPM — Most Profitable',
    chips: [
      { label: '💰 Finance & Investing', value: 'finance' },
      { label: '🏠 Real Estate', value: 'real_estate' },
      { label: '💊 Health & Wellness', value: 'health' },
      { label: '🔨 DIY & Home Improvement', value: 'diy' },
      { label: '🤖 AI & Tech', value: 'ai_tech' },
      { label: '⚖️ Law & Legal', value: 'law' },
    ],
  },
  {
    title: 'Trending — High Viral Potential',
    chips: [
      { label: '🎬 Vintage Hollywood', value: 'vintage_hollywood' },
      { label: '⭐ Celebrity News', value: 'celebrity' },
      { label: '🔪 True Crime & Mystery', value: 'true_crime' },
      { label: '🧠 Psychology & Behavior', value: 'psychology' },
      { label: '📜 History & Mysteries', value: 'history' },
      { label: '🚗 Cars & Automotive', value: 'cars' },
      { label: '🌌 Space & Astronomy', value: 'space' },
      { label: '🎙️ Streamers & Gaming Culture', value: 'streaming_culture' },
    ],
  },
  {
    title: 'Evergreen — Steady Growth',
    chips: [
      { label: '🏋️ Fitness & Sports', value: 'fitness' },
      { label: '🧘 Self-Improvement', value: 'self_improvement' },
      { label: '🚀 Business & Entrepreneurship', value: 'business' },
      { label: '📚 Education & How-To', value: 'education' },
      { label: '🎮 Gaming & Esports', value: 'gaming' },
      { label: '✈️ Travel & Adventure', value: 'travel' },
      { label: '🍽️ Food & Recipes', value: 'food' },
      { label: '👗 Fashion & Beauty', value: 'fashion' },
      { label: '🦁 Animals & Wildlife', value: 'animals' },
      { label: '🪙 Crypto & Web3', value: 'crypto' },
      { label: '🎵 Music & Entertainment', value: 'music' },
      { label: '💡 Motivational / Quotes', value: 'motivational' },
    ],
  },
];

// Step 3: Upload volume
export const VOLUME_OPTIONS: VolumeOption[] = [
  { icon: '🐣', title: '1–2 videos / week', subtitle: 'Saves ~4 hours per week', value: '1_2', hoursSaved: 4, multiplier: 2 },
  { icon: '🚀', title: '3–5 videos / week', subtitle: 'Saves ~12 hours per week', value: '3_5', hoursSaved: 12, multiplier: 3 },
  { icon: '⚡', title: '6–10 videos / week', subtitle: 'Saves ~24 hours per week', value: '6_10', hoursSaved: 24, multiplier: 5 },
  { icon: '🏭', title: '10+ videos / week', subtitle: 'Content factory — saves 40h+', value: '10_plus', hoursSaved: 40, multiplier: 8 },
];

// Step 4: Pain points
export const PAIN_POINT_OPTIONS: CardOption[] = [
  { icon: '⏱️', title: 'Editing takes too long', subtitle: 'Want to scale but running out of time', value: 'time' },
  { icon: '🚫', title: 'Copyright strikes / flags', subtitle: 'Worried about channel getting shut down', value: 'copyright' },
  { icon: '🎞️', title: 'Hard to find good footage', subtitle: 'Stock video is expensive and generic', value: 'footage' },
  { icon: '📅', title: 'Inconsistent upload schedule', subtitle: 'Publishing irregularly', value: 'consistency' },
  { icon: '📈', title: 'Want to scale to more channels', subtitle: 'Need a repeatable system', value: 'scale' },
];

// Step 5: Goals
export const GOAL_OPTIONS: CardOption[] = [
  { icon: '💸', title: 'Side income', subtitle: 'Goal: $500–$2,000/month extra', value: 'side_income' },
  { icon: '🎯', title: 'Full-time YouTube income', subtitle: 'Quit the 9-to-5 within 12 months', value: 'full_time' },
  { icon: '🏆', title: 'Build a Content Empire', subtitle: '10+ channels, passive income', value: 'empire' },
  { icon: '🤝', title: 'Sell as a service to clients', subtitle: 'Video agency with automation', value: 'agency_service' },
];

// Step 6: Loading checklist items
export const LOADING_STEPS = [
  { text: 'Analyzing your niches', icon: '🔍', delay: 200 },
  { text: 'Calculating your time savings', icon: '⚡', delay: 2000 },
  { text: 'Matching creators with similar goals', icon: '🎯', delay: 4000 },
  { text: 'Building your personalized plan', icon: '🚀', delay: 6000 },
];

// Helper: get personalized stats from volume selection
export function getPersonalizedStats(volumeValue: string | null) {
  const option = VOLUME_OPTIONS.find(v => v.value === volumeValue);
  return {
    hoursSaved: option?.hoursSaved ?? 4,
    multiplier: option?.multiplier ?? 2,
  };
}
