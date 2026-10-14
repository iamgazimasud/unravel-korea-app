# Releasing (Android)

## One-time setup

1. `npx eas-cli@latest login` and `npx eas-cli@latest init` (adds the EAS project id to `app.json`).
2. Google Play Console: create the app **Unravel Korea**, package `com.unravelkorea.app`.
   Fill in the listing and policy forms from [`store/listing.md`](../store/listing.md).
3. Optional in-app newsletter signup: deploy `server/` ([guide](../server/README.md)) and run
   `npx eas-cli@latest env:create --name EXPO_PUBLIC_SUBSCRIBE_ENDPOINT --value <url> --environment preview --environment production --visibility plaintext`.
4. Optional CI builds: add an `EXPO_TOKEN` repository secret (expo.dev → Access tokens) to use
   **Actions → Android build**.

## Every release

1. Make sure `main` is green in CI (`npm run check` runs the same checks locally).
2. Bump `version` in `app.json` (semver, user-visible, e.g. `1.1.0`) and add an entry to `CHANGELOG.md`.
   The Android `versionCode` is incremented automatically by EAS (`appVersionSource: remote`).
3. **Tester build:** `npm run build:apk` → install the APK on a real phone and run the smoke test below.
4. **Store build:** `npm run build:android` (signed `.aab`).
5. **Upload:** the very first release must be uploaded by hand in Play Console → Testing → Internal
   testing. After that: `npm run submit:android` (needs a Play service-account key; EAS walks you through it).
6. Promote internal → closed/open testing → production in Play Console. Use a staged rollout (e.g. 20%)
   for production.
7. Tag the commit: `git tag v1.1.0 && git push --tags`.

## Smoke test (5 minutes, real Android phone)

- [ ] Fresh install → onboarding → Home shows the countdown card.
- [ ] Explore → add 3 spots to different days → My Trip shows them; a closed-day warning appears when expected.
- [ ] Reorder, move to another day, remove a stop.
- [ ] Today mode → **Naver Map** opens the app (or the website if not installed); **Taxi** card shows Korean.
- [ ] Toolkit → play a phrase (Korean voice prompt appears if the voice isn't installed).
- [ ] Read → guides load with images; category chips, search and Load more work; links open in a red Custom Tab.
- [ ] Seoul Sip → subscribe (or the beehiiv page opens if no endpoint is configured).
- [ ] Share trip → open the link on a second phone → Use this trip.
- [ ] Airplane mode → relaunch → trip, Today mode and cached articles still work.
- [ ] Kill the app while in Today mode → relaunch → it reopens on today's day.

## Hotfixes

Store builds take a day or two to review. For JavaScript-only fixes, consider adding EAS Update
(`npx expo install expo-updates && npx eas-cli@latest update:configure`) so fixes can ship
over the air; native changes always need a new store build.

## Rollback

Play Console → Production → **Halt rollout**, then promote the previous release (or ship a new
build with a higher versionCode built from the previous tag).
