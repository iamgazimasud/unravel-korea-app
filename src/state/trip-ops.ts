/**
 * Pure trip operations. Every function returns a new Trip and never mutates its input, so they are
 * safe inside React state updaters and easy to unit-test.
 */

import { getSpot } from '@/data/spots';
import { addDays, daysBetween, isValidISODate, today } from '@/lib/dates';

export type Trip = {
  name: string;
  /** `YYYY-MM-DD`, or null while the traveler hasn't booked dates. */
  startDate: string | null;
  /** Spot ids for each day, in visiting order. */
  days: string[][];
  /** Stops ticked off in Today mode, as `dayIndex:spotId`. */
  done: string[];
};

export const MAX_DAYS = 21;
export const DEFAULT_TRIP_NAME = 'My Korea trip';

export const emptyTrip = (dayCount = 3): Trip => ({
  name: DEFAULT_TRIP_NAME,
  startDate: null,
  days: Array.from({ length: clampDays(dayCount) }, () => []),
  done: [],
});

export function clampDays(count: number): number {
  return Math.max(1, Math.min(MAX_DAYS, Math.floor(count) || 1));
}

/** Drops "done" ticks whose stop is no longer on that day. */
function pruneDone(trip: Trip): Trip {
  const done = trip.done.filter((key) => {
    const [day, id] = splitDoneKey(key);
    return trip.days[day]?.includes(id) ?? false;
  });
  return done.length === trip.done.length ? trip : { ...trip, done };
}

function splitDoneKey(key: string): [number, string] {
  const i = key.indexOf(':');
  return [Number(key.slice(0, i)), key.slice(i + 1)];
}

function withDays(trip: Trip, days: string[][]): Trip {
  return pruneDone({ ...trip, days });
}

/** Grows or shrinks the trip. Stops on removed days are folded into the new last day, never dropped. */
export function resizeDays(trip: Trip, count: number): Trip {
  const n = clampDays(count);
  const { days } = trip;
  if (n === days.length) return trip;
  if (n > days.length) return withDays(trip, [...days, ...Array.from({ length: n - days.length }, () => [])]);
  const kept = days.slice(0, n);
  kept[n - 1] = [...new Set([...kept[n - 1], ...days.slice(n).flat()])];
  return withDays(trip, kept);
}

export function addSpot(trip: Trip, day: number, spotId: string): Trip {
  const list = trip.days[day];
  if (!list || list.includes(spotId) || !getSpot(spotId)) return trip;
  return withDays(
    trip,
    trip.days.map((d, i) => (i === day ? [...d, spotId] : d)),
  );
}

export function removeStop(trip: Trip, day: number, index: number): Trip {
  const list = trip.days[day];
  if (!list || index < 0 || index >= list.length) return trip;
  return withDays(
    trip,
    trip.days.map((d, i) => (i === day ? d.filter((_, j) => j !== index) : d)),
  );
}

export function moveStop(trip: Trip, day: number, index: number, delta: -1 | 1): Trip {
  const list = trip.days[day];
  const target = index + delta;
  if (!list || index < 0 || index >= list.length || target < 0 || target >= list.length) return trip;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return withDays(
    trip,
    trip.days.map((d, i) => (i === day ? next : d)),
  );
}

export function moveStopToDay(trip: Trip, fromDay: number, index: number, toDay: number): Trip {
  const id = trip.days[fromDay]?.[index];
  if (!id || fromDay === toDay || !trip.days[toDay]) return trip;
  return withDays(
    trip,
    trip.days.map((d, i) => {
      if (i === fromDay) return d.filter((_, j) => j !== index);
      if (i === toDay) return d.includes(id) ? d : [...d, id];
      return d;
    }),
  );
}

export function toggleDone(trip: Trip, day: number, spotId: string): Trip {
  if (!trip.days[day]?.includes(spotId)) return trip;
  const key = `${day}:${spotId}`;
  return {
    ...trip,
    done: trip.done.includes(key) ? trip.done.filter((k) => k !== key) : [...trip.done, key],
  };
}

/** Keeps days and dates, removes every stop. */
export function clearStops(trip: Trip): Trip {
  return { ...trip, days: trip.days.map(() => []), done: [] };
}

/**
 * Makes untrusted input (saved state from an older version, a shared link) safe to use:
 * unknown spot ids are dropped, duplicates removed, days clamped, invalid dates cleared.
 */
export function sanitizeTrip(input: unknown): Trip {
  const raw = (input ?? {}) as Partial<Record<keyof Trip, unknown>>;
  const days = (Array.isArray(raw.days) ? raw.days : [])
    .slice(0, MAX_DAYS)
    .map((d) =>
      Array.isArray(d) ? [...new Set(d.filter((id): id is string => typeof id === 'string' && !!getSpot(id)))] : [],
    );
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : DEFAULT_TRIP_NAME;
  const startDate = typeof raw.startDate === 'string' && isValidISODate(raw.startDate) ? raw.startDate : null;
  const done = Array.isArray(raw.done) ? raw.done.filter((k): k is string => typeof k === 'string') : [];
  return pruneDone({ name, startDate, days: days.length ? days : [[]], done });
}

export function dayDate(trip: Trip, dayIndex: number): string | null {
  return trip.startDate ? addDays(trip.startDate, dayIndex) : null;
}

export function stopCount(trip: Trip): number {
  return trip.days.reduce((n, d) => n + d.length, 0);
}

export type TripPhase =
  | { kind: 'empty' }
  | { kind: 'undated' }
  | { kind: 'upcoming'; daysToGo: number }
  | { kind: 'during'; dayIndex: number }
  | { kind: 'past' };

/** Where the traveler is relative to the trip. `now` is a `YYYY-MM-DD` date (injectable for tests). */
export function tripPhase(trip: Trip, now: string = today()): TripPhase {
  if (!trip.startDate) return stopCount(trip) ? { kind: 'undated' } : { kind: 'empty' };
  const offset = daysBetween(trip.startDate, now);
  if (offset < 0) return { kind: 'upcoming', daysToGo: -offset };
  if (offset < trip.days.length) return { kind: 'during', dayIndex: offset };
  return { kind: 'past' };
}
