/**
 * Pure trip operations. Every function returns a new Trip and never mutates its input, so they are
 * safe inside React state updaters and easy to unit-test.
 */

import type { Plan } from '@/data/plans';
import { getSpot } from '@/data/spots';
import { addDays, daysBetween, isValidISODate, today } from '@/lib/dates';
import { plural } from '@/lib/text';

export type Trip = {
  name: string;
  /** `YYYY-MM-DD`, or null while the traveler hasn't booked dates. */
  startDate: string | null;
  /** Spot ids for each day, in visiting order. */
  days: string[][];
  /** A short theme per day ("Royal Seoul"), same length as `days`. Empty string = no title. */
  dayTitles: string[];
  /** Stops ticked off in Today mode, as `dayIndex:spotId`. */
  done: string[];
};

export const MAX_DAYS = 21;
export const MAX_TITLE_LENGTH = 40;
export const DEFAULT_TRIP_NAME = 'My Korea trip';

export const emptyTrip = (dayCount = 3, startDate: string | null = null): Trip => {
  const n = clampDays(dayCount);
  return {
    name: DEFAULT_TRIP_NAME,
    startDate,
    days: Array.from({ length: n }, () => []),
    dayTitles: Array.from({ length: n }, () => ''),
    done: [],
  };
};

/** A fresh trip from a ready-made plan. Keeps the traveler's arrival date. */
export function tripFromPlan(plan: Plan, startDate: string | null = null): Trip {
  return sanitizeTrip({
    name: plan.name,
    startDate,
    days: plan.plan.map((d) => d.spots),
    dayTitles: plan.plan.map((d) => d.title),
    done: [],
  });
}

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

/** Pads or trims titles to one per day. */
function fitTitles(titles: string[], count: number): string[] {
  return Array.from({ length: count }, (_, i) => titles[i] ?? '');
}

/** Ready-made plans are named after their length ("5 days in Seoul"), so the name follows the length. */
const LENGTH_NAME = /^\d+ days? in Seoul$/;

/** Grows or shrinks the trip. Stops on removed days are folded into the new last day, never dropped. */
export function resizeDays(trip: Trip, count: number): Trip {
  const n = clampDays(count);
  const { days } = trip;
  if (n === days.length) return trip;
  const name = LENGTH_NAME.test(trip.name) ? `${plural(n, 'day')} in Seoul` : trip.name;
  const dayTitles = fitTitles(trip.dayTitles, n);
  if (n > days.length) {
    return withDays({ ...trip, name, dayTitles }, [...days, ...Array.from({ length: n - days.length }, () => [])]);
  }
  const kept = days.slice(0, n);
  const moved = days
    .slice(n)
    .flat()
    .filter((id) => !kept[n - 1].includes(id));
  kept[n - 1] = [...new Set([...kept[n - 1], ...moved])];
  // The last day now also holds other days' places, so its theme ("Royal Seoul") no longer fits.
  if (moved.length) dayTitles[n - 1] = '';
  return withDays({ ...trip, name, dayTitles }, kept);
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

/** Key used in `trip.done` for a ticked-off stop. */
export const doneKey = (day: number, spotId: string) => `${day}:${spotId}`;

export function toggleDone(trip: Trip, day: number, spotId: string): Trip {
  if (!trip.days[day]?.includes(spotId)) return trip;
  const key = doneKey(day, spotId);
  return {
    ...trip,
    done: trip.done.includes(key) ? trip.done.filter((k) => k !== key) : [...trip.done, key],
  };
}

/** Keeps days and dates, removes every stop (and the day themes that described them). */
export function clearStops(trip: Trip): Trip {
  return { ...trip, days: trip.days.map(() => []), dayTitles: trip.days.map(() => ''), done: [] };
}

/** The day's theme, or "Day 3" when it has none. */
export function dayTitle(trip: Trip, dayIndex: number): string {
  return trip.dayTitles[dayIndex] || `Day ${dayIndex + 1}`;
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
  if (!days.length) days.push([]);
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : DEFAULT_TRIP_NAME;
  const startDate = typeof raw.startDate === 'string' && isValidISODate(raw.startDate) ? raw.startDate : null;
  // Older saves have no titles; they simply get untitled days.
  const titles = Array.isArray(raw.dayTitles) ? raw.dayTitles : [];
  const dayTitles = days.map((_, i) =>
    typeof titles[i] === 'string' ? (titles[i] as string).trim().slice(0, MAX_TITLE_LENGTH) : '',
  );
  const done = Array.isArray(raw.done) ? raw.done.filter((k): k is string => typeof k === 'string') : [];
  return pruneDone({ name, startDate, days, dayTitles, done });
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
