import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export type MapApp = 'naver' | 'kakao';

/**
 * Opens the Korean map app if it is installed, otherwise its website.
 * Search queries in Korean give much better matches than English names.
 */
export async function openInMap(app: MapApp, query: string) {
  const q = encodeURIComponent(query);
  const native =
    app === 'naver'
      ? `nmap://search?query=${q}&appname=com.unravelkorea.app`
      : `kakaomap://search?q=${q}`;
  const web =
    app === 'naver' ? `https://map.naver.com/p/search/${q}` : `https://map.kakao.com/?q=${q}`;

  if (Platform.OS !== 'web') {
    try {
      await Linking.openURL(native);
      return;
    } catch {
      // App not installed — fall through to the website.
    }
  }
  await Linking.openURL(web);
}
