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
      first.result.current.completeOnboarding({ interests: ['food'], dayCount: 2, startDate: '2026-11-02' });
      first.result.current.addSpot(0, 'gwangjang');
      first.result.current.toggleSaved('mangwon');
    });
    await waitFor(async () => expect((await saved())?.trip.days).toEqual([['gwangjang'], []]));
    await first.unmount();

    const second = await renderState();
    expect(second.result.current.trip).toMatchObject({ startDate: '2026-11-02', days: [['gwangjang'], []] });
    expect(second.result.current.prefs).toMatchObject({ onboarded: true, interests: ['food'], saved: ['mangwon'] });
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
        prefs: { onboarded: true, interests: ['food', 'astrology'], saved: ['removed-spot'], subscribed: 'yes' },
      }),
    );
    const { result } = await renderState();
    expect(result.current.trip).toMatchObject({ name: 'Old', startDate: null, days: [['bukchon']] });
    expect(result.current.prefs).toEqual({ onboarded: true, interests: ['food'], saved: [], subscribed: false });
  });

  it('clearStops keeps the trip name and dates', async () => {
    const { result } = await renderState();
    await act(() => {
      result.current.setTripName('Seoul');
      result.current.setStartDate('2026-11-02');
      result.current.addSpot(0, 'bukchon');
    });
    await act(() => result.current.clearStops());
    expect(result.current.trip).toMatchObject({ name: 'Seoul', startDate: '2026-11-02', days: [[], [], []] });
  });

  it('throws a clear error when used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useAppState())).rejects.toThrow('inside <AppStateProvider>');
  });
});
