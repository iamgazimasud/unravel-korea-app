/**
 * Ready-made trips, adapted from the Unravel Korea guide
 * "Day-by-Day Seoul Itineraries: The Perfect 3, 5, and 7-Day Plans"
 * (https://unravelkorea.com/day-by-day-travel-itineraries-seoul/). Each day is grouped by
 * neighbourhood so travellers spend their time exploring, not on the subway.
 */

export type PlanDay = { title: string; spots: string[] };
export type Plan = {
  id: PlanId;
  days: number;
  name: string;
  tagline: string;
  /** Three spot photos that show what makes this plan different. */
  cover: [string, string, string];
  plan: PlanDay[];
};
export type PlanId = '3' | '5' | '7';

const ROYAL: PlanDay = { title: 'Royal Seoul', spots: ['gyeongbokgung', 'bukchon', 'insadong', 'gwangjang'] };
const MODERN: PlanDay = { title: 'Modern Seoul', spots: ['hongdae', 'mangwon', 'nseoultower', 'myeongdong'] };
const GANGNAM: PlanDay = { title: 'Gangnam & the Han River', spots: ['coex', 'hangang-banpo'] };
const SUWON: PlanDay = { title: 'Day trip: Suwon fortress', spots: ['hwaseong', 'itaewon'] };
const DESIGN: PlanDay = { title: 'Design & hanok cafés', spots: ['ddp', 'ikseondong'] };
const DMZ: PlanDay = { title: 'Day trip: the DMZ', spots: ['dmz'] };
const NAMI: PlanDay = { title: 'Day trip: Nami Island', spots: ['nami', 'morning-calm'] };
const SLOW: PlanDay = { title: 'Slow Seoul', spots: ['changdeokgung', 'ikseondong', 'tea-house'] };

export const Plans: Plan[] = [
  {
    id: '3',
    days: 3,
    name: '3 days in Seoul',
    tagline: 'The highlights: palaces, markets and the Han River',
    cover: ['gyeongbokgung', 'myeongdong', 'hangang-banpo'],
    plan: [ROYAL, MODERN, GANGNAM],
  },
  {
    id: '5',
    days: 5,
    name: '5 days in Seoul',
    tagline: 'The sweet spot, with a day trip to Suwon',
    cover: ['bukchon', 'hwaseong', 'ddp'],
    plan: [ROYAL, MODERN, GANGNAM, SUWON, DESIGN],
  },
  {
    id: '7',
    days: 7,
    name: '7 days in Seoul',
    tagline: 'Everything, plus the DMZ and Nami Island',
    cover: ['changdeokgung', 'nami', 'dmz'],
    plan: [ROYAL, MODERN, GANGNAM, DMZ, SUWON, NAMI, SLOW],
  },
];

/** The plan we suggest when someone isn't sure (the guide calls 5 days "the sweet spot"). */
export const RECOMMENDED_PLAN: PlanId = '5';

export function getPlan(id: string): Plan | undefined {
  return Plans.find((p) => p.id === id);
}

export function planPlaceCount(plan: Plan): number {
  return new Set(plan.plan.flatMap((d) => d.spots)).size;
}
