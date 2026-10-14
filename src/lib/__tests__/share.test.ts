import { extractExpoPathFromURL } from 'expo-router/build/fork/extractPathFromURL';
import { parseQueryParams } from 'expo-router/build/fork/getStateFromPath-forks';

import { getPlan, Plans } from '@/data/plans';
import { decodeSharedTrip, tripShareUrl, tripToText } from '@/lib/share';
import { tripFromPlan, type Trip } from '@/state/trip-ops';

jest.mock('expo-linking', () => ({
  createURL: (path: string, { queryParams }: { queryParams: Record<string, string> }) =>
    `unravelkorea:/${path}?${new URLSearchParams(queryParams).toString()}`,
}));

const trip: Trip = {
  name: 'Seoul & Busan',
  startDate: '2026-11-02',
  days: [['gyeongbokgung', 'bukchon'], [], ['busan']],
  dayTitles: ['Royal Seoul', '', 'Busan ~ by the sea'],
  done: ['0:bukchon'],
};

describe('share links', () => {
  it('round-trips a trip through its link (minus Today-mode ticks)', () => {
    const url = new URL(tripShareUrl(trip));
    const params = Object.fromEntries(url.searchParams.entries());
    expect(params.d).toBe('gyeongbokgung.bukchon~~busan');
    expect(params.t).toBe('Royal Seoul~~Busan - by the sea');
    expect(decodeSharedTrip(params)).toEqual({
      ...trip,
      name: 'Seoul and Busan',
      dayTitles: ['Royal Seoul', '', 'Busan - by the sea'],
      done: [],
    });
  });

  it('omits day titles when there are none, and accepts links without them', () => {
    const untitled = { ...trip, dayTitles: ['', '', ''] };
    expect(tripShareUrl(untitled)).not.toContain('t=');
    expect(decodeSharedTrip({ d: 'bukchon~myeongdong' })?.dayTitles).toEqual(['', '']);
  });

  it('omits the date when the trip has none', () => {
    expect(tripShareUrl({ ...trip, startDate: null })).not.toContain('s=');
  });

  it('drops unknown spots and rejects links with nothing usable', () => {
    expect(decodeSharedTrip({ d: 'bukchon.hacked~' })?.days).toEqual([['bukchon'], []]);
    expect(decodeSharedTrip({ d: 'nope.nada' })).toBeNull();
    expect(decodeSharedTrip({})).toBeNull();
  });

  it('ignores an invalid date and caps the name', () => {
    const t = decodeSharedTrip({ d: 'bukchon', s: '2026-13-45', n: 'x'.repeat(200) });
    expect(t?.startDate).toBeNull();
    expect(t?.name).toHaveLength(60);
  });
});

/** What the import screen receives when the app is opened from `url` (expo-router's real parsing). */
function openedFrom(url: string) {
  const path = extractExpoPathFromURL([], url);
  return parseQueryParams(path, { name: 'import', params: {} } as never) as Record<string, string>;
}

describe('share links opened in the app', () => {
  // Regression: "Gangnam & the Han River" cut the titles off at the "&", because expo-router decodes
  // query values and re-splits them on "&".
  it.each(Plans.map((p) => [p.name, p] as const))('%s arrives with every day theme', (_name, plan) => {
    const shared = decodeSharedTrip(openedFrom(tripShareUrl(tripFromPlan(plan, '2026-11-02'))));
    expect(shared?.days).toEqual(plan.plan.map((d) => d.spots));
    expect(shared?.dayTitles).toHaveLength(plan.days);
    expect(shared?.dayTitles.every(Boolean)).toBe(true);
    expect(shared?.dayTitles[2]).toBe('Gangnam and the Han River');
    expect(shared?.startDate).toBe('2026-11-02');
  });

  it('survives characters that are special in URLs, in names and titles', () => {
    const t = {
      ...tripFromPlan(getPlan('3')!),
      name: 'Mom & me #1 100% + friends',
      dayTitles: ['A & B', 'C#D', 'E%F+G'],
    };
    const shared = decodeSharedTrip(openedFrom(tripShareUrl(t)));
    expect(shared?.name).toBe('Mom and me 1 100 friends');
    expect(shared?.dayTitles).toEqual(['A and B', 'C D', 'E F G']);
  });
});

describe('tripToText', () => {
  it('writes a readable itinerary for people without the app', () => {
    const text = tripToText(trip);
    expect(text).toContain('Seoul & Busan');
    expect(text).toMatch(/Day 1 — Mon, Nov 2 · Royal Seoul/);
    expect(text).toMatch(/Day 2 — Tue, Nov 3\n/);
    expect(text).toContain('1. Gyeongbokgung Palace (경복궁)');
    expect(text).toContain('(free day)');
  });
});
