import { Scene } from "@/types/scene";

/**
 * Fisher-Yates (Knuth) shuffle — uniform random distribution.
 * Uses crypto.getRandomValues for unbiased randomness.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Check if shuffled array has any adjacent scenes that were adjacent in original.
 * Uses a Map for O(n) lookup instead of findIndex O(n²).
 */
export function hasAdjacentOriginalOrder(shuffled: Scene[], original: Scene[]): boolean {
  const indexMap = new Map(original.map((s, i) => [s.id, i]));

  for (let i = 0; i < shuffled.length - 1; i++) {
    const currentIdx = indexMap.get(shuffled[i].id);
    const nextIdx = indexMap.get(shuffled[i + 1].id);
    if (currentIdx !== undefined && nextIdx !== undefined && Math.abs(currentIdx - nextIdx) === 1) {
      return true;
    }
  }
  return false;
}

/**
 * Create a shuffle that interleaves scenes from different videos evenly.
 */
function createMixedShuffle(scenes: Scene[]): Scene[] {
  // Group by video
  const groups: Record<number, Scene[]> = {};
  for (const scene of scenes) {
    const vi = scene.videoIndex ?? 0;
    if (!groups[vi]) groups[vi] = [];
    groups[vi].push(scene);
  }

  // Fisher-Yates each group internally
  const shuffledGroups = Object.values(groups).map(g => fisherYatesShuffle(g));

  // Interleave: cycle through videos, taking one scene per round
  const result: Scene[] = [];
  const maxLen = Math.max(...shuffledGroups.map(g => g.length));

  for (let i = 0; i < maxLen; i++) {
    // Randomize video order each round
    const order = fisherYatesShuffle(shuffledGroups);
    for (const group of order) {
      if (i < group.length) {
        result.push(group[i]);
      }
    }
  }

  return result;
}

/**
 * Smart shuffle that prevents adjacent original sequences AND mixes videos evenly.
 * Max 100 attempts to find a valid arrangement.
 */
export function shuffleWithConstraints(scenes: Scene[]): Scene[] {
  if (scenes.length <= 1) return [...scenes];

  let shuffled = createMixedShuffle(scenes);
  let attempts = 1;
  const maxAttempts = 100;

  while (hasAdjacentOriginalOrder(shuffled, scenes) && attempts < maxAttempts) {
    shuffled = createMixedShuffle(scenes);
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.warn("Could not find perfect shuffle with constraints, using best mixed attempt");
  }

  return shuffled;
}
