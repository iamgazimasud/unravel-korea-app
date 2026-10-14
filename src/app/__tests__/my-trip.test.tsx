import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';

import MyTripScreen from '@/app/(tabs)/index';
import OnboardingScreen from '@/app/onboarding';
import { addDays, today } from '@/lib/dates';
import { confirm } from '@/lib/platform';
import { AppStateProvider, STORAGE_KEY, useAppState } from '@/state/app-state';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock('@/lib/platform', () => ({ ...jest.requireActual('@/lib/platform'), confirm: jest.fn() }));

async function seed(trip: object) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, trip, prefs: { onboarded: true, subscribed: false } }),
  );
}

/** Shows the saved trip name so tests can see what a screen did to the state. */
function TripName() {
  const { trip } = useAppState();
  return <Text>{`trip: ${trip.name}`}</Text>;
}

async function renderWithState(ui: React.ReactElement) {
  await render(
    <AppStateProvider>
      {ui}
      <TripName />
    </AppStateProvider>,
  );
}

beforeEach(() => jest.clearAllMocks());

describe('My Trip', () => {
  it('offers the three ready-made plans and builds a whole trip in one tap', async () => {
    await renderWithState(<MyTripScreen />);
    expect(await screen.findByText('How long is your trip?')).toBeTruthy();
    expect(screen.getByLabelText(/^5 days in Seoul/)).toBeTruthy();
    expect(screen.getByLabelText(/^7 days in Seoul/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(/^3 days in Seoul/));

    expect(await screen.findByText('Your days')).toBeTruthy();
    expect(screen.getByText('Royal Seoul')).toBeTruthy();
    expect(screen.getByText('Gangnam & the Han River')).toBeTruthy();
    expect(screen.queryByText('How long is your trip?')).toBeNull();
    expect(screen.getByText('trip: 3 days in Seoul')).toBeTruthy();
  });

  it('always offers trip settings, even before there are places (date and length live there)', async () => {
    await renderWithState(<MyTripScreen />);
    expect(await screen.findByLabelText('Trip settings')).toBeTruthy();
  });

  it('says "1 place", not "1 places"', async () => {
    await renderWithState(<MyTripScreen />);
    await fireEvent.press(await screen.findByLabelText(/^7 days in Seoul/));
    expect(await screen.findByText(/^1 place · ~/)).toBeTruthy(); // the DMZ day
    expect(screen.queryByText(/\b1 places\b/)).toBeNull();
  });

  it('opens a day when you tap it', async () => {
    await seed({ name: 'Test', startDate: null, days: [['bukchon'], ['myeongdong']], dayTitles: ['', 'Shopping'] });
    await renderWithState(<MyTripScreen />);
    await fireEvent.press(await screen.findByLabelText('Day 2: Shopping'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/today', params: { day: '1' } });
  });

  it('asks for the arrival date until there is one', async () => {
    await seed({ name: 'Test', startDate: null, days: [['bukchon']] });
    await renderWithState(<MyTripScreen />);
    expect(await screen.findByLabelText('When do you land?')).toBeTruthy();
  });

  it('counts down to the trip and warns about places closed on the planned day', async () => {
    // 2030-01-01 is a Tuesday, and Gyeongbokgung Palace is closed on Tuesdays.
    await seed({ name: 'Test', startDate: '2030-01-01', days: [['gyeongbokgung'], ['bukchon']] });
    await renderWithState(<MyTripScreen />);
    expect(await screen.findByText(/days to go$/)).toBeTruthy();
    expect(screen.getByText('1 closed this day')).toBeTruthy();
  });

  it("puts today's plan one tap away during the trip", async () => {
    await seed({ name: 'Test', startDate: addDays(today(), -1), days: [['bukchon'], ['myeongdong'], []] });
    await renderWithState(<MyTripScreen />);
    expect(await screen.findByText('TODAY · DAY 2 OF 3')).toBeTruthy();
    expect(screen.getByText('Next: Myeongdong')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Open today's plan"));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/today', params: { day: '1' } });
  });
});

describe('Onboarding', () => {
  it('asks one question, then builds the chosen plan', async () => {
    await renderWithState(<OnboardingScreen />);
    await fireEvent.press(await screen.findByLabelText(/^7 days in Seoul/));
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(await screen.findByText('trip: 7 days in Seoul')).toBeTruthy();
  });

  it('asks before replacing places that are already planned (e.g. a trip imported from a link)', async () => {
    jest.mocked(confirm).mockResolvedValue(false);
    await seed({ name: "Mina's trip", startDate: null, days: [['bukchon']] });
    await AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify({ prefs: { onboarded: false, subscribed: false } }));
    await renderWithState(<OnboardingScreen />);
    await fireEvent.press(await screen.findByLabelText(/^3 days in Seoul/));
    expect(confirm).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByText("trip: Mina's trip")).toBeTruthy();
  });

  it('lets people skip the plan and browse places instead', async () => {
    await renderWithState(<OnboardingScreen />);
    await fireEvent.press(await screen.findByLabelText("I'll plan it myself"));
    expect(router.replace).toHaveBeenCalledWith('/explore');
    expect(screen.getByText('trip: My Korea trip')).toBeTruthy();
  });
});
