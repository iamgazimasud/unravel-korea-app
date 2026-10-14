# Changelog

All notable changes to the app. Versions match `version` in `app.json`.

## 1.0.0 — unreleased

First Android release.

- Simpler app. First launch asks one question — "How long is your trip?" — and one tap builds a
  complete 3, 5 or 7-day Seoul plan from the blog's day-by-day itineraries, with a theme per day.
  Four tabs instead of five: **My Trip** (countdown, today, day cards), **Places**, **Korean** and
  **Read**. Removed: interests, saved spots, trip renaming, KakaoMap button, blog search/categories,
  the separate Toolkit tab. Trip settings (arrival date, length, share, start over) live in one sheet.

- Branded launch: the native splash shows the N Seoul Tower mark (sized for Android 12+'s circular
  splash mask), then a ~1.5s welcome continues from it — the tower lifts, the wordmark and tagline
  fade in, and it dissolves into the app. Tap to skip; skipped entirely with Reduce motion.

- "Seoul Blue" design: navy-to-blue headers with the logo's wave on every screen, Plus Jakarta Sans,
  brand-blue buttons/chips, and photos everywhere — 32 bundled destination photos (offline) with a
  Photo credits screen for their free licences. The trip planner's per-stop buttons are replaced by
  one action sheet (move up/down, move to another day, remove).
- Unravel Korea brand: N Seoul Tower logo as app icon (adaptive + themed), splash screen (light and
  dark), in-app logo, and a blue/navy theme taken from the logo with AA-contrast text.

- Day-by-day trip with closed-day warnings, reordering and share links.
- Day view: next stop, subway directions, Naver Map, taxi card, tick-off.
- 32 curated places with search and filters.
- Read tab: Seoul Sip posts (beehiiv) and Unravel Korea guides (WordPress) with paging.
- In-app Seoul Sip signup via the `server/` function, with web fallback.
- Korean: essential phrases with audio, emergency numbers, travel tips.
- Works offline: trip and recently loaded articles are stored on the device.
