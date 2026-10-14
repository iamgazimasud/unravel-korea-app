import {
  addSpot,
  clearStops,
  dayDate,
  emptyTrip,
  MAX_DAYS,
  moveStop,
  moveStopToDay,
  removeStop,
  resizeDays,
  sanitizeTrip,
  stopCount,
  toggleDone,
  tripPhase,
  type Trip,
} from '@/state/trip-ops';

const trip = (days: string[][], extra: Partial<Trip> = {}): Trip => ({
  name: 'Test',
  startDate: null,
  days,
  done: [],
  ...extra,
});

describe('emptyTrip', () => {
  it('clamps the day count', () => {
    expect(emptyTrip(0).days).toHaveLength(1);
    expect(emptyTrip(99).days).toHaveLength(MAX_DAYS);
  });
});

describe('addSpot', () => {
  it('appends a known spot to a day without mutating the input', () => {
    const before = trip([[], []]);
    const after = addSpot(before, 1, 'myeongdong');
    expect(after.days).toEqual([[], ['myeongdong']]);
    expect(before.days).toEqual([[], []]);
  });

  it('ignores duplicates, unknown spots and missing days', () => {
    const t = trip([['myeongdong']]);
    expect(addSpot(t, 0, 'myeongdong')).toBe(t);
    expect(addSpot(t, 0, 'not-a-spot')).toBe(t);
    expect(addSpot(t, 5, 'bukchon')).toBe(t);
  });
});

describe('reordering', () => {
  const t = trip([['gyeongbokgung', 'bukchon', 'myeongdong'], ['mangwon']]);

  it('moves a stop up and down within a day', () => {
    expect(moveStop(t, 0, 0, 1).days[0]).toEqual(['bukchon', 'gyeongbokgung', 'myeongdong']);
    expect(moveStop(t, 0, 2, -1).days[0]).toEqual(['gyeongbokgung', 'myeongdong', 'bukchon']);
  });

  it('refuses to move past either end', () => {
    expect(moveStop(t, 0, 0, -1)).toBe(t);
    expect(moveStop(t, 0, 2, 1)).toBe(t);
  });

  it('moves a stop to another day', () => {
    expect(moveStopToDay(t, 0, 1, 1).days).toEqual([
      ['gyeongbokgung', 'myeongdong'],
      ['mangwon', 'bukchon'],
    ]);
    expect(moveStopToDay(t, 0, 1, 0)).toBe(t);
  });

  it('removes a stop', () => {
    expect(removeStop(t, 0, 0).days[0]).toEqual(['bukchon', 'myeongdong']);
    expect(removeStop(t, 0, 9)).toBe(t);
  });
});

describe('Today-mode ticks', () => {
  it('toggles a stop as done', () => {
    const t = toggleDone(trip([['bukchon']]), 0, 'bukchon');
    expect(t.done).toEqual(['0:bukchon']);
    expect(toggleDone(t, 0, 'bukchon').done).toEqual([]);
  });

  it('ignores stops that are not on that day', () => {
    const t = trip([['bukchon'], []]);
    expect(toggleDone(t, 1, 'bukchon')).toBe(t);
  });

  it('forgets a tick when its stop is moved or removed', () => {
    const t = toggleDone(trip([['bukchon'], []]), 0, 'bukchon');
    expect(moveStopToDay(t, 0, 0, 1).done).toEqual([]);
    expect(removeStop(t, 0, 0).done).toEqual([]);
  });
});

describe('resizeDays', () => {
  it('adds empty days', () => {
    expect(resizeDays(trip([['bukchon']]), 3).days).toEqual([['bukchon'], [], []]);
  });

  it('folds stops from removed days into the new last day instead of dropping them', () => {
    const t = trip([['bukchon'], ['myeongdong'], ['mangwon', 'bukchon']]);
    expect(resizeDays(t, 1).days).toEqual([['bukchon', 'myeongdong', 'mangwon']]);
  });

  it('never goes below one day', () => {
    expect(resizeDays(trip([[]]), 0).days).toHaveLength(1);
  });
});

describe('clearStops', () => {
  it('keeps name, dates and length', () => {
    const t = trip([['bukchon'], ['myeongdong']], { name: 'Seoul', startDate: '2026-11-02', done: ['0:bukchon'] });
    expect(clearStops(t)).toEqual({ name: 'Seoul', startDate: '2026-11-02', days: [[], []], done: [] });
  });
});

describe('sanitizeTrip', () => {
  it('cleans untrusted input', () => {
    const t = sanitizeTrip({
      name: '   ',
      startDate: '2026-02-30',
      days: [['bukchon', 'bukchon', 'deleted-spot', 42], 'not-a-day'],
      done: ['0:bukchon', '1:bukchon', 7],
    });
    expect(t).toEqual({ name: 'My Korea trip', startDate: null, days: [['bukchon'], []], done: ['0:bukchon'] });
  });

  it('survives garbage', () => {
    expect(sanitizeTrip(null).days).toEqual([[]]);
    expect(sanitizeTrip({ days: Array.from({ length: 50 }, () => []) }).days).toHaveLength(MAX_DAYS);
  });
});

describe('dates and phases', () => {
  const t = trip([['bukchon'], [], []], { startDate: '2026-11-02' });

  it('gives each day a date', () => {
    expect(dayDate(t, 2)).toBe('2026-11-04');
    expect(dayDate(trip([[]]), 0)).toBeNull();
  });

  it('works out where the traveler is', () => {
    expect(tripPhase(t, '2026-10-30')).toEqual({ kind: 'upcoming', daysToGo: 3 });
    expect(tripPhase(t, '2026-11-03')).toEqual({ kind: 'during', dayIndex: 1 });
    expect(tripPhase(t, '2026-11-05')).toEqual({ kind: 'past' });
    expect(tripPhase(trip([[]]))).toEqual({ kind: 'empty' });
    expect(tripPhase(trip([['bukchon']]))).toEqual({ kind: 'undated' });
    expect(stopCount(t)).toBe(1);
  });
});
