import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/ui';
import { MaxWidth, Radius, Space, useColors } from '@/theme';

/** Bottom sheet used for every quick choice in the app: tap outside or swipe back to close. */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + Space.lg }]}>
        <View style={[styles.handle, { backgroundColor: c.border }]} />
        {title ? <T variant="title">{title}</T> : null}
        {subtitle ? (
          <T tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
        <View style={{ marginTop: title ? Space.md : 0 }}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14,21,32,0.5)' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.lg,
    width: '100%',
    maxWidth: MaxWidth,
    alignSelf: 'center',
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: Space.md },
});
