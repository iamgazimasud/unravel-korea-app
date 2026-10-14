import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import appJson from '../../../app.json';
import { SPLASH_MARK_WIDTH, WelcomeOverlay } from '@/components/welcome-overlay';
import { Palette } from '@/theme';

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/** Lets isReduceMotionEnabled resolve, then advances fake time (async so React can flush). */
async function flush(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

describe('WelcomeOverlay', () => {
  it('waits for the app to be ready before animating away', async () => {
    const onDone = jest.fn();
    await render(<WelcomeOverlay start={false} onDone={onDone} />);
    await flush(5000);
    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Unravel Korea. Tap to skip')).toBeTruthy();
  });

  // React Native's Jest setup runs Animated timings almost instantly, so this checks the hand-off,
  // not the exact duration (~1.6s on a device).
  it('plays once the app is ready, then hands over exactly once', async () => {
    const onDone = jest.fn();
    await render(<WelcomeOverlay start onDone={onDone} />);
    await flush(3000);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Your Korea trip, all in one place.')).toBeTruthy();
  });

  it('can be skipped with a tap', async () => {
    const onDone = jest.fn();
    await render(<WelcomeOverlay start onDone={onDone} />);
    await fireEvent.press(screen.getByLabelText('Unravel Korea. Tap to skip'));
    await flush(400);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skips the motion when Reduce motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const onDone = jest.fn();
    await render(<WelcomeOverlay start onDone={onDone} />);
    await flush(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('native splash config', () => {
  // The welcome starts from the splash's exact mark size and colours; if these drift apart the
  // hand-off visibly jumps.
  type SplashConfig = { imageWidth: number; backgroundColor: string; dark: { backgroundColor: string } };
  const entry = appJson.expo.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  const splash = (entry as [string, SplashConfig])[1];

  it('matches the welcome screen', () => {
    expect(splash.imageWidth).toBe(SPLASH_MARK_WIDTH);
    expect(splash.backgroundColor).toBe(Palette.light.background);
    expect(splash.dark.backgroundColor).toBe(Palette.dark.background);
  });

  it('fits inside the Android 12+ circular splash mask (192dp)', () => {
    const height = (SPLASH_MARK_WIDTH * 757) / 600;
    const halfDiagonal = Math.hypot(SPLASH_MARK_WIDTH / 2, height / 2);
    expect(halfDiagonal).toBeLessThanOrEqual(96);
  });
});
