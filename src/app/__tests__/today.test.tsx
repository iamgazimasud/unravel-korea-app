import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import TodayScreen from '@/app/today';
import { addDays, today } from '@/lib/dates';
import { AppStateProvider, STORAGE_KEY } from '@/state/app-state';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

async function seed(startDate: string, days: string[][], done: string[] = []) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      trip: { name: 'Test', startDate, days, done },
      prefs: { onboarded: true, interests: [], saved: [], subscribed: false },
    }),
  );
}

/** The day chip that is currently selected. */
async function selectedDay() {
  const [chip] = (await screen.findAllByRole('button')).filter((b) => b.props.accessibilityState?.selected);
  return chip;
}

async function renderToday() {
  await render(
    <AppStateProvider>
      <TodayScreen />
    </AppStateProvider>,
  );
}

describe('Today mode', () => {
  // Regression: opening Today as the first screen used to show Day 1, because the day was picked
  // before the saved trip finished loading.
  it("opens on today's day of the trip on a cold start", async () => {
    await seed(addDays(today(), -1), [['gyeongbokgung'], ['myeongdong', 'bukchon'], []]);
    await renderToday();
    expect(await selectedDay()).toHaveTextContent('Day 2 · today');
    expect(screen.getByText('명동')).toBeTruthy(); // next up, in large Korean type
  });

  it('skips stops already ticked off', async () => {
    await seed(today(), [['myeongdong', 'bukchon']], ['0:myeongdong']);
    await renderToday();
    expect(await screen.findByText('NEXT UP')).toBeTruthy();
    expect(screen.getByText('북촌한옥마을')).toBeTruthy();
    expect(screen.getByText(/1 of 2 done/)).toBeTruthy();
  });

  it('starts on Day 1 before the trip begins', async () => {
    await seed(addDays(today(), 10), [['bukchon'], ['myeongdong']]);
    await renderToday();
    expect(await selectedDay()).toHaveTextContent('Day 1');
    expect(screen.queryByText(/· today/)).toBeNull();
  });
});
