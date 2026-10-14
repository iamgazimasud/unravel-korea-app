import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
  type ScrollViewProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxWidth, Radius, Space, useColors, type Colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: string;
  size?: number;
  color?: ComponentProps<typeof Ionicons>['color'];
}) {
  const c = useColors();
  return <Ionicons name={name as IoniconName} size={size} color={color ?? c.text} />;
}

// ---------- Typography ----------

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'korean';
type Tone = 'default' | 'muted' | 'primary' | 'accent' | 'warning' | 'success' | 'onPrimary';

export function T({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps & { variant?: TextVariant; tone?: Tone }) {
  const c = useColors();
  return <Text style={[textStyles[variant], { color: toneColor(c, tone) }, style]} {...rest} />;
}

function toneColor(c: Colors, tone: Tone) {
  switch (tone) {
    case 'muted':
      return c.textMuted;
    case 'primary':
      return c.primary;
    case 'accent':
      return c.accent;
    case 'warning':
      return c.warning;
    case 'success':
      return c.success;
    case 'onPrimary':
      return c.onPrimary;
    default:
      return c.text;
  }
}

const textStyles = StyleSheet.create<Record<TextVariant, TextStyle>>({
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  korean: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
});

// ---------- Layout ----------

/** Tab screen shell: safe area, page title, centered max-width column. */
export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  refreshControl,
  contentStyle,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const header = title ? (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <T variant="display">{title}</T>
        {subtitle ? (
          <T tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled">
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, contentStyle]}>
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

/** Scroll container for stack (non-tab) screens that already have a native header. */
export function Page({ children, ...props }: ScrollViewProps & { children: ReactNode }) {
  const c = useColors();
  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      {...props}>
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone = 'surface',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: 'surface' | 'primary' | 'accent' | 'warning';
}) {
  const c = useColors();
  const bg =
    tone === 'primary' ? c.primary : tone === 'accent' ? c.accentSoft : tone === 'warning' ? c.warningSoft : c.surface;
  const base = [
    styles.card,
    { backgroundColor: bg, borderColor: tone === 'surface' ? c.border : 'transparent' },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [base, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

export function Section({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <View style={{ marginTop: Space.xl }}>
      <View style={styles.sectionHeader}>
        <T variant="title">{title}</T>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
            <T variant="label" tone="primary">
              {action}
            </T>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// ---------- Controls ----------

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg =
    variant === 'primary'
      ? c.primary
      : variant === 'accent'
        ? c.accent
        : variant === 'secondary'
          ? c.surfaceAlt
          : 'transparent';
  const fg = variant === 'primary' || variant === 'accent' ? c.onPrimary : variant === 'ghost' ? c.primary : c.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={fg} /> : null}
      <Text style={[styles.buttonLabel, size === 'sm' && { fontSize: 13 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color,
  disabled,
}: {
  icon: string;
  onPress: () => void;
  label: string;
  color?: string;
  disabled?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: c.surfaceAlt, opacity: disabled ? 0.3 : pressed ? 0.7 : 1 },
      ]}>
      <Icon name={icon} size={18} color={color ?? c.text} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.text : c.surface,
          borderColor: selected ? c.text : c.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {icon ? <Icon name={icon} size={14} color={selected ? c.background : c.text} /> : null}
      <Text style={[styles.chipLabel, { color: selected ? c.background : c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'muted',
  icon,
}: {
  label: string;
  tone?: 'muted' | 'warning' | 'success' | 'accent' | 'primary';
  icon?: string;
}) {
  const c = useColors();
  const map = {
    muted: [c.surfaceAlt, c.textMuted],
    warning: [c.warningSoft, c.warning],
    success: [c.successSoft, c.success],
    accent: [c.accentSoft, c.accent],
    primary: [c.primarySoft, c.primary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.badgeLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const c = useColors();
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}>
        <Icon name={icon} size={26} color={c.primary} />
      </View>
      <T variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {body ? (
        <T tone="muted" style={{ textAlign: 'center' }}>
          {body}
        </T>
      ) : null}
      {action}
    </View>
  );
}

export function Loading() {
  const c = useColors();
  return (
    <View style={{ padding: Space.xl, alignItems: 'center' }}>
      <ActivityIndicator color={c.primary} />
    </View>
  );
}

export function Divider() {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: Space.md }} />;
}

const styles = StyleSheet.create({
  content: {
    padding: Space.lg,
    paddingBottom: Space.xxl * 2,
    width: '100%',
    maxWidth: MaxWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    marginBottom: Space.lg,
    marginTop: Space.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Space.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingVertical: 13,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.md,
    minHeight: 46,
  },
  buttonSm: { paddingVertical: 8, paddingHorizontal: Space.md, minHeight: 36, borderRadius: Radius.sm },
  buttonLabel: { fontSize: 15, fontWeight: '700' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeLabel: { fontSize: 12, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    gap: Space.sm,
    padding: Space.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xs,
  },
});
