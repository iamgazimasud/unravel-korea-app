import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type RefreshControlProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BrandLogo } from '@/components/brand-logo';
import {
  Brand,
  CardShadow,
  Fonts,
  HeaderGradient,
  MaxWidth,
  Radius,
  ScreenPadding,
  Space,
  useColors,
  type Colors,
} from '@/theme';

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

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'eyebrow' | 'korean';
type Tone = 'default' | 'muted' | 'primary' | 'accent' | 'warning' | 'success' | 'onPrimary' | 'inverse';

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
    case 'inverse':
      return '#FFFFFF';
    default:
      return c.text;
  }
}

const textStyles = StyleSheet.create<Record<TextVariant, TextStyle>>({
  display: { fontFamily: Fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: Fonts.extrabold, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  heading: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 1.6 },
  korean: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
});

// ---------- Layout ----------

/**
 * Screen shell: a full-bleed header (usually <BrandHeader/>) that scrolls with the content, a
 * centered max-width column, and a navy backdrop behind the status bar so the light status-bar
 * icons stay readable once the header has scrolled away.
 */
export function Screen({
  header,
  children,
  refreshControl,
  contentStyle,
  statusBackdrop = true,
}: {
  header?: ReactNode;
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Set false for edge-to-edge photo heroes that handle status-bar contrast themselves. */
  statusBackdrop?: boolean;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Space.xxl * 2 }}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled">
        {header}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </ScrollView>
      {statusBackdrop ? <View pointerEvents="none" style={[styles.statusBackdrop, { height: insets.top }]} /> : null}
    </View>
  );
}

/** The brand wave from the logo, used as the bottom edge of every header. */
export function Wave({ color, height = 34 }: { color: string; height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 400 34" preserveAspectRatio="none" style={styles.wave}>
      <Path
        d="M0 10 C 90 34, 170 -6, 270 8 C 330 16, 372 22, 400 9"
        stroke={Brand.waveBlue}
        strokeWidth={3}
        strokeOpacity={0.9}
        fill="none"
      />
      <Path d="M0 16 C 90 40, 170 2, 270 15 C 330 22, 372 27, 400 16 L400 34 L0 34 Z" fill={color} />
    </Svg>
  );
}

/** Navy → blue gradient header with the logo wave. Children render under the title (search, CTA...). */
export function BrandHeader({
  eyebrow,
  title,
  subtitle,
  logo,
  back,
  right,
  children,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Show the Unravel Korea wordmark in the top bar. */
  logo?: boolean;
  /** Show a back button (or pass a handler, e.g. to close a modal). */
  back?: boolean | (() => void);
  right?: ReactNode;
  children?: ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const hasTopBar = logo || back || right;
  return (
    <LinearGradient
      colors={HeaderGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Space.md }]}>
      <View style={styles.headerInner}>
        {hasTopBar ? (
          <View style={styles.topBar}>
            {back ? (
              <HeaderButton
                icon="chevron-back"
                label="Back"
                onPress={typeof back === 'function' ? back : () => router.back()}
              />
            ) : null}
            {logo ? <BrandLogo variant="wordmark" tone="onDark" height={30} /> : null}
            <View style={{ flex: 1 }} />
            {right}
          </View>
        ) : null}
        {eyebrow ? (
          <T variant="eyebrow" tone="inverse" style={{ opacity: 0.8, marginTop: Space.sm }}>
            {eyebrow}
          </T>
        ) : null}
        {title ? (
          <T variant="display" tone="inverse" style={{ marginTop: eyebrow ? 4 : Space.sm }}>
            {title}
          </T>
        ) : null}
        {subtitle ? (
          <T tone="inverse" style={{ opacity: 0.88, marginTop: 4 }}>
            {subtitle}
          </T>
        ) : null}
        {children ? <View style={{ marginTop: Space.lg }}>{children}</View> : null}
      </View>
      <Wave color={c.background} />
    </LinearGradient>
  );
}

/** Round, translucent white button for use on the blue header or over photos. */
export function HeaderButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} size={20} color="#FFFFFF" />
    </Pressable>
  );
}

