import * as Linking from 'expo-linking';

import { getSpot } from '@/data/spots';
import { dayDate, type Trip } from '@/state/app-state';
import { formatDate, isValidISODate } from '@/lib/dates';

/**
 * Trips are shared as a compact, human-readable link — no server needed:
 *   unravelkorea://import?n=Seoul%20trip&s=2026-11-02&d=gyeongbokgung.bukchon~myeongdong
 * Days are separated by `~`, spots within a day by `.` (spot ids are url-safe slugs).
 */
export function tripShareUrl(trip: Trip): string {
  const queryParams: Record<string, string> = {
    n: trip.name,
    d: trip.days.map((d) => d.join('.')).join('~'),
  };
  if (trip.startDate) queryParams.s = trip.startDate;
  return Linking.createURL('/import', { queryParams });
}

export function decodeSharedTrip(params: { n?: string; s?: string; d?: string }): Trip | null {
  if (typeof params.d !== 'string') return null;
  const days = params.d
    .split('~')
    .slice(0, 21)
    .map((day) => day.split('.').filter((id) => id && getSpot(id)));
  if (!days.some((d) => d.length)) return null;
  return {
    name: (params.n ?? 'Shared trip').slice(0, 60),
    startDate: params.s && isValidISODate(params.s) ? params.s : null,
    days,
    done: [],
  };
}

/** Plain-text version for people who don't have the app (WhatsApp, KakaoTalk, notes...). */
export function tripToText(trip: Trip): string {
  const lines = [`🇰🇷 ${trip.name}`, ''];
  trip.days.forEach((ids, i) => {
    const date = dayDate(trip, i);
    lines.push(`Day ${i + 1}${date ? ` — ${formatDate(date)}` : ''}`);
    if (!ids.length) lines.push('  (free day)');
    ids.forEach((id, j) => {
      const s = getSpot(id);
      if (s) lines.push(`  ${j + 1}. ${s.name} (${s.nameKo})`);
    });
    lines.push('');
  });
  lines.push('Planned with the Unravel Korea app');
  return lines.join('\n');
}
