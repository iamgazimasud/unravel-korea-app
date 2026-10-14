# Unravel Korea API (Vercel)

One function: `POST /api/subscribe` adds an email to the **Seoul Sip** beehiiv newsletter, so the app
can sign people up without shipping your beehiiv API key inside the APK.

## Deploy (5 minutes)

1. In beehiiv: **Settings → Integrations → API** → create an API key and copy your publication id (`pub_…`).
2. In Vercel: **Add New → Project** → import the `unravel-korea-app` repo → set **Root Directory** to `server`.
3. Add environment variables `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID`, then deploy.
4. Paste `https://<your-project>.vercel.app/api/subscribe` into `subscribeEndpoint` in `src/config.ts`.

Test it:

```bash
curl -X POST https://<your-project>.vercel.app/api/subscribe \
  -H 'Content-Type: application/json' -d '{"email":"you@example.com"}'
```

New subscribers are tagged `utm_source=unravel-korea-app` so you can see app signups in beehiiv.
Keep **double opt-in** enabled in beehiiv to block fake signups.
