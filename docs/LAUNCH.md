# Launch: Vercel + Google Play

> **Status (Oct 17, 2026):** the app is in Google Play review on the **closed testing** track (build 1.0.0,
> versionCode 4). Store listing, all App content forms, content rating (Everyone / PEGI 3) and the privacy policy
> (unravelkorea.com/privacy-policy/ and unravel-korea-api.vercel.app/privacy) are done.
>
> What's left:
>
> 1. When Google approves the test, copy the opt-in link from Play Console → Test and release → Closed testing →
>    Testers, and send it to **at least 12 testers** (invite 15–20). They must stay opted in for 14 days in a row.
> 2. After 14 days: Dashboard → **Apply for production**, then create the production release with the same build.
> 3. In-app newsletter signup: beehiiv's Free plan only creates API keys after an identity check (beehiiv →
>    Settings → API → verify with Stripe). Then add the key as `BEEHIIV_API_KEY` in Vercel and redeploy `server/`.
>    Until then the app tells people to join at seoulsip.online/subscribe.

Everything in the app and the store listing is ready. What's left needs **your accounts** (payments, identity
checks and API keys can only come from you). Steps marked **You** take a few minutes each; Claude does the rest.

| Step                                                             | Who    | Time                          |
| ---------------------------------------------------------------- | ------ | ----------------------------- |
| 1. Create accounts and add 4 keys to the Claude environment      | You    | 15 min                        |
| 2. Deploy the newsletter API to Vercel, build the Play Store app | Claude | ~45 min                       |
| 3. Google Play developer account                                 | You    | 15 min + Google's ID check    |
| 4. Create the app in Play Console and upload the build           | You    | 30 min (all text is prepared) |
| 5. Closed test: 12 testers for 14 days                           | You    | 14 days                       |
| 6. Apply for production and publish                              | You    | 10 min + Google's review      |

## 1. Accounts and keys (You)

Create these free accounts, then add each key in **this Claude cloud environment's settings** (the
environment menu in the session's title bar → **Edit** → environment variables / network secrets). Never paste
keys into the chat.

| Variable name            | Where to get it                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`           | [vercel.com](https://vercel.com/signup) (sign up with GitHub) → Account Settings → Tokens → Create |
| `BEEHIIV_API_KEY`        | beehiiv → Settings → Integrations → API → Create new API key                                       |
| `BEEHIIV_PUBLICATION_ID` | Same beehiiv page — starts with `pub_`                                                             |
| `EXPO_TOKEN`             | [expo.dev](https://expo.dev/signup) → Account settings → Access tokens → Create token              |

Then start a **new** session in this environment and say: _"Continue the launch in docs/LAUNCH.md"_.

## 2. What Claude does with them

- Deploys `server/` to Vercel (with the beehiiv keys stored in Vercel, never in the app) and tests the signup.
- Points production builds at that signup address, so people can join Seoul Sip without leaving the app.
- Creates the Expo project and the app's **upload key** (kept safely by Expo), builds the Play Store bundle
  (`.aab`) and gives you its download link.

## 3. Google Play developer account (You)

[play.google.com/console/signup](https://play.google.com/console/signup) — one-time **$25**, then Google verifies
your identity (can take a few days).

- A **personal** account works, but Google requires step 5 before you can publish.
- An **organization** account skips step 5, but needs a D-U-N-S number for your business.

## 4. Create the app and upload the build (You)

In Play Console → **Create app**: name `Unravel Korea: Trip Planner`, App, Free. Then:

1. **App content** — answer every form from [`store/listing.md`](../store/listing.md): privacy policy,
   ads (**No**), app access (**all features work without an account**), content rating, target audience,
   data safety, and the government / financial / health / news declarations (all **No**).
2. **Privacy policy** — first add the app section from
   [`store/privacy-policy-app-section.md`](../store/privacy-policy-app-section.md) to your website's policy page.
3. **Main store listing** — copy the text and upload the icon, feature graphic and screenshots from `store/`.
4. **Testing → Closed testing → Create track** → upload the `.aab` from step 2 → add testers → **Send for review**.

Google requires this first upload to be done by hand. Later updates can be uploaded automatically.

## 5. Closed test — 12 testers for 14 days (You)

Personal accounts created after November 2023 must keep **at least 12 testers opted in for 14 days in a row**
before production is unlocked. If the count drops below 12, the 14 days start again, so invite 15–20 people.

Your Seoul Sip readers are the easiest testers. Paste into the next issue:

> **Help us test the Unravel Korea app (Android).** We built a free app that plans your Seoul trip in one
> tap — 3, 5 or 7-day itineraries that work offline, a taxi card for drivers, and Korean phrases. Reply with the Gmail address you use on
> Google Play and we'll send you an early-access link. Please keep it installed for two weeks. 감사합니다!

In Play Console add their emails to the closed-testing list, then share the **opt-in link** with them.

## 6. Go live (You)

Dashboard → **Apply for production** → answer the questions about your test → create a production release
with the same build → **Send for review**. Google's review usually takes a few days.

---

## For Claude / developers: step 2 in detail

```bash
# Vercel — newsletter signup API (from the repo root)
cd server
npx vercel link --yes --project unravel-korea-api --token "$VERCEL_TOKEN"
printf '%s' "$BEEHIIV_API_KEY"        | npx vercel env add BEEHIIV_API_KEY production --token "$VERCEL_TOKEN"
printf '%s' "$BEEHIIV_PUBLICATION_ID" | npx vercel env add BEEHIIV_PUBLICATION_ID production --token "$VERCEL_TOKEN"
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"
# Check: an invalid email must return 400 (and a real one 200 — use your own address).
curl -s -X POST https://<deployment>/api/subscribe -H 'Content-Type: application/json' -d '{"email":"x"}'

# App — point production builds at the API: add to eas.json → build.production:
#   "env": { "EXPO_PUBLIC_SUBSCRIBE_ENDPOINT": "https://<deployment>/api/subscribe" }

# Expo — link the project, then run the FIRST build interactively (a pseudo-terminal is enough) and answer
# "Yes" to "Generate a new Android Keystore?". Expo stores the key; later builds work non-interactively
# (Actions → Android build), and `eas credentials` can download a backup of the key.
npx eas-cli@latest init --non-interactive --force
npx eas-cli@latest build --platform android --profile production
```

For one-click builds from GitHub afterwards, add `EXPO_TOKEN` as a repository secret
(GitHub → Settings → Secrets and variables → Actions) and run **Actions → Android build**.
