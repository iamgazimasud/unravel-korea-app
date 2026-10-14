import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, T } from '@/components/ui';
import type { Article } from '@/lib/content';
import { Palette, Radius, Space, useColors } from '@/theme';

export function openLink(url: string) {
  // Android: Chrome Custom Tab in brand blue. iOS: in-app Safari sheet.
  return WebBrowser.openBrowserAsync(url, {
    toolbarColor: Palette.light.primary,
    controlsColor: Palette.light.onPrimary,
    enableBarCollapsing: true,
    showTitle: true,
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}

export function formatArticleDate(date: string | null) {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ArticleRow({ article }: { article: Article }) {
  const c = useColors();
  const isNewsletter = article.source === 'newsletter';
  return (
    <Card onPress={() => openLink(article.url)} style={styles.card}>
      {article.image ? (
        <Image source={article.image} style={styles.image} contentFit="cover" transition={150} />
      ) : (
        <View
          style={[styles.image, styles.placeholder, { backgroundColor: isNewsletter ? c.accentSoft : c.primarySoft }]}>
          <Icon name={isNewsletter ? 'cafe' : 'book'} size={24} color={isNewsletter ? c.accent : c.primary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <T variant="heading" numberOfLines={3}>
          {article.title}
        </T>
        {article.excerpt ? (
          <T variant="caption" tone="muted" numberOfLines={2}>
            {article.excerpt}
          </T>
        ) : null}
        <T variant="caption" tone={isNewsletter ? 'accent' : 'primary'}>
          {isNewsletter ? 'Seoul Sip' : 'Unravel Korea'}
          {article.date ? ` · ${formatArticleDate(article.date)}` : ''}
        </T>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Space.md, padding: Space.md, alignItems: 'center' },
  image: { width: 84, height: 84, borderRadius: Radius.md },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
