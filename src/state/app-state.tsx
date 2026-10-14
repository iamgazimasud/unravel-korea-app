import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getPlan, type PlanId } from '@/data/plans';
import * as ops from '@/state/trip-ops';
import type { Trip } from '@/state/trip-ops';

export {
  dayDate,
  dayTitle,
  doneKey,
  emptyTrip,
  stopCount,
  tripPhase,
  type Trip,
  type TripPhase,
} from '@/state/trip-ops';

export type Prefs = {
  onboarded: boolean;
  /** Signed up to Seoul Sip from inside the app. */
  subscribed: boolean;
};

/** Bump `version` and add a migration in `loadState` whenever this shape changes. */
type PersistedState = { version: 1; trip: Trip; prefs: Prefs };

export const STORAGE_KEY = 'unravel-korea/state';

const defaultPrefs: Prefs = { onboarded: false, subscribed: false };

type AppState = {
  ready: boolean;
  trip: Trip;
  prefs: Prefs;
  setStartDate: (date: string | null) => void;
  setDayCount: (count: number) => void;
  addSpot: (day: number, spotId: string) => void;
  removeStop: (day: number, index: number) => void;
  moveStop: (day: number, index: number, delta: -1 | 1) => void;
  moveStopToDay: (fromDay: number, index: number, toDay: number) => void;
  toggleDone: (day: number, spotId: string) => void;
  replaceTrip: (trip: Trip) => void;
  /** Replaces the trip with a ready-made plan, keeping the arrival date. */
  startPlan: (planId: PlanId) => void;
  /** Throws the plan away (keeps length and dates) so the traveler can pick another or build their own. */
  clearStops: () => void;
  setSubscribed: () => void;
  completeOnboarding: () => void;
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
      setStartDate: (startDate) => setTrip((t) => ({ ...t, startDate })),
      setDayCount: (count) => setTrip((t) => ops.resizeDays(t, count)),
      addSpot: (day, spotId) => setTrip((t) => ops.addSpot(t, day, spotId)),
      removeStop: (day, index) => setTrip((t) => ops.removeStop(t, day, index)),
      moveStop: (day, index, delta) => setTrip((t) => ops.moveStop(t, day, index, delta)),
      moveStopToDay: (fromDay, index, toDay) => setTrip((t) => ops.moveStopToDay(t, fromDay, index, toDay)),
      toggleDone: (day, spotId) => setTrip((t) => ops.toggleDone(t, day, spotId)),
      replaceTrip: (next) => setTrip(ops.sanitizeTrip(next)),
      startPlan: (planId) => {
        const plan = getPlan(planId);
        if (plan) setTrip((t) => ops.tripFromPlan(plan, t.startDate));
      },
      clearStops: () => setTrip((t) => ({ ...ops.clearStops(t), name: ops.DEFAULT_TRIP_NAME })),
      setSubscribed: () => setPrefs((p) => ({ ...p, subscribed: true })),
      completeOnboarding: () => setPrefs((p) => ({ ...p, onboarded: true })),
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
  // Older versions also saved `interests` and `saved` spots; those features are gone, so they are dropped.
  const raw = (input ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  return { onboarded: raw.onboarded === true, subscribed: raw.subscribed === true };
}
