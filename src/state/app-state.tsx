import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getSpot, InterestLabels, type Interest } from '@/data/spots';
import * as ops from '@/state/trip-ops';
import type { Trip } from '@/state/trip-ops';

export { dayDate, emptyTrip, stopCount, tripPhase, type Trip, type TripPhase } from '@/state/trip-ops';

export type Prefs = {
  onboarded: boolean;
  interests: Interest[];
  saved: string[];
  /** Signed up to Seoul Sip from inside the app. */
  subscribed: boolean;
};

/** Bump `version` and add a migration in `loadState` whenever this shape changes. */
type PersistedState = { version: 1; trip: Trip; prefs: Prefs };

export const STORAGE_KEY = 'unravel-korea/state';

const defaultPrefs: Prefs = { onboarded: false, interests: [], saved: [], subscribed: false };

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
  /** Removes every stop but keeps the trip's name, dates and length. */
  clearStops: () => void;
  toggleSaved: (spotId: string) => void;
  setSubscribed: () => void;
  completeOnboarding: (input: { interests: Interest[]; dayCount: number; startDate: string | null }) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [trip, setTrip] = useState<Trip>(() => ops.emptyTrip());
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const loaded = useRef(false);

  useEffect(() => {
    loadState()
      .then((saved) => {
        if (!saved) return;
        setTrip(saved.trip);
        setPrefs(saved.prefs);
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const state: PersistedState = { version: 1, trip, prefs };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Storage full or unavailable: the in-memory trip keeps working for this session.
    });
  }, [trip, prefs]);

  const value = useMemo<AppState>(
    () => ({
      ready,
      trip,
      prefs,
      setTripName: (name) => setTrip((t) => ({ ...t, name: name.slice(0, 60) })),
      setStartDate: (startDate) => setTrip((t) => ({ ...t, startDate })),
      setDayCount: (count) => setTrip((t) => ops.resizeDays(t, count)),
      addSpot: (day, spotId) => setTrip((t) => ops.addSpot(t, day, spotId)),
      removeStop: (day, index) => setTrip((t) => ops.removeStop(t, day, index)),
      moveStop: (day, index, delta) => setTrip((t) => ops.moveStop(t, day, index, delta)),
      moveStopToDay: (fromDay, index, toDay) => setTrip((t) => ops.moveStopToDay(t, fromDay, index, toDay)),
      toggleDone: (day, spotId) => setTrip((t) => ops.toggleDone(t, day, spotId)),
      replaceTrip: (next) => setTrip(ops.sanitizeTrip(next)),
      clearStops: () => setTrip(ops.clearStops),
      toggleSaved: (spotId) =>
        setPrefs((p) => ({
          ...p,
          saved: p.saved.includes(spotId) ? p.saved.filter((s) => s !== spotId) : [...p.saved, spotId],
        })),
      setSubscribed: () => setPrefs((p) => ({ ...p, subscribed: true })),
      completeOnboarding: ({ interests, dayCount, startDate }) => {
        setPrefs((p) => ({ ...p, interests, onboarded: true }));
        setTrip((t) => ops.resizeDays({ ...t, startDate }, dayCount));
      },
    }),
    [ready, trip, prefs],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}

/** Reads and validates saved state. Returns null for a first launch or unreadable data. */
export async function loadState(): Promise<{ trip: Trip; prefs: Prefs } | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== 1) return null;
    return { trip: ops.sanitizeTrip(parsed.trip), prefs: sanitizePrefs(parsed.prefs) };
  } catch {
    // Corrupt storage: start fresh rather than crash.
    return null;
  }
}

function sanitizePrefs(input: unknown): Prefs {
  const raw = (input ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    onboarded: raw.onboarded === true,
    interests: strings(raw.interests).filter((i): i is Interest => i in InterestLabels),
    saved: strings(raw.saved).filter((id) => !!getSpot(id)),
    subscribed: raw.subscribed === true,
  };
}
