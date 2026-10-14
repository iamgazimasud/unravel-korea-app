import { decodeSharedTrip, tripShareUrl, tripToText } from '@/lib/share';
import type { Trip } from '@/state/trip-ops';

jest.mock('expo-linking', () => ({
  createURL: (path: string, { queryParams }: { queryParams: Record<string, string> }) =>
    `unravelkorea:/${path}?${new URLSearchParams(queryParams).toString()}`,
}));

const trip: Trip = {
  name: 'Seoul & Busan',
  startDate: '2026-11-02',
  days: [['gyeongbokgung', 'bukchon'], [], ['busan']],
  done: ['0:bukchon'],
};

describe('share links', () => {
  it('round-trips a trip through its link (minus Today-mode ticks)', () => {
    const url = new URL(tripShareUrl(trip));
    const params = Object.fromEntries(url.searchParams.entries());
    expect(params.d).toBe('gyeongbokgung.bukchon~~busan');
    expect(decodeSharedTrip(params)).toEqual({ ...trip, done: [] });
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

describe('tripToText', () => {
  it('writes a readable itinerary for people without the app', () => {
    const text = tripToText(trip);
    expect(text).toContain('Seoul & Busan');
    expect(text).toMatch(/Day 1 — Mon, Nov 2/);
    expect(text).toContain('1. Gyeongbokgung Palace (경복궁)');
    expect(text).toContain('(free day)');
  });
});
