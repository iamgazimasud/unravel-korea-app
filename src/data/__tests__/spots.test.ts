import {
  CategoryIcons,
  CategoryLabels,
  closedDaysLabel,
  getSpot,
  InterestLabels,
  isClosedOn,
  Spots,
} from '@/data/spots';
import { PhotoCredits, SpotImages } from '@/data/spot-photos';
import { parseISODate } from '@/lib/dates';

describe('spot catalog integrity', () => {
  it('has unique ids', () => {
    const ids = Spots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses ids that are safe inside share links (no "." or "~")', () => {
    for (const s of Spots) expect(s.id).toMatch(/^[a-z0-9-]+$/);
  });

  it.each(Spots.map((s) => [s.id, s] as const))('%s has complete, valid data', (_id, s) => {
    expect(s.name.trim()).not.toBe('');
    expect(s.nameKo).toMatch(/[가-힣]/);
    expect(s.mapQuery.trim()).not.toBe('');
    expect(s.directions.trim()).not.toBe('');
    expect(s.duration).toBeGreaterThan(0);
    expect(CategoryLabels[s.category]).toBeDefined();
    expect(CategoryIcons[s.category]).toBeDefined();
    expect(s.interests.length).toBeGreaterThan(0);
    for (const i of s.interests) expect(InterestLabels[i]).toBeDefined();
    for (const d of s.closedDays ?? []) expect(d).toBeGreaterThanOrEqual(0);
    for (const d of s.closedDays ?? []) expect(d).toBeLessThanOrEqual(6);
  });

  it.each(Spots.map((s) => [s.id] as const))('%s has a bundled photo with a complete licence credit', (id) => {
    expect(SpotImages[id]).toBeDefined();
    const credit = PhotoCredits[id];
    expect(credit.author.trim()).not.toBe('');
    expect(credit.license).toMatch(/^(CC0|CC BY(-SA)? \d\.\d|KOGL Type \d|Public domain)$/);
    expect(credit.url).toMatch(/^https:\/\//);
    expect(credit.alt.length).toBeGreaterThan(10);
  });

  it('has no photos or credits for spots that no longer exist', () => {
    const ids = new Set(Spots.map((s) => s.id));
    expect(Object.keys(SpotImages).filter((k) => !ids.has(k))).toEqual([]);
    expect(Object.keys(PhotoCredits).filter((k) => !ids.has(k))).toEqual([]);
  });
});

describe('opening days', () => {
  const palace = getSpot('gyeongbokgung')!; // closed Tuesdays

  it('knows when a spot is closed', () => {
    expect(isClosedOn(palace, parseISODate('2026-11-03'))).toBe(true); // Tuesday
    expect(isClosedOn(palace, parseISODate('2026-11-04'))).toBe(false);
  });

  it('describes closed days', () => {
    expect(closedDaysLabel(palace)).toBe('Closed Tue');
    expect(closedDaysLabel(getSpot('hongdae-free-market')!)).toBe('Open Sat only');
    expect(closedDaysLabel(getSpot('bukchon')!)).toBeUndefined();
  });

  it('returns undefined for unknown ids', () => {
    expect(getSpot('nope')).toBeUndefined();
  });
});
