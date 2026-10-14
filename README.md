# Unravel Korea — mobile app

One app for **Unravel Korea** (travel guides + trip planner) and **Seoul Sip** (the newsletter).
Built with Expo (SDK 57), Expo Router and TypeScript. iOS, Android and web from one codebase.

## What's in v1

| Tab | What it does |
|---|---|
| **Home** | Trip countdown / "Day 2 of 5" card, spots picked from your interests, latest guides, latest Seoul Sip, travel essentials (affiliate links) |
| **Explore** | 32 curated spots with search (English or Korean), categories, saved spots, one-tap "add to day" |
| **My Trip** | Day-by-day planner: trip name, start date, length, reorder / move / remove stops, hours-per-day, **closed-day warnings**, share link |
| **Read** | Unravel Korea guides (WordPress API) and Seoul Sip posts, cached for offline reading |
| **Toolkit** | Korean phrases with audio + full-screen "show staff" mode, emergency numbers, transit/taxi/money tips |
| **Today mode** | Next stop, Korean name in big type, directions, **Open in Naver Map / KakaoMap**, taxi card, tick off stops |
| **Spot page** | Hours, cost, directions, tips, map buttons, taxi card, related blog posts |
| **Shared trips** | `unravelkorea://import?n=…&s=…&d=…` opens a preview and lets a friend copy the trip |

Everything about the trip is stored on the phone (AsyncStorage), so it works with no signal.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go on your phone
npm run web             # or try it in the browser
```

Checks: `npm run typecheck` · `npm run lint` · `npx expo-doctor`

> On **web only**, the Seoul Sip feed is blocked by the browser (CORS) and shows a "can't reach" card with an
> "Open website" button. The iOS/Android apps are not affected.

## Things to change before launch

All in [`src/config.ts`](src/config.ts):

- **Affiliate links** in `Essentials` (eSIM, airport train, DMZ tours, hotels) — currently plain Klook/Agoda links.
- **Seoul Sip RSS** — turn on RSS in beehiiv and paste the feed URL into `newsletterRssUrl` to get real titles
  and images. Until then the app reads the public sitemap (titles come from the post URL).
- Social links.

Spot data lives in [`src/data/spots.ts`](src/data/spots.ts) — same 32 places as the web planner. Hours, closed
days and prices are approximate; please re-check them before publishing.

## Ship it

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform all       # store builds in the cloud
npx eas-cli@latest submit --platform ios      # / android
```

Bundle id / package: `com.unravelkorea.app` · URL scheme: `unravelkorea` (both in `app.json`).

## Project layout

```
src/
  app/                 screens (Expo Router)
    (tabs)/            Home, Explore, My Trip, Read, Toolkit
    spot/[id].tsx      spot details
    today.tsx          Today mode
    import.tsx         open a shared trip
    onboarding.tsx     first launch
  components/          UI kit + spot card, add-to-trip sheet, article row, steppers
  data/                curated spots, phrases, tips
  lib/                 content feeds + offline cache, map deep links, sharing, dates
  state/app-state.tsx  trip + preferences, persisted on device
  config.ts            URLs and affiliate links
  theme.ts             colors (light/dark), spacing
```

## Next up (v2 ideas)

- Supabase sync so trips follow you across devices, plus accounts
- AI itinerary builder ("5 days, foodie, K-drama spots") using only curated spots
- K-drama / K-pop filming-location collection
- Push notifications (cherry blossom forecast, festivals, trip reminders)
- Drag-and-drop reordering, offline photo packs, premium itineraries (RevenueCat)
