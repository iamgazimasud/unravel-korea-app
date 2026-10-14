import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { notify } from '@/lib/platform';

let koreanVoiceChecked = false;

/**
 * Reads Korean text aloud. Many Android phones ship without a Korean text-to-speech voice, so the
 * first time we check and explain how to add one instead of failing silently.
 */
export async function speakKorean(text: string) {
  Speech.stop();
  if (Platform.OS === 'android' && !koreanVoiceChecked) {
    koreanVoiceChecked = true;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      // An empty list means the engine hasn't reported voices yet — just try to speak.
      if (voices.length && !voices.some((v) => v.language.toLowerCase().startsWith('ko'))) {
        notify(
          'Korean voice not installed',
          'Open Settings → Text-to-speech output → Speech Services by Google → Install voice data → Korean. Until then you can still show the phrase on screen.',
        );
        return;
      }
    } catch {
      // Fall through and attempt to speak.
    }
  }
  Speech.speak(text, { language: 'ko-KR', rate: 0.85 });
}
