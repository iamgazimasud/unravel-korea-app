/**
 * App-wide configuration. Everything you are likely to change before launch lives here.
 */

export const Config = {
  appName: 'Unravel Korea',

  /** WordPress blog that powers the Guides feed. */
  blogUrl: 'https://unravelkorea.com',

  /** Seoul Sip (beehiiv) newsletter. */
  newsletterUrl: 'https://www.seoulsip.online',
  newsletterSubscribeUrl: 'https://www.seoulsip.online/subscribe',
  /**
   * Optional: turn on the RSS feed in beehiiv (Settings → Publication → RSS) and paste the
   * https://rss.beehiiv.com/feeds/<id>.xml URL here for real titles and images.
   * While this is empty the app reads the public sitemap instead.
   */
  newsletterRssUrl: '',

  /**
   * In-app newsletter signup. Deploy `server/` to Vercel (see server/README.md), then set
   * EXPO_PUBLIC_SUBSCRIBE_ENDPOINT=https://<your-project>.vercel.app/api/subscribe (in `.env` or as an
   * EAS environment variable) or paste the URL here. Your beehiiv API key stays on the server.
   * While this is empty, "Subscribe" opens the beehiiv signup page instead.
   */
  subscribeEndpoint: process.env.EXPO_PUBLIC_SUBSCRIBE_ENDPOINT ?? '',

  /** Required by Google Play for the store listing and in-app. */
  privacyPolicyUrl: 'https://unravelkorea.com/privacy-policy/',

  /** WordPress category ids shown as filters in the Read tab (from /wp-json/wp/v2/categories). */
  blogCategories: [
    { id: 21, label: 'Travel & Destinations' },
    { id: 25, label: 'Korean Food' },
    { id: 23, label: 'Reviews' },
  ],

  /** The existing web planner, used as a fallback when sharing to people without the app. */
  webPlannerUrl: 'https://unravel-korea-tools.vercel.app',

  social: {
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
  },
} as const;

export type Essential = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  /** TODO: swap each url for your own affiliate link (Klook, Trip.com, Agoda, ...). */
  url: string;
};

/** Travel essentials shown on Home — the main affiliate surface. */
export const Essentials: Essential[] = [
  {
    id: 'esim',
    title: 'Korea eSIM / data',
    subtitle: 'Naver Map and Papago need data from the minute you land.',
    icon: 'wifi',
    url: 'https://www.klook.com/en-US/search/result/?query=korea%20esim',
  },
  {
    id: 'airport',
    title: 'Incheon airport transfer',
    subtitle: 'AREX train tickets or a private pick-up into Seoul.',
    icon: 'airplane',
    url: 'https://www.klook.com/en-US/search/result/?query=arex',
  },
  {
    id: 'tours',
    title: 'DMZ & day tours',
    subtitle: 'The DMZ is tour-only — book a few days ahead.',
    icon: 'bus',
    url: 'https://www.klook.com/en-US/search/result/?query=dmz%20tour',
  },
  {
    id: 'stay',
    title: 'Where to stay in Seoul',
    subtitle: 'Myeongdong, Hongdae or Jongno for first-timers.',
    icon: 'bed',
    url: 'https://www.agoda.com/city/seoul-kr.html',
  },
];
