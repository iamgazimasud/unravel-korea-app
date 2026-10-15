# Privacy policy — section to add for the app

Google Play requires the privacy policy linked from the store listing to name the app and to cover what it
collects, how data is kept safe, and how long it is kept. Paste this section into
https://unravelkorea.com/privacy-policy/ (WordPress → Pages → Privacy Policy → Edit), above "Contact Us". Also:

- change the policy's opening scope line to "…when you visit our website or use the Unravel Korea: Trip Planner
  app";
- replace the "Last updated" widget (it shows the current time, not the edit date) with a fixed date;
- fix the contact address on this page and on /contact/: `info@unravelkoea.com` is missing the "r" and that domain
  does not exist, so mail to it bounces. Use `info@unravelkorea.com`.

Before publishing, check in beehiiv that Seoul Sip is **not** enrolled in the beehiiv Ad Network, Enhanced Data,
Boosts or Recommendations. If it is, beehiiv becomes an independent controller of subscriber data: the "only on our
behalf" sentence below and the Data safety answer "Shared: No" (store/listing.md) must change.

---

## The Unravel Korea app (Android)

This section covers **Unravel Korea: Trip Planner** (package `com.unravelkorea.app`), the Android app published on
Google Play by Gazi Masud, who runs Unravel Korea. Privacy contact: info@unravelkorea.com or
https://unravelkorea.com/contact/.

**Your trip stays on your phone.** Your trip plan (days, places, dates and what you have ticked off) is stored on
your device and we never receive it. If Android backup is turned on, it may be included in your own Google account
backup and restored when you reinstall the app; otherwise it is deleted when you uninstall. If you share a trip, the
app writes a message and an `unravelkorea://` link containing the trip's name, start date, day names and places. You
choose where to send it, and it never passes through our servers.

**Newsletter (optional).** If you subscribe to Seoul Sip in the app, the email address you type is sent over HTTPS
to our signup service (hosted by Vercel), which passes it to our newsletter provider, beehiiv, with a note that you
signed up from the app. Both process it only on our behalf, and we use it only to send you Seoul Sip, which includes
news about Unravel Korea. The app does not store your email address on your phone.

**Content we load.** To show guides and newsletter issues, the app requests public pages from unravelkorea.com and
seoulsip.online. Like any website, these servers and our signup service receive your IP address and basic device
information and may keep them briefly in server logs for security and troubleshooting. We do not use them to
identify, locate or profile you. Links you open (for example maps, bookings or articles) open in your browser or in
that service's app, under that service's own privacy policy. Some booking links are affiliate links.

**What we do not collect.** The app has no account or login, no ads, and no analytics or tracking SDKs, and it does
not use the advertising ID. It does not access your location, contacts, photos, camera or microphone.

**How long we keep your email, and deleting it.** We keep your email address while you are subscribed. Every email
has an unsubscribe link; after you unsubscribe, beehiiv keeps a record of the address so you are not emailed again.
To have your address deleted completely, write to info@unravelkorea.com or use https://unravelkorea.com/contact/,
and we will delete it from beehiiv within 30 days. Our hosting providers delete server logs automatically after a
short period.

**How we protect it.** All connections use HTTPS. The newsletter API key is kept on our server, never in the app,
and only we can access the subscriber list.

**Children.** The app is not directed at children under 13.
