# Unravel Korea — Android app

One app for **Unravel Korea** (WordPress travel blog + trip planner) and **Seoul Sip** (beehiiv newsletter).
Android first; the same code also builds for iOS and web later.

Built with Expo SDK 57, Expo Router and TypeScript.

## What's in v1

Built to be obvious on first use: **one question to start, four tabs, two or three buttons per screen.**

| Screen           | What it does                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Welcome**      | "How long is your trip?" — 3, 5 or 7 days. One tap builds a complete day-by-day Seoul plan from the blog's itinerary     |
| **My Trip**      | Countdown, then "Today · Day 2 of 5". Each day is a card with its theme ("Royal Seoul") and photos. Before-you-fly links |
| **Day**          | Next stop with the Korean name in big type, **Directions** (Naver Map) and **Taxi card**; tick stops off; move/remove    |
| **Places**       | 32 curated places with photos, search in English or Korean, 4 simple filters, one-tap "add to my trip"                   |
| **Korean**       | The 12 phrases you'll actually use (audio + full-screen "show staff"), emergency numbers, 3 tips                         |
| **Read**         | Seoul Sip signup and latest issues, latest Unravel Korea guides (cached offline), about & privacy                        |
| **Shared trips** | `unravelkorea://import?n=…&s=…&d=…` opens a preview so a friend can copy the trip                                        |

Trips and all 32 destination photos are stored on the phone, so everything trip-related works with no signal.

## How it connects to your sites

| Source                                  | How                                                                                 | Setup needed                                                                                                                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WordPress** (unravelkorea.com)        | Public REST API `/wp-json/wp/v2/posts` — posts, featured images, categories, search | None                                                                                                                                                       |
| **beehiiv** (seoulsip.online) — reading | Public sitemap (titles come from post URLs)                                         | Optional: turn on RSS in beehiiv and paste the feed URL into `newsletterRssUrl` for real titles + images                                                   |
| **beehiiv** — signup                    | App → `server/api/subscribe` (Vercel) → beehiiv API                                 | Deploy `server/` and set `EXPO_PUBLIC_SUBSCRIBE_ENDPOINT` — see [server/README.md](server/README.md). Until then "Subscribe" opens the beehiiv signup page |

The beehiiv API key only ever lives on the server, never in the APK.

## Try it on your Android phone

