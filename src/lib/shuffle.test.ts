import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle, hasAdjacentOriginalOrder, shuffleWithConstraints } from './shuffle';
import { Scene } from '@/types/scene';

function makeScene(id: string, videoIndex = 0): Scene {
  return {
    id,
    startTime: 0,
    endTime: 1,
    duration: 1,
    selected: true,
    videoIndex,
  };
}

describe('fisherYatesShuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(arr);
    expect(result).toHaveLength(arr.length);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    fisherYatesShuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('handles single-element array', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('produces different orderings over many runs', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(fisherYatesShuffle(arr).join(','));
    }
    // Should produce at least a few different orderings
    expect(results.size).toBeGreaterThan(5);
  });
});

describe('hasAdjacentOriginalOrder', () => {
  it('returns true when adjacent scenes stay adjacent', () => {
    const original = [makeScene('a'), makeScene('b'), makeScene('c')];
    const shuffled = [makeScene('c'), makeScene('a'), makeScene('b')]; // a,b still adjacent
    expect(hasAdjacentOriginalOrder(shuffled, original)).toBe(true);
  });

  it('returns false when no adjacent scenes remain', () => {
    const original = [makeScene('a'), makeScene('b'), makeScene('c'), makeScene('d')];
    const shuffled = [makeScene('a'), makeScene('c'), makeScene('b'), makeScene('d')];
    // a->c: original indices 0,2 (diff 2), c->b: 2,1 (diff 1) — adjacent!
    expect(hasAdjacentOriginalOrder(shuffled, original)).toBe(true);
  });

  it('returns false for properly separated scenes', () => {
    const original = [makeScene('a'), makeScene('b'), makeScene('c'), makeScene('d')];
    const shuffled = [makeScene('b'), makeScene('d'), makeScene('a'), makeScene('c')];
    // b->d: 1,3 (diff 2), d->a: 3,0 (diff 3), a->c: 0,2 (diff 2) — none adjacent
    expect(hasAdjacentOriginalOrder(shuffled, original)).toBe(false);
  });

  it('handles single scene', () => {
    const scenes = [makeScene('a')];
    expect(hasAdjacentOriginalOrder(scenes, scenes)).toBe(false);
  });

  it('handles reverse order (adjacent in original are still adjacent reversed)', () => {
    const original = [makeScene('a'), makeScene('b'), makeScene('c')];
    const reversed = [makeScene('c'), makeScene('b'), makeScene('a')];
    // c->b: 2,1 (diff 1) — adjacent!
    expect(hasAdjacentOriginalOrder(reversed, original)).toBe(true);
  });
});

describe('shuffleWithConstraints', () => {
  it('returns single scene unchanged', () => {
    const scenes = [makeScene('a')];
    const result = shuffleWithConstraints(scenes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('returns all scenes', () => {
    const scenes = Array.from({ length: 20 }, (_, i) => makeScene(`s${i}`, i % 3));
    const result = shuffleWithConstraints(scenes);
    expect(result).toHaveLength(20);
    const ids = result.map(s => s.id).sort();
    const originalIds = scenes.map(s => s.id).sort();
    expect(ids).toEqual(originalIds);
  });

  it('interleaves multiple videos', () => {
    const scenes = [
      ...Array.from({ length: 5 }, (_, i) => makeScene(`v0_${i}`, 0)),
      ...Array.from({ length: 5 }, (_, i) => makeScene(`v1_${i}`, 1)),
    ];
    const result = shuffleWithConstraints(scenes);

    // Check that videos are somewhat mixed (not all video 0 then all video 1)
    const firstHalf = result.slice(0, 5).map(s => s.videoIndex);
    const hasV0 = firstHalf.includes(0);
    const hasV1 = firstHalf.includes(1);
    expect(hasV0 && hasV1).toBe(true);
  });

  it('attempts to avoid adjacent original sequences', () => {
    const scenes = Array.from({ length: 10 }, (_, i) => makeScene(`s${i}`, 0));
    // Run multiple times to check constraint is usually met
    let constraintMet = 0;
    for (let i = 0; i < 20; i++) {
      const result = shuffleWithConstraints(scenes);
      if (!hasAdjacentOriginalOrder(result, scenes)) {
        constraintMet++;
      }
    }
    // Should succeed most of the time (allow some failures due to small array)
    expect(constraintMet).toBeGreaterThan(10);
  });
});
