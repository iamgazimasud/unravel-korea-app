import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getSpot, type Interest } from '@/data/spots';
import { addDays, daysBetween, today } from '@/lib/dates';

export type Trip = {
  name: string;
  /** `YYYY-MM-DD`, or null while the traveler hasn't booked dates. */
  startDate: string | null;
  /** Spot ids for each day, in visiting order. */
  days: string[][];
  /** Stops ticked off in Today mode, as `dayIndex:spotId`. */
  done: string[];
};

export type Prefs = {
  onboarded: boolean;
  interests: Interest[];
  saved: string[];
};

type PersistedState = { version: 1; trip: Trip; prefs: Prefs };

const STORAGE_KEY = 'unravel-korea/state';
const MAX_DAYS = 21;

export const emptyTrip = (dayCount = 3): Trip => ({
  name: 'My Korea trip',
  startDate: null,
  days: Array.from({ length: dayCount }, () => []),
  done: [],
});

const defaultPrefs: Prefs = { onboarded: false, interests: [], saved: [] };

type AppState = {
  ready: boolean;
  trip: Trip;
  prefs: Prefs;
  setTripName: (name: string) => void;
  setStartDate: (date: string | null) => void;
  setDayCount: (count: number) => void;
  addSpot: (day: number, spotId: string) => void;
  removeStop: (day: number, index: number) => void;
  moveStop: (day: number, index: number, delta: -1 | 1) => void;
  moveStopToDay: (fromDay: number, index: number, toDay: number) => void;
  toggleDone: (day: number, spotId: string) => void;
  replaceTrip: (trip: Trip) => void;
  resetTrip: () => void;
  toggleSaved: (spotId: string) => void;
  completeOnboarding: (input: { interests: Interest[]; dayCount: number; startDate: string | null }) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [trip, setTrip] = useState<Trip>(() => emptyTrip());
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.version === 1) {
          setTrip(sanitizeTrip(parsed.trip));
          setPrefs({ ...defaultPrefs, ...parsed.prefs });
        }
      })
      .catch(() => {
        // Corrupt or unreadable storage: start fresh rather than crash.
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const state: PersistedState = { version: 1, trip, prefs };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [trip, prefs]);

  const updateDays = useCallback((fn: (days: string[][]) => string[][]) => {
    setTrip((t) => ({ ...t, days: fn(t.days.map((d) => [...d])) }));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      trip,
      prefs,
      setTripName: (name) => setTrip((t) => ({ ...t, name })),
      setStartDate: (startDate) => setTrip((t) => ({ ...t, startDate })),
      setDayCount: (count) => updateDays((days) => resizeDays(days, count)),
      addSpot: (day, spotId) =>
        updateDays((days) => {
          if (!days[day] || days[day].includes(spotId)) return days;
          days[day].push(spotId);
          return days;
        }),
      removeStop: (day, index) =>
        updateDays((days) => {
          days[day]?.splice(index, 1);
          return days;
        }),
      moveStop: (day, index, delta) =>
        updateDays((days) => {
          const list = days[day];
          const target = index + delta;
          if (!list || target < 0 || target >= list.length) return days;
          [list[index], list[target]] = [list[target], list[index]];
          return days;
        }),
      moveStopToDay: (fromDay, index, toDay) =>
        updateDays((days) => {
          const [id] = days[fromDay]?.splice(index, 1) ?? [];
          if (id && days[toDay] && !days[toDay].includes(id)) days[toDay].push(id);
          return days;
        }),
      toggleDone: (day, spotId) =>
        setTrip((t) => {
          const key = `${day}:${spotId}`;
          return {
            ...t,
            done: t.done.includes(key) ? t.done.filter((k) => k !== key) : [...t.done, key],
          };
        }),
      replaceTrip: (next) => setTrip(sanitizeTrip(next)),
      resetTrip: () => setTrip(emptyTrip(trip.days.length)),
      toggleSaved: (spotId) =>
        setPrefs((p) => ({
          ...p,
          saved: p.saved.includes(spotId) ? p.saved.filter((s) => s !== spotId) : [...p.saved, spotId],
        })),
      completeOnboarding: ({ interests, dayCount, startDate }) => {
        setPrefs((p) => ({ ...p, interests, onboarded: true }));
        setTrip((t) => ({ ...t, startDate, days: resizeDays(t.days, dayCount) }));
      },
    }),
    [ready, trip, prefs, updateDays],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}

/** Grows or shrinks the trip. Stops on removed days are folded into the new last day, never dropped. */
function resizeDays(days: string[][], count: number): string[][] {
  const n = Math.max(1, Math.min(MAX_DAYS, count));
  if (n >= days.length) return [...days, ...Array.from({ length: n - days.length }, () => [])];
  const kept = days.slice(0, n);
  kept[n - 1] = [...new Set([...kept[n - 1], ...days.slice(n).flat()])];
  return kept;
}

/** Drops unknown spot ids (e.g. a spot removed in a later app version) and clamps the day count. */
function sanitizeTrip(trip: Trip): Trip {
  const days = (Array.isArray(trip.days) ? trip.days : [])
    .slice(0, MAX_DAYS)
    .map((d) => (Array.isArray(d) ? d.filter((id) => typeof id === 'string' && getSpot(id)) : []));
  return {
    name: typeof trip.name === 'string' && trip.name.trim() ? trip.name : 'My Korea trip',
    startDate: typeof trip.startDate === 'string' ? trip.startDate : null,
    days: days.length ? days : [[]],
    done: Array.isArray(trip.done) ? trip.done : [],
  };
}

export function dayDate(trip: Trip, dayIndex: number): string | null {
  return trip.startDate ? addDays(trip.startDate, dayIndex) : null;
}

export type TripPhase =
  | { kind: 'empty' }
  | { kind: 'undated' }
  | { kind: 'upcoming'; daysToGo: number }
  | { kind: 'during'; dayIndex: number }
  | { kind: 'past' };

export function tripPhase(trip: Trip): TripPhase {
  const stops = trip.days.reduce((n, d) => n + d.length, 0);
  if (!trip.startDate) return stops ? { kind: 'undated' } : { kind: 'empty' };
  const offset = daysBetween(trip.startDate, today());
  if (offset < 0) return { kind: 'upcoming', daysToGo: -offset };
  if (offset < trip.days.length) return { kind: 'during', dayIndex: offset };
  return { kind: 'past' };
}