**Easiest:** download the latest test build from
[Releases → Test build](https://github.com/iamgazimasud/unravel-korea-app/releases/tag/test-build) on your phone and
open it (allow installing from your browser when Android asks). It is rebuilt automatically on every change to `main`
by `.github/workflows/test-apk.yml`.

**For development:**

```bash
npm install
npx expo start
```

Install **Expo Go** from the Play Store and scan the QR code. Code changes show up instantly.
Requires Node 22.13+ (`.nvmrc`).

## Quality checks

| Command                           | What it does                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                   | Everything below, in order — run before every push                                                                                                                  |
| `npm run typecheck`               | TypeScript (strict)                                                                                                                                                 |
| `npm run lint`                    | ESLint (Expo config)                                                                                                                                                |
| `npm run format` / `format:check` | Prettier                                                                                                                                                            |
| `npm test`                        | Jest + React Native Testing Library: trip logic, share links, content parsing, state persistence, signup form, ready-made plans, My Trip / onboarding / day screens |
| `npm run test:server`             | The beehiiv signup function (Node test runner)                                                                                                                      |

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs all of these plus `expo-doctor` and a
Hermes Android bundle on every push and pull request. **Actions → Android build** starts an EAS build on
demand (needs an `EXPO_TOKEN` secret).

## Build an APK to share with testers

```bash
npx eas-cli@latest login            # free Expo account
npx eas-cli@latest init             # links the project (adds the project id to app.json)
npm run build:apk                   # cloud build → download link for an installable .apk
```

To turn on in-app newsletter signup for builds, add the variable once:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUBSCRIBE_ENDPOINT \
  --value https://<your-project>.vercel.app/api/subscribe --environment preview --environment production --visibility plaintext
```

For local development, copy `.env.example` to `.env` instead.

## Publish on Google Play

Store text, graphics, screenshots and the Data safety / content-rating answers are ready in
[`store/`](store/listing.md). The full release process and smoke test are in
[`docs/RELEASING.md`](docs/RELEASING.md).

1. Create a Google Play developer account (one-time $25) and a new app named **Unravel Korea**.
2. `npm run build:android` — builds a signed **.aab**. EAS creates and stores the upload key for you.
3. Upload the first .aab by hand in Play Console → **Testing → Internal testing**. Google requires the first upload to be manual.
4. After that, `npm run submit:android` uploads new builds to the internal track as drafts. This needs a
   Play service-account key; `eas submit` walks you through it.
5. Store listing checklist:
   - Privacy policy: `https://unravelkorea.com/privacy-policy/` (also linked inside the app under Read → About).
     Make sure it mentions the newsletter email signup.
   - **Data safety**: the app collects **email address** (optional, only if the user subscribes), shared with
     beehiiv to send the newsletter. Nothing else is collected; trips stay on the device.
   - Content rating questionnaire → Everyone. Target audience 18+ or 13+ (no child-directed content).
   - Screenshots: phone 1080×1920+ — ready-made ones are in `store/screenshots/`.
   - App icon 512×512 and feature graphic 1024×500.

Package name: `com.unravelkorea.app` · deep-link scheme: `unravelkorea` (both in `app.json`).
Version codes are managed by EAS (`appVersionSource: remote`, auto-incremented on production builds).

## Android specifics already handled

- Only the `INTERNET` permission is requested (storage / overlay permissions are blocked) → simple data-safety form.
- `<queries>` for Naver Map and KakaoMap (Android 11+ package visibility) via `plugins/with-android-map-queries.js`;
  if neither app is installed the buttons open the map websites.
- Links open in a Chrome Custom Tab in brand blue.
- Korean phrase audio checks for a Korean text-to-speech voice and explains how to install one if missing.
- Adaptive + themed (monochrome) launcher icon, edge-to-edge layout, keyboard resizes the screen.

## Brand

Your logo lives in [`assets/brand/source/`](assets/brand/source) (master copies). Every app icon, the
Android adaptive/monochrome icon, splash screen, favicon, store icon and in-app logo (with a dark-mode
version) is generated from it:

```bash
python3 scripts/generate-brand-assets.py   # needs Pillow + numpy
```

Colors come from the logo too (`Brand` and `Palette` in [`src/theme.ts`](src/theme.ts)): sky blue
`#1E8CC8`, navy `#283858`; buttons use `#1677B3` so white text meets WCAG AA contrast.

## Things to change before launch

All in [`src/config.ts`](src/config.ts):

- **Affiliate links** in `Essentials` (eSIM, airport train, DMZ tours, hotels) — currently plain Klook/Agoda links.
- `newsletterRssUrl` (optional, see above) and social links.

Spot data lives in [`src/data/spots.ts`](src/data/spots.ts) — the same 32 places as the web planner. Hours,
closed days and prices are approximate; re-check them before publishing.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the app is put together, key decisions, known limitations
- [`docs/RELEASING.md`](docs/RELEASING.md) — build, submit, smoke test, hotfix, rollback
- [`store/listing.md`](store/listing.md) — Google Play listing and policy answers
- [`CHANGELOG.md`](CHANGELOG.md)

## Project layout

```
src/
  app/                 screens (Expo Router)
    (tabs)/            My Trip (index), Places (explore), Korean, Read
    spot/[id].tsx      place details
    today.tsx          one day of the trip (?day=N, or today)
    import.tsx         open a shared trip
    onboarding.tsx     first launch
  components/          UI kit, sheets (add to trip, stop actions, trip settings), plan card, spot card, …
  data/                curated spots, ready-made 3/5/7-day plans, Korean phrases
  lib/                 WordPress + beehiiv feeds, offline cache, map deep links, sharing, speech, dates
  state/trip-ops.ts    pure trip operations (unit-tested)
  state/app-state.tsx  trip + preferences, persisted and validated on device
  config.ts            URLs and affiliate links
  theme.ts             colors (light/dark), spacing
plugins/               Expo config plugins (Android map-app queries)
server/                Vercel function for beehiiv signup (+ tests)
store/                 Google Play listing text, icon, feature graphic, screenshots
scripts/               brand asset generator
assets/brand/          logo sources + generated in-app logos
docs/                  architecture and release guides
.github/workflows/     CI and on-demand Android builds
```

## Next up (v2 ideas)

- Supabase sync so trips follow you across devices, plus accounts
- More ready-made plans (Busan, foodie Seoul, K-drama locations) — they are just data in `src/data/plans.ts`
- K-drama / K-pop filming-location collection
- Push notifications (cherry blossom forecast, festivals, trip reminders)
- Read full WordPress posts natively inside the app
- Drag-and-drop reordering, offline photo packs, premium itineraries (RevenueCat)
