import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, Share } from 'react-native';

/** Cross-platform yes/no prompt (react-native-web has no Alert buttons). */
export function confirm(title: string, message: string, confirmLabel = 'OK'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Native share sheet; falls back to copying when sharing isn't available (desktop web). */
export async function shareText(message: string, title?: string) {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) throw new Error('no share');
    await Share.share({ message, title });
  } catch {
    await Clipboard.setStringAsync(message);
    notify('Copied to clipboard', 'Paste it into any chat or note.');
  }
}
