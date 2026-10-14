// Android 11+ hides other apps unless you declare which ones you talk to ("package visibility").
// Declaring the Naver Map / KakaoMap URL schemes lets the "Open in map" buttons reliably detect and
// launch those apps; without them we fall back to the map websites.
const { withAndroidManifest } = require('expo/config-plugins');

const SCHEMES = ['nmap', 'kakaomap'];

module.exports = function withAndroidMapQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const queries = (manifest.queries ??= [{}])[0];
    queries.intent ??= [];
    for (const scheme of SCHEMES) {
      const exists = queries.intent.some((i) => i.data?.some((d) => d.$?.['android:scheme'] === scheme));
      if (!exists) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    }
    return cfg;
  });
};
