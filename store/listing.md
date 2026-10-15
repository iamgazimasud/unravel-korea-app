# Google Play listing — Unravel Korea

Everything needed for Play Console → **Grow → Store presence → Main store listing**, plus the policy
forms. Assets are in this folder.

## Text

**App name** (27/30)

> Unravel Korea: Trip Planner

**Short description** (80/80)

> Plan your Korea trip day by day, carry it offline, and read local travel guides.

**Full description** (≤ 4000)

> Planning your first trip to Korea? Unravel Korea turns a pile of tabs into one simple plan you can carry in your pocket — even without signal on the subway.
>
> YOUR WHOLE TRIP IN ONE TAP
> • Tell us how long you're staying — 3, 5 or 7 days — and get a complete day-by-day Seoul plan from our most-read guide: palaces, markets, the Han River, Suwon, the DMZ and Nami Island.
> • Every day is grouped by neighbourhood, so you spend your time exploring, not on the subway.
> • Change anything: add from 32 hand-picked places we've actually visited, move or remove stops.
> • Add your dates and we'll warn you when a palace or market is usually closed on the day you planned it.
> • Share your day-by-day plan with friends in any chat app.
>
> GET AROUND ON THE DAY
> • "Today" shows what's next, how to get there by subway, and opening hours.
> • One tap opens each place in Naver Map, Korea's local map app, ready for directions.
> • Show-the-driver taxi card with the destination in big Korean letters.
> • Tick off stops as you go. Your trip is saved on your phone and works offline.
>
> SPEAK A LITTLE KOREAN
> • The 12 phrases you'll actually use, read aloud by your phone's Korean voice, with a full-screen "show staff" mode.
> • Emergency numbers and the three things to know before you land.
>
> READ LIKE A LOCAL
> • Travel guides from unravelkorea.com: Seoul itineraries, Busan, Korean food, day trips and more.
> • Seoul Sip, our free weekly newsletter — what's happening in Korea in 5 minutes.
>
> Opening hours, closed days and prices are approximate and change without notice — always check before you go.

## Categorization

- **Category:** Travel & Local
- **Tags:** up to 5 of the suggested Travel & Local tags for travel guides, trip planning and itineraries. Skip
  map/navigation tags: the app opens Naver Map, it doesn't show maps itself.
- **Contact email (required):** an inbox you check, e.g. info@unravelkorea.com once that mailbox exists. Use the
  same address in the privacy policy.
- **Website:** https://unravelkorea.com
- **Privacy policy:** https://unravelkorea.com/privacy-policy/

## Graphics

| Asset             | File                                         | Play requirement      |
| ----------------- | -------------------------------------------- | --------------------- |
| App icon          | `icon-512.png`                               | 512×512 PNG           |
| Feature graphic   | `feature-graphic-1024x500.png`               | 1024×500 PNG/JPG      |
| Phone screenshots | `screenshots/01-welcome.png` … `07-read.png` | 2–8 images, 1080×1920 |

The screenshots were rendered from the app's web build at Android phone size (360×640 dp at 3×)
with a demo trip loaded. Before the public launch, consider retaking them on a real Android device so
the system status bar shows.

## App content (policy forms)

Verified against the production build (versionCode 4: targetSdk 36, minSdk 24; permissions INTERNET,
ACCESS_NETWORK_STATE and VIBRATE only; no AD_ID, no analytics, crash-reporting or ad SDKs).

**Privacy policy:** https://unravelkorea.com/privacy-policy/ — publish the app section from
[`privacy-policy-app-section.md`](privacy-policy-app-section.md) first. Google checks it during review.

**App access:** All functionality is available without any special access (no login).

**Ads:** No. The app has no ad SDKs or ad units; the "Before you fly" tiles are plain partner links.

**Advertising ID:** No, the app does not use the advertising ID.

**Data safety**

| Question                                                | Answer                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Does the app collect or share required user data types? | Yes                                                                      |
| Is all collected data encrypted in transit?             | Yes (HTTPS only)                                                         |
| Account creation                                        | The app doesn't allow users to create an account                         |
| Can users request that their data is deleted?           | Yes: https://unravelkorea.com/contact/ (once the contact email is fixed) |
| Data type                                               | Personal info → **Email address** (nothing else)                         |
| Collected / shared                                      | **Collected: Yes. Shared: No** (Vercel and beehiiv process it for us)    |
| Processed ephemerally?                                  | No                                                                       |
| Required or optional                                    | **Optional**: only if the user subscribes to Seoul Sip                   |
| Purpose                                                 | **Developer communications**                                             |

"Shared: No" holds only while Seoul Sip is not in the beehiiv Ad Network, Enhanced Data, Boosts or
Recommendations. If it joins one, declare Email address as Shared (Advertising or marketing).

**Content rating questionnaire:** category **"All Other App Types"**. Answer No to violence, sexual content,
profanity, drugs, gambling and user-generated content; users can't interact with each other or share their
location; no digital purchases. Expected rating **Everyone / PEGI 3**.

**Target audience:** 18 and over (the app isn't designed for children). Appeals to children: No.

**News app:** No. The guides are travel content from the developer's own blog, not news.

**Government app / financial features / health:** No.
