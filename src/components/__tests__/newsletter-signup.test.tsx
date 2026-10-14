import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { NewsletterSignup } from '@/components/newsletter-signup';
import { subscribeToNewsletter } from '@/lib/content';
import { AppStateProvider } from '@/state/app-state';

const mockConfig = { subscribeEndpoint: 'https://api.example/subscribe' };
jest.mock('@/config', () => {
  const actual = jest.requireActual('@/config');
  return {
    Config: new Proxy(actual.Config, {
      get: (t, k) => (k in mockConfig ? mockConfig[k as 'subscribeEndpoint'] : t[k]),
    }),
  };
});
jest.mock('@/lib/content', () => ({
  ...jest.requireActual('@/lib/content'),
  subscribeToNewsletter: jest.fn(),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(), WebBrowserPresentationStyle: {} }));

const subscribe = subscribeToNewsletter as jest.MockedFunction<typeof subscribeToNewsletter>;

async function renderSignup() {
  await render(
    <AppStateProvider>
      <NewsletterSignup />
    </AppStateProvider>,
  );
}

beforeEach(() => {
  subscribe.mockReset();
  mockConfig.subscribeEndpoint = 'https://api.example/subscribe';
});

describe('NewsletterSignup', () => {
  it('rejects an invalid email without calling the server', async () => {
    await renderSignup();
    await fireEvent.changeText(await screen.findByLabelText('Email address'), 'not-an-email');
    await fireEvent.press(screen.getByLabelText('Subscribe'));
    expect(await screen.findByText('Please enter a valid email address.')).toBeTruthy();
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('subscribes and shows the confirmation', async () => {
    subscribe.mockResolvedValueOnce(true);
    await renderSignup();
    await fireEvent.changeText(await screen.findByLabelText('Email address'), ' you@example.com ');
    await fireEvent.press(screen.getByLabelText('Subscribe'));
    await waitFor(() => expect(subscribe).toHaveBeenCalledWith('you@example.com'));
    expect(await screen.findByText(/on the Seoul Sip list/)).toBeTruthy();
  });

  it('shows the server error and lets the user retry', async () => {
    subscribe.mockRejectedValueOnce(new Error('Too many signups right now'));
    await renderSignup();
    await fireEvent.changeText(await screen.findByLabelText('Email address'), 'you@example.com');
    await fireEvent.press(screen.getByLabelText('Subscribe'));
    expect(await screen.findByText('Too many signups right now')).toBeTruthy();
    expect(screen.getByLabelText('Subscribe')).toBeTruthy();
  });

  it('falls back to the beehiiv signup page when no endpoint is configured', async () => {
    mockConfig.subscribeEndpoint = '';
    await renderSignup();
    expect(await screen.findByLabelText('Subscribe free')).toBeTruthy();
    expect(screen.queryByLabelText('Email address')).toBeNull();
  });
});
