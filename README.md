# Unravel Korea — Android app

One app for **Unravel Korea** (WordPress travel blog + trip planner) and **Seoul Sip** (beehiiv newsletter).
Android first; the same code also builds for iOS and web later.

Built with Expo SDK 57, Expo Router and TypeScript.

## What's in v1

| Screen | What it does |
|---|---|
| **Onboarding** | Trip length, arrival date, interests, and in-app Seoul Sip signup |
| **Home** | Trip countdown / "Day 2 of 5" card, spots picked from your interests, latest guides, latest Seoul Sip, travel essentials (affiliate links) |
| **Explore** | 32 curated spots, search in English or Korean, categories, saved spots, one-tap "add to day" |
| **My Trip** | Day-by-day planner: name, start date, length, reorder / move / remove stops, hours per day, **closed-day warnings**, share link |
| **Today mode** | Next stop, Korean name in big type, directions, **Open in Naver Map / KakaoMap**, taxi card, tick off stops |
| **Read** | WordPress guides with category filters, search and "Load more"; Seoul Sip posts; both cached for offline reading |
| **Toolkit** | Korean phrases with audio + full-screen "show staff" mode, emergency numbers, tips, privacy policy |
| **Shared trips** | `unravelkorea://import?n=…&s=…&d=…` opens a preview so a friend can copy the trip |

Trips are stored on the phone, so everything trip-related works with no signal.

## How it connects to your sites

| Source | How | Setup needed |
|---|---|---|
| **WordPress** (unravelkorea.com) | Public REST API `/wp-json/wp/v2/posts` — posts, featured images, categories, search | None. Category ids for the Read filters are in `src/config.ts` |
| **beehiiv** (seoulsip.online) — reading | Public sitemap (titles come from post URLs) | Optional: turn on RSS in beehiiv and paste the feed URL into `newsletterRssUrl` for real titles + images |
| **beehiiv** — signup | App → `server/api/subscribe` (Vercel) → beehiiv API | Deploy `server/` and set `EXPO_PUBLIC_SUBSCRIBE_ENDPOINT` — see [server/README.md](server/README.md). Until then "Subscribe" opens the beehiiv signup page |

The beehiiv API key only ever lives on the server, never in the APK.

## Run it on your Android phone

```bash
npm install
npx expo start
```

Install **Expo Go** from the Play Store and scan the QR code. Code changes show up instantly.

Checks before committing: `npm run typecheck` · `npm run lint` · `npx expo-doctor`

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

1. Create a Google Play developer account (one-time $25) and a new app named **Unravel Korea**.
2. `npm run build:android` — builds a signed **.aab**. EAS creates and stores the upload key for you.
3. Upload the first .aab by hand in Play Console → **Testing → Internal testing**. Google requires the first upload to be manual.
4. After that, `npm run submit:android` uploads new builds to the internal track as drafts. This needs a
   Play service-account key; `eas submit` walks you through it.
5. Store listing checklist:
   - Privacy policy: `https://unravelkorea.com/privacy-policy/` (also linked inside the app under Toolkit → About).
     Make sure it mentions the newsletter email signup.
   - **Data safety**: the app collects **email address** (optional, only if the user subscribes), shared with
     beehiiv to send the newsletter. Nothing else is collected; trips stay on the device.
   - Content rating questionnaire → Everyone. Target audience 18+ or 13+ (no child-directed content).
   - Screenshots: phone 1080×1920+ (Home, My Trip, Today mode, Explore, Read).
   - App icon 512×512 and feature graphic 1024×500.

Package name: `com.unravelkorea.app` · deep-link scheme: `unravelkorea` (both in `app.json`).
Version codes are managed by EAS (`appVersionSource: remote`, auto-incremented on production builds).

## Android specifics already handled

- Only the `INTERNET` permission is requested (storage / overlay permissions are blocked) → simple data-safety form.
- `<queries>` for Naver Map and KakaoMap (Android 11+ package visibility) via `plugins/with-android-map-queries.js`;
  if neither app is installed the buttons open the map websites.
- Links open in a Chrome Custom Tab in brand red.
- Korean phrase audio checks for a Korean text-to-speech voice and explains how to install one if missing.
- Adaptive + themed (monochrome) launcher icon, edge-to-edge layout, keyboard resizes the screen.

## Things to change before launch

All in [`src/config.ts`](src/config.ts):

- **Affiliate links** in `Essentials` (eSIM, airport train, DMZ tours, hotels) — currently plain Klook/Agoda links.
- `newsletterRssUrl` (optional, see above) and social links.

Spot data lives in [`src/data/spots.ts`](src/data/spots.ts) — the same 32 places as the web planner. Hours,
closed days and prices are approximate; re-check them before publishing.

## Project layout

```
src/
  app/                 screens (Expo Router)
    (tabs)/            Home, Explore, My Trip, Read, Toolkit
    spot/[id].tsx      spot details
    today.tsx          Today mode
    import.tsx         open a shared trip
    onboarding.tsx     first launch
  components/          UI kit, spot card, add-to-trip sheet, article row, newsletter signup, steppers
  data/                curated spots, phrases, tips
  lib/                 WordPress + beehiiv feeds, offline cache, map deep links, sharing, speech, dates
  state/app-state.tsx  trip + preferences, persisted on device
  config.ts            URLs, blog categories, affiliate links
  theme.ts             colors (light/dark), spacing
plugins/               Expo config plugins (Android map-app queries)
server/                Vercel function for beehiiv signup
```

## Next up (v2 ideas)

- Supabase sync so trips follow you across devices, plus accounts
- AI itinerary builder ("5 days, foodie, K-drama spots") using only curated spots
- K-drama / K-pop filming-location collection
- Push notifications (cherry blossom forecast, festivals, trip reminders)
- Read full WordPress posts natively inside the app
- Drag-and-drop reordering, offline photo packs, premium itineraries (RevenueCat)
