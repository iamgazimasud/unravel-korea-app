import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import TodayScreen from '@/app/today';
import { addDays, today } from '@/lib/dates';
import { AppStateProvider, STORAGE_KEY } from '@/state/app-state';

const mockParams: { day?: string } = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

beforeEach(() => {
  delete mockParams.day;
});

async function seed(startDate: string, days: string[][], done: string[] = [], dayTitles: string[] = []) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      trip: { name: 'Test', startDate, days, dayTitles, done },
      prefs: { onboarded: true, subscribed: false },
    }),
  );
}

async function renderToday() {
  await render(
    <AppStateProvider>
      <TodayScreen />
    </AppStateProvider>,
  );
}

describe('Day screen', () => {
  // Regression: opening Today as the first screen used to show Day 1, because the day was picked
  // before the saved trip finished loading.
  it("opens on today's day of the trip on a cold start", async () => {
    await seed(addDays(today(), -1), [['gyeongbokgung'], ['myeongdong', 'bukchon'], []], [], ['', 'Modern Seoul', '']);
    await renderToday();
    expect(await screen.findByText('TODAY · DAY 2 OF 3')).toBeTruthy();
    expect(screen.getByText('Modern Seoul')).toBeTruthy();
    expect(screen.getByText('명동')).toBeTruthy(); // next up, in large Korean type
  });

  it('opens the day it was asked for', async () => {
    mockParams.day = '1';
    await seed(addDays(today(), 10), [['bukchon'], ['myeongdong']]);
    await renderToday();
    expect(await screen.findByText('DAY 2 OF 2')).toBeTruthy();
    expect(screen.getByText('Day 2')).toBeTruthy(); // untitled day
  });

  it('copes with a day number that no longer exists', async () => {
    mockParams.day = '9';
    await seed(addDays(today(), 10), [['bukchon'], ['myeongdong']]);
    await renderToday();
    expect(await screen.findByText('DAY 2 OF 2')).toBeTruthy();
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
    expect(await screen.findByText('DAY 1 OF 2')).toBeTruthy();
    expect(screen.queryByText(/TODAY/)).toBeNull();
  });
});
