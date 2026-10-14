import * as Linking from 'expo-linking';

import { getSpot } from '@/data/spots';
import { formatDate } from '@/lib/dates';
import { dayDate, sanitizeTrip, stopCount, type Trip } from '@/state/trip-ops';

/**
 * Trips are shared as a compact, human-readable link — no server needed:
 *   unravelkorea://import?n=Seoul%20trip&s=2026-11-02&d=gyeongbokgung.bukchon~myeongdong&t=Royal%20Seoul~
 * Days are separated by `~`, spots within a day by `.` (spot ids are url-safe slugs). `t` holds the
 * optional day themes, also separated by `~`.
 */
export function tripShareUrl(trip: Trip): string {
  const queryParams: Record<string, string> = {
    n: trip.name,
    d: trip.days.map((d) => d.join('.')).join('~'),
  };
  if (trip.startDate) queryParams.s = trip.startDate;
  if (trip.dayTitles.some(Boolean)) queryParams.t = trip.dayTitles.map((t) => t.replace(/~/g, '-')).join('~');
  return Linking.createURL('/import', { queryParams });
}

export function decodeSharedTrip(params: { n?: string; s?: string; d?: string; t?: string }): Trip | null {
  if (typeof params.d !== 'string') return null;
  const trip = sanitizeTrip({
    name: params.n || 'Shared trip',
    startDate: params.s ?? null,
    days: params.d.split('~').map((day) => day.split('.')),
    dayTitles: typeof params.t === 'string' ? params.t.split('~') : [],
    done: [],
  });
  return stopCount(trip) ? trip : null;
}

/** Plain-text version for people who don't have the app (WhatsApp, KakaoTalk, notes...). */
export function tripToText(trip: Trip): string {
  const lines = [`🇰🇷 ${trip.name}`, ''];
  trip.days.forEach((ids, i) => {
    const date = dayDate(trip, i);
    const title = trip.dayTitles[i];
    lines.push(`Day ${i + 1}${date ? ` — ${formatDate(date)}` : ''}${title ? ` · ${title}` : ''}`);
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
