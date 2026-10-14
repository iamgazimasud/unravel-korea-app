import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { openLink } from '@/components/article-row';
import { Button, Icon, T } from '@/components/ui';
import { Config } from '@/config';
import { isValidEmail, subscribeToNewsletter } from '@/lib/content';
import { useAppState } from '@/state/app-state';
import { Fonts, Radius, Space, useColors } from '@/theme';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string };

/**
 * Seoul Sip signup. With `Config.subscribeEndpoint` set it signs people up in-app via beehiiv;
 * otherwise it opens the beehiiv subscribe page.
 */
export function NewsletterSignup({ onDark }: { onDark?: boolean } = {}) {
  const c = useColors();
  const { prefs, setSubscribed } = useAppState();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  if (prefs.subscribed) {
    return (
      <View style={[styles.done, { backgroundColor: c.successSoft }]}>
        <Icon name="checkmark-circle" size={20} color={c.success} />
        <T variant="label" tone="success" style={{ flex: 1 }}>
          You&apos;re on the Seoul Sip list — check your inbox.
        </T>
      </View>
    );
  }

  if (!Config.subscribeEndpoint) {
    return (
      <Button
        label="Subscribe free"
        icon="mail"
        variant={onDark ? 'secondary' : 'accent'}
        onPress={() => openLink(Config.newsletterSubscribeUrl)}
      />
    );
  }

  const submit = async () => {
    if (!isValidEmail(email)) {
      setStatus({ kind: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      await subscribeToNewsletter(email.trim());
      setSubscribed();
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' });
    }
  };

  return (
    <View style={{ gap: Space.sm }}>
      <View style={styles.row}>
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (status.kind === 'error') setStatus({ kind: 'idle' });
          }}
          placeholder="you@email.com"
          placeholderTextColor={c.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={submit}
          style={[
            styles.input,
            { color: c.text, backgroundColor: c.surface, borderColor: onDark ? 'transparent' : c.border },
          ]}
          accessibilityLabel="Email address"
        />
        <Button
          label={status.kind === 'sending' ? 'Joining…' : 'Subscribe'}
          icon="mail"
          variant={onDark ? 'primary' : 'accent'}
          disabled={status.kind === 'sending'}
          onPress={submit}
        />
      </View>
      {status.kind === 'error' ? (
        <T variant="caption" tone="warning" style={onDark && { color: '#FCD34D' }}>
          {status.message}
        </T>
      ) : (
        <T variant="caption" tone={onDark ? 'inverse' : 'muted'} style={onDark && { opacity: 0.75 }}>
          Free, weekly, unsubscribe anytime.
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Space.sm },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  done: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, padding: Space.md, borderRadius: Radius.md },
});
