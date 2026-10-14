import { getPlan, planPlaceCount, Plans, RECOMMENDED_PLAN } from '@/data/plans';
import { getSpot } from '@/data/spots';
import { MAX_TITLE_LENGTH } from '@/state/trip-ops';

describe('ready-made plans', () => {
  it('offers 3, 5 and 7 days, shortest first', () => {
    expect(Plans.map((p) => p.days)).toEqual([3, 5, 7]);
    expect(new Set(Plans.map((p) => p.id)).size).toBe(Plans.length);
    expect(getPlan(RECOMMENDED_PLAN)).toBeDefined();
  });

  it.each(Plans.map((p) => [p.name, p] as const))('%s is complete and only uses real places', (_name, p) => {
    expect(p.plan).toHaveLength(p.days);
    for (const day of p.plan) {
      expect(day.title.trim()).not.toBe('');
      expect(day.title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
      expect(day.spots.length).toBeGreaterThan(0);
      expect(new Set(day.spots).size).toBe(day.spots.length);
      for (const id of day.spots) expect(getSpot(id)).toBeDefined();
    }
    for (const id of p.cover) expect(getSpot(id)).toBeDefined();
    expect(p.name).toContain(String(p.days));
  });

  it('counts distinct places', () => {
    expect(planPlaceCount(getPlan('3')!)).toBe(10);
    expect(getPlan('nope')).toBeUndefined();
  });

  it('gets bigger with every extra day', () => {
    const counts = Plans.map(planPlaceCount);
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
  });
});
