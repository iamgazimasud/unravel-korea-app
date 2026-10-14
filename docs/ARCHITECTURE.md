# Architecture

A local-first Expo app. Everything the traveler creates lives on the device; the only network
calls are read-only content feeds and the optional newsletter signup.

```
                ┌────────────────────── device ──────────────────────┐
                │                                                    │
  Expo Router   │  screens (src/app)  ──►  useAppState()  ──► AsyncStorage
  file routes   │        │                 (React context)    "unravel-korea/state"
                │        │                     │                    │
                │        │               trip-ops.ts (pure)         │
                │        ▼                                          │
                │  useFeed(key, fetcher) ──► cache ────────► AsyncStorage
                │        │                                   "unravel-korea/cache/*"
                └────────┼───────────────────────────────────────────┘
                         │ HTTPS (15 s timeout)
          ┌──────────────┼──────────────────────┬─────────────────────────┐
          ▼              ▼                      ▼                         ▼
  WordPress REST   beehiiv sitemap/RSS   server/api/subscribe ──► beehiiv API
  unravelkorea.com seoulsip.online       (Vercel, holds API key)
```

## Modules

| Path                               | Responsibility                                                                                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`                         | Screens only. Expo Router turns files into routes; `(tabs)/` is the bottom-tab group.                                                                                                                                                       |
| `src/state/trip-ops.ts`            | **Pure** trip operations (add, move, resize, tick off, sanitize, phase). No React, fully unit-tested.                                                                                                                                       |
| `src/state/app-state.tsx`          | React context that holds the trip + preferences, persists them, and validates saved data on load.                                                                                                                                           |
| `src/data/`                        | Curated spot catalog, bundled destination photos + licence credits (`spot-photos.ts`), toolkit content. Tests enforce catalog integrity: unique link-safe ids, valid days, Korean names, and a photo with a complete credit for every spot. |
| `src/lib/content.ts`               | WordPress + beehiiv clients, entity decoding, request timeouts, newsletter signup call.                                                                                                                                                     |
| `src/lib/use-feed.ts`              | Cache-first feed hook: shows the saved copy instantly, refreshes in the background, dedupes parallel requests.                                                                                                                              |
| `src/lib/share.ts`                 | Trip ⇄ share link encoding (`unravelkorea://import?n=&s=&d=`) and plain-text itinerary.                                                                                                                                                     |
| `src/lib/maps.ts`                  | Naver Map / KakaoMap deep links with website fallback.                                                                                                                                                                                      |
| `src/components/`                  | Design system (`ui.tsx`: `BrandHeader` with the logo wave, `Screen`, buttons, chips, cards) and feature components (photo cards and rows, sheets).                                                                                          |
| `plugins/`                         | Expo config plugins (Android package-visibility `<queries>` for map apps).                                                                                                                                                                  |
| `server/`                          | Vercel serverless function for beehiiv signups — the only place the API key lives.                                                                                                                                                          |
| `scripts/generate-brand-assets.py` | Builds every icon, splash image and in-app logo from `assets/brand/source/`.                                                                                                                                                                |

## Key decisions

- **Design: "Seoul Blue".** Every screen opens with the navy → sky-blue gradient header and the
  logo's wave (`BrandHeader`); the status bar is always light. Colors and fonts live in `src/theme.ts`.
- **Launch sequence.** The native splash stays up until saved state and fonts are loaded, then
  `WelcomeOverlay` starts from the identical mark (size/colours locked to `app.json` by a test).
- **Photos are bundled** (≈1.8 MB WebP) so the app looks right offline; their CC/KOGL licences
  require the in-app Photo credits screen.
- **Web is a client-only preview** (`web.output: "single"`). Server pre-rendering caused light/dark
  hydration mismatches and adds nothing for an Android app.

- **Local-first, no accounts (v1).** Travelers often have bad signal; the plan must always open. Sync
  (Supabase) can be layered on later because all trip mutations go through `trip-ops.ts`.
- **Untrusted input is sanitized at the edges.** Saved state (from older versions) and shared links go
  through `sanitizeTrip` / `sanitizePrefs`: unknown spots dropped, dates validated, sizes capped.
- **Persisted state is versioned** (`version: 1`). Changing its shape means bumping the version and
  adding a migration in `loadState`.
- **Search Korean names in map apps.** Naver/Kakao match Korean queries far better than English.
- **API keys never ship in the app.** Anything secret goes behind `server/`.
- **No native modules beyond Expo SDK**, so the app runs in Expo Go and builds on EAS without custom
  native code.

## Testing

| Layer                               | Tooling                                                      | Where                         |
| ----------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| Pure logic, data integrity          | Jest (`jest-expo`)                                           | `src/**/__tests__/*.test.ts`  |
| State provider, components, screens | React Native Testing Library v14 (async API)                 | `src/**/__tests__/*.test.tsx` |
| Server function                     | Node's built-in test runner                                  | `server/test/`                |
| Whole app                           | CI bundles the Android JS with Hermes; manual run in Expo Go | `.github/workflows/ci.yml`    |

Tests run in a DST time zone (`jest.global-setup.js`) and start from empty storage
(`jest.setup-after-env.ts`).

## Known limitations / next steps

- **Share links use the `unravelkorea://` scheme**, which some chat apps don't make tappable. The
  plain-text itinerary is always included. Fix: Android App Links on `https://unravelkorea.com/trip?...`
  (host `/.well-known/assetlinks.json` on WordPress and add an `intentFilters` entry in `app.json`).
- **Seoul Sip titles come from post URLs** until beehiiv RSS is enabled (`newsletterRssUrl`).
- **Spot hours/prices are hand-maintained** in `src/data/spots.ts`; moving them to WordPress (custom
  post type) would let them be edited without an app release.
- `npm audit` reports advisories in Expo's build tooling (`@expo/cli`, config plugins). They are not
  part of the app bundle; take Expo SDK patch releases with `npx expo install --fix`.
