import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import ImportScreen from '@/app/import';
import { STORAGE_KEY, AppStateProvider } from '@/state/app-state';

const mockParams = { n: "Mina's Seoul", d: 'bukchon.gwangjang~myeongdong', t: 'Royal Seoul~Shopping' };
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  useLocalSearchParams: () => mockParams,
}));

async function saved() {
  return JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? 'null');
}

describe('Opening a shared trip', () => {
  // Regression: on a fresh install the plan question came next, and picking a plan wiped the shared trip.
  it('on a fresh install, saves the trip and skips the plan question', async () => {
    await render(
      <AppStateProvider>
        <ImportScreen />
      </AppStateProvider>,
    );
    expect(await screen.findByText('2 days · 3 places')).toBeTruthy();
    expect(screen.getByText('Royal Seoul')).toBeTruthy();

    await fireEvent.press(screen.getAllByLabelText('Use this trip')[0]);

    expect(router.replace).toHaveBeenCalledWith('/');
    await waitFor(async () => expect((await saved())?.prefs.onboarded).toBe(true));
    expect((await saved())?.trip).toMatchObject({ name: "Mina's Seoul", dayTitles: ['Royal Seoul', 'Shopping'] });
  });
});
