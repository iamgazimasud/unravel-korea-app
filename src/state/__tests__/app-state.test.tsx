import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { AppStateProvider, STORAGE_KEY, useAppState } from '@/state/app-state';

const wrapper = ({ children }: { children: ReactNode }) => <AppStateProvider>{children}</AppStateProvider>;

async function renderState() {
  const hook = await renderHook(() => useAppState(), { wrapper });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
}

async function saved() {
  return JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? 'null');
}

describe('AppStateProvider', () => {
  it('starts with an empty trip on first launch', async () => {
    const { result } = await renderState();
    expect(result.current.prefs.onboarded).toBe(false);
    expect(result.current.trip.days.flat()).toEqual([]);
  });

  it('persists changes and restores them on the next launch', async () => {
    const first = await renderState();
    await act(() => {
      first.result.current.completeOnboarding();
      first.result.current.setDayCount(2);
      first.result.current.setStartDate('2026-11-02');
      first.result.current.addSpot(0, 'gwangjang');
    });
    await waitFor(async () => expect((await saved())?.trip.days).toEqual([['gwangjang'], []]));
    await first.unmount();

    const second = await renderState();
    expect(second.result.current.trip).toMatchObject({ startDate: '2026-11-02', days: [['gwangjang'], []] });
    expect(second.result.current.prefs).toEqual({ onboarded: true, subscribed: false });
  });

  it('starts a ready-made plan and keeps the arrival date', async () => {
    const { result } = await renderState();
    await act(() => result.current.setStartDate('2026-11-02'));
    await act(() => result.current.startPlan('5'));
    expect(result.current.trip).toMatchObject({ name: '5 days in Seoul', startDate: '2026-11-02' });
    expect(result.current.trip.days).toHaveLength(5);
    expect(result.current.trip.dayTitles[3]).toBe('Day trip: Suwon fortress');
  });

  it('recovers from corrupt or outdated storage', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{not json');
    expect((await renderState()).result.current.trip.days.flat()).toEqual([]);
  });

  it('sanitizes saved data from older app versions', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        trip: { name: 'Old', startDate: 'bad', days: [['bukchon', 'removed-spot']], done: [] },
        // `interests` and `saved` come from an older version that had those features.
        prefs: { onboarded: true, interests: ['food'], saved: ['bukchon'], subscribed: 'yes' },
      }),
    );
    const { result } = await renderState();
    expect(result.current.trip).toMatchObject({ name: 'Old', startDate: null, days: [['bukchon']], dayTitles: [''] });
    expect(result.current.prefs).toEqual({ onboarded: true, subscribed: false });
  });

  it('starting over clears the plan but keeps the dates and length', async () => {
    const { result } = await renderState();
    await act(() => {
      result.current.setStartDate('2026-11-02');
      result.current.startPlan('3');
    });
    await act(() => result.current.clearStops());
    expect(result.current.trip).toMatchObject({
      name: 'My Korea trip',
      startDate: '2026-11-02',
      days: [[], [], []],
      dayTitles: ['', '', ''],
    });
  });

  it('throws a clear error when used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useAppState())).rejects.toThrow('inside <AppStateProvider>');
  });
});
