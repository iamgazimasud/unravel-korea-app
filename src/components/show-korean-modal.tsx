import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, T } from '@/components/ui';
import { Space, useColors } from '@/theme';

/** Full-screen, high-contrast Korean text to hold up to a taxi driver or shop staff. */
export function ShowKoreanModal({
  visible,
  onClose,
  korean,
  caption,
  lead = '',
}: {
  visible: boolean;
  onClose: () => void;
  korean: string;
  caption?: string;
  lead?: string;
}) {
  const c = useColors();
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <Pressable style={[styles.root, { backgroundColor: c.surface }]} onPress={onClose} accessibilityLabel="Close">
        <View style={styles.center}>
          {lead ? (
            <T variant="title" tone="muted" style={styles.text}>
              {lead}
            </T>
          ) : null}
          <T style={[styles.korean, { color: c.text }]} adjustsFontSizeToFit numberOfLines={4}>
            {korean}
          </T>
          {caption ? (
            <T tone="muted" style={styles.text}>
              {caption}
            </T>
          ) : null}
        </View>
        <Button label="Done" variant="secondary" onPress={onClose} style={{ alignSelf: 'center', minWidth: 160 }} />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Space.xl, paddingVertical: Space.xxl * 2, justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', gap: Space.lg },
  korean: { fontSize: 56, lineHeight: 68, fontWeight: '800', textAlign: 'center' },
  text: { textAlign: 'center' },
});
