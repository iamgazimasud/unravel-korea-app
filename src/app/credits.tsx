import { StyleSheet, View } from 'react-native';

import { openLink } from '@/components/article-row';
import { SpotPhoto } from '@/components/spot-card';
import { BrandHeader, Card, Icon, Screen, T } from '@/components/ui';
import { PhotoCredits } from '@/data/spot-photos';
import { Spots } from '@/data/spots';
import { Radius, Space } from '@/theme';

/** Attribution for every destination photo (required by their CC BY / CC BY-SA / KOGL licences). */
export default function CreditsScreen() {
  return (
    <Screen
      header={
        <BrandHeader
          back
          title="Photo credits"
          subtitle="Every destination photo is used under a free licence. Tap one to see the original."
        />
      }>
      <View style={{ gap: Space.sm, marginTop: Space.sm }}>
        {Spots.map((spot) => {
          const credit = PhotoCredits[spot.id];
          if (!credit) return null;
          return (
            <Card
              key={spot.id}
              style={styles.row}
              onPress={() => credit.url && openLink(credit.url)}
              accessibilityLabel={`${spot.name} photo by ${credit.author}, ${credit.license}`}>
              <SpotPhoto spot={spot} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <T variant="label" numberOfLines={1}>
                  {spot.name}
                </T>
                <T variant="caption" tone="muted" numberOfLines={1}>
                  {credit.author} · {credit.license}
                </T>
              </View>
              <Icon name="open-outline" size={16} />
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: 10 },
  thumb: { width: 52, height: 52, borderRadius: Radius.sm },
});