/** White pill call-to-action for use on the blue header. */
export function HeaderPill({ label, icon, onPress }: { label: string; icon?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.headerPill, pressed && { opacity: 0.85 }]}>
      {icon ? <Icon name={icon} size={17} color={Brand.navy} /> : null}
      <Text style={styles.headerPillLabel}>{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone = 'surface',
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: 'surface' | 'primary' | 'accent' | 'navy' | 'warning';
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const dark = useColorScheme() === 'dark';
  const bg = {
    surface: c.surface,
    primary: c.primary,
    accent: c.primarySoft,
    navy: dark ? c.surfaceAlt : Brand.navy,
    warning: c.warningSoft,
  }[tone];
  const base = [
    styles.card,
    { backgroundColor: bg },
    tone === 'surface' && (dark ? { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border } : CardShadow),
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}>
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
  const dark = useColorScheme() === 'dark';
  const bg = {
    primary: c.primary,
    accent: dark ? c.accent : Brand.navy,
    secondary: c.primarySoft,
    ghost: 'transparent',
  }[variant];
  const fg = {
    primary: c.onPrimary,
    accent: dark ? c.background : '#FFFFFF',
    secondary: c.primary,
    ghost: c.primary,
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
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
  tone = 'soft',
}: {
  icon: string;
  onPress: () => void;
  label: string;
  color?: string;
  disabled?: boolean;
  tone?: 'soft' | 'solid';
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
        {
          backgroundColor: tone === 'solid' ? c.primary : c.primarySoft,
          opacity: disabled ? 0.3 : pressed ? 0.7 : 1,
        },
      ]}>
      <Icon name={icon} size={18} color={color ?? (tone === 'solid' ? c.onPrimary : c.primary)} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  onDark,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  /** Translucent style for use on the blue header. */
  onDark?: boolean;
}) {
  const c = useColors();
  const colors = onDark
    ? selected
      ? { bg: '#FFFFFF', border: '#FFFFFF', fg: Brand.navy }
      : { bg: 'rgba(255,255,255,0.14)', border: 'rgba(255,255,255,0.28)', fg: '#FFFFFF' }
    : selected
      ? { bg: c.primary, border: c.primary, fg: c.onPrimary }
      : { bg: c.surface, border: c.border, fg: c.text };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.bg, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}>
      {icon ? <Icon name={icon} size={14} color={colors.fg} /> : null}
      <Text style={[styles.chipLabel, { color: colors.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'muted',
  icon,
}: {
  label: string;
  tone?: 'muted' | 'warning' | 'success' | 'accent' | 'primary' | 'onPhoto';
  icon?: string;
}) {
  const c = useColors();
  const map = {
    muted: [c.surfaceAlt, c.textMuted],
    warning: [c.warningSoft, c.warning],
    success: [c.successSoft, c.success],
    accent: [c.accentSoft, c.accent],
    primary: [c.primarySoft, c.primary],
    onPhoto: ['rgba(255,255,255,0.92)', Brand.navy],
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
    <View style={[styles.empty, { borderColor: c.border, backgroundColor: c.surface }]}>
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

/** Round tinted icon, e.g. in list rows. */
export function IconCircle({
  name,
  size = 40,
  tone = 'primary',
}: {
  name: string;
  size?: number;
  tone?: 'primary' | 'navy';
}) {
  const c = useColors();
  const bg = tone === 'navy' ? c.accentSoft : c.primarySoft;
  const fg = tone === 'navy' ? c.accent : c.primary;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={name} size={size * 0.48} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ScreenPadding,
    width: '100%',
    maxWidth: MaxWidth,
    alignSelf: 'center',
  },
  statusBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: Brand.navy },
  header: { paddingBottom: 30 },
  headerInner: {
    paddingHorizontal: ScreenPadding,
    width: '100%',
    maxWidth: MaxWidth,
    alignSelf: 'center',
    paddingBottom: Space.md,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Space.md, minHeight: 40 },
  wave: { position: 'absolute', bottom: -1, left: 0, right: 0 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
  },
  headerPillLabel: { fontFamily: Fonts.bold, fontSize: 14.5, color: Brand.navy },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
  card: { borderRadius: Radius.lg, padding: Space.lg },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingVertical: 13,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.pill,
    minHeight: 48,
  },
  buttonSm: { paddingVertical: 8, paddingHorizontal: Space.md, minHeight: 38 },
  buttonLabel: { fontFamily: Fonts.bold, fontSize: 15 },
  iconButton: {
    width: 38,
    height: 38,
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
  chipLabel: { fontFamily: Fonts.semibold, fontSize: 14 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeLabel: { fontFamily: Fonts.semibold, fontSize: 12 },
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
