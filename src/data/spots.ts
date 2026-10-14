/**
 * Curated catalog — the same places as the Unravel Korea web planner.
 * Opening hours, closed days and prices are approximate; the app says so wherever it shows them.
 */

export type Category = 'heritage' | 'neighborhood' | 'market' | 'shopping' | 'daytrip' | 'nature' | 'food' | 'beyond';

export type Spot = {
  id: string;
  name: string;
  nameKo: string;
  category: Category;
  area: string;
  blurb: string;
  /** What to search for in Naver Map / KakaoMap. Korean names give the most accurate results. */
  mapQuery: string;
  /** How to get there by public transport. */
  directions: string;
  hours?: string;
  /** Days of the week it is closed, 0 = Sunday ... 6 = Saturday. */
  closedDays?: number[];
  price?: string;
  /** Suggested time on site, in hours. */
  duration: number;
  tips?: string[];
};

export const CategoryLabels: Record<Category, string> = {
  heritage: 'Palaces & Heritage',
  neighborhood: 'Neighborhoods',
  market: 'Markets',
  shopping: 'Shopping',
  daytrip: 'Day Trips',
  nature: 'Nature',
  food: 'Food & Drink',
  beyond: 'Beyond Seoul',
};

export const CategoryIcons: Record<Category, string> = {
  heritage: 'business',
  neighborhood: 'walk',
  market: 'basket',
  shopping: 'bag-handle',
  daytrip: 'train',
  nature: 'leaf',
  food: 'restaurant',
  beyond: 'map',
};

/** The four filters on the Places tab — fewer, broader choices than the eight categories. */
export type PlaceFilter = 'sights' | 'food' | 'shopping' | 'daytrips';

export const PlaceFilters: { id: PlaceFilter; label: string; icon: string; categories: Category[] }[] = [
  { id: 'sights', label: 'Sights', icon: 'business', categories: ['heritage', 'neighborhood', 'nature'] },
  { id: 'food', label: 'Food & markets', icon: 'restaurant', categories: ['market', 'food'] },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', categories: ['shopping'] },
  { id: 'daytrips', label: 'Day trips', icon: 'train', categories: ['daytrip', 'beyond'] },
];

export const Spots: Spot[] = [
  // Palaces & Heritage
  {
    id: 'gyeongbokgung',
    name: 'Gyeongbokgung Palace',
    nameKo: '경복궁',
    category: 'heritage',
    area: 'Central Seoul',
    blurb: "Seoul's largest royal palace, home of the Royal Guard Changing Ceremony.",
    mapQuery: '경복궁',
    directions: 'Gyeongbokgung Stn (Line 3), Exit 5',
    hours: '09:00–18:00 (17:00 in winter), last entry 1h before',
    closedDays: [2],
    price: '₩3,000 — free if you wear hanbok',
    duration: 2.5,
    tips: [
      'Guard changing ceremony at 10:00 and 14:00 (not on Tuesdays).',
      'Rent a hanbok nearby for free entry and better photos.',
    ],
  },
  {
    id: 'changdeokgung',
    name: 'Changdeokgung Palace & Secret Garden',
    nameKo: '창덕궁',
    category: 'heritage',
    area: 'Central Seoul',
    blurb: 'UNESCO-listed palace with a reservation-only rear garden (Huwon).',
    mapQuery: '창덕궁',
    directions: 'Anguk Stn (Line 3), Exit 3',
    hours: '09:00–18:00 (17:30 in winter)',
    closedDays: [1],
    price: '₩3,000 + Secret Garden tour ₩5,000',
    duration: 2.5,
    tips: ['Secret Garden tickets sell out — book online or arrive at opening.'],
  },
  {
    id: 'jongmyo',
    name: 'Jongmyo Shrine',
    nameKo: '종묘',
    category: 'heritage',
    area: 'Central Seoul',
    blurb: 'UNESCO Confucian shrine for royal ancestral rites, set in quiet forested grounds.',
    mapQuery: '종묘',
    directions: 'Jongno 3-ga Stn (Lines 1/3/5), Exit 11',
    hours: '09:00–18:00 (17:30 in winter)',
    closedDays: [2],
    price: '₩1,000',
    duration: 1.5,
    tips: ['Most days entry is by guided tour only; Saturdays are free to roam.'],
  },
  {
    id: 'namsangol',
    name: 'Namsangol Hanok Village',
    nameKo: '남산골한옥마을',
    category: 'heritage',
    area: 'Central Seoul',
    blurb: 'Restored hanok village with a traditional garden, near Namsan Tower.',
    mapQuery: '남산골한옥마을',
    directions: 'Chungmuro Stn (Lines 3/4), Exit 3 or 4',
    hours: '09:00–21:00 (Apr–Oct), 09:00–20:00 (Nov–Mar)',
    closedDays: [1],
    price: 'Free',
    duration: 1,
  },

  // Neighborhoods & Culture
  {
    id: 'bukchon',
    name: 'Bukchon Hanok Village',
    nameKo: '북촌한옥마을',
    category: 'neighborhood',
    area: 'Central Seoul',
    blurb: 'Hillside hanok houses tucked between the two main palaces.',
    mapQuery: '북촌한옥마을',
    directions: 'Anguk Stn (Line 3), Exit 2',
    hours: 'Visitor hours 10:00–17:00 (people live here)',
    price: 'Free',
    duration: 1.5,
    tips: ['Keep your voice down — tourists are fined outside visitor hours in the core lanes.'],
  },
  {
    id: 'nseoultower',
    name: 'N Seoul Tower (Namsan)',
    nameKo: '남산서울타워',
    category: 'neighborhood',
    area: 'Central Seoul',
    blurb: 'Hilltop tower with panoramic city views and thousands of love locks.',
    mapQuery: '남산서울타워',
    directions: 'Myeongdong Stn (Line 4), Exit 3 → Namsan cable car, or Namsan bus 01A',
    hours: 'Observatory ~10:30–23:00',
    price: 'Observatory ticket extra; the grounds are free',
    duration: 2,
    tips: ['Go just before sunset to see the city in daylight and lit up.'],
  },
  {
    id: 'insadong',
    name: 'Insadong',
    nameKo: '인사동',
    category: 'neighborhood',
    area: 'Central Seoul',
    blurb: 'Traditional arts, tea houses, and souvenir alleys in one walkable district.',
    mapQuery: '인사동',
    directions: 'Anguk Stn (Line 3), Exit 6',
    duration: 1.5,
    price: 'Free to wander',
    tips: ['Ssamziegil is the spiral-ramp shopping courtyard — easy to miss from the street.'],
  },
  {
    id: 'hongdae',
    name: 'Hongdae',
    nameKo: '홍대',
    category: 'neighborhood',
    area: 'West Seoul',
    blurb: 'University district known for street performances, indie shops, and nightlife.',
    mapQuery: '홍대입구역',
    directions: 'Hongik Univ. Stn (Line 2 / Airport Railroad), Exit 9',
    duration: 3,
    price: 'Free to wander',
    tips: ['Busking peaks on weekend evenings along the main "walking street".'],
  },
  {
    id: 'ikseondong',
    name: 'Ikseon-dong Hanok Alley',
    nameKo: '익선동',
    category: 'neighborhood',
    area: 'Central Seoul',
    blurb: 'Trendy hanok cafes and boutiques packed into a tiny historic block.',
    mapQuery: '익선동 한옥거리',
    directions: 'Jongno 3-ga Stn (Lines 1/3/5), Exit 4 or 6',
    duration: 1.5,
    price: 'Free to wander',
  },
  {
    id: 'yeonnam',
    name: 'Yeonnam-dong',
    nameKo: '연남동',
    category: 'neighborhood',
    area: 'West Seoul',
    blurb: 'Laid-back cafe strip along a converted rail park, right next to Hongdae.',
    mapQuery: '경의선숲길 연남동',
    directions: 'Hongik Univ. Stn (Line 2), Exit 3',
    duration: 2,
    price: 'Free to wander',
  },
  {
    id: 'itaewon',
    name: 'Itaewon',
    nameKo: '이태원',
    category: 'neighborhood',
    area: 'Central Seoul',
    blurb: 'International food, nightlife, and boutique shopping district.',
    mapQuery: '이태원역',
    directions: 'Itaewon Stn (Line 6), Exit 1',
    duration: 2.5,
    price: 'Free to wander',
  },

  // Markets
  {
    id: 'gwangjang',
    name: 'Gwangjang Market',
    nameKo: '광장시장',
    category: 'market',
    area: 'Central Seoul',
    blurb: 'Century-old market famous for bindaetteok and mayak gimbap.',
    mapQuery: '광장시장',
    directions: 'Jongno 5-ga Stn (Line 1), Exit 8',
    hours: 'Food stalls ~09:00–23:00',
    price: 'Snacks ₩4,000–10,000',
    duration: 1.5,
    tips: ['Some fabric shops close on Sundays; the food alley stays open.'],
  },
  {
    id: 'mangwon',
    name: 'Mangwon Market',
    nameKo: '망원시장',
    category: 'market',
    area: 'West Seoul',
    blurb: 'Local neighborhood market with affordable street food, away from the crowds.',
    mapQuery: '망원시장',
    directions: 'Mangwon Stn (Line 6), Exit 2',
    hours: '~10:00–21:00',
    price: 'Snacks from ₩2,000',
    duration: 1,
    tips: ['Walk 10 minutes to Mangwon Hangang Park afterwards for a riverside picnic.'],
  },
  {
    id: 'namdaemun',
    name: 'Namdaemun Market',
    nameKo: '남대문시장',
    category: 'market',
    area: 'Central Seoul',
    blurb: "Korea's oldest and largest traditional market.",
    mapQuery: '남대문시장',
    directions: 'Hoehyeon Stn (Line 4), Exit 5',
    hours: '~07:00–20:00',
    closedDays: [0],
    price: 'Free entry',
    duration: 1.5,
    tips: ['Most shops close on Sundays.'],
  },
  {
    id: 'ddp',
    name: 'Dongdaemun Market & DDP',
    nameKo: '동대문디자인플라자',
    category: 'market',
    area: 'Central Seoul',
    blurb: '24-hour fashion wholesale market right beside the futuristic DDP building.',
    mapQuery: '동대문디자인플라자',
    directions: 'Dongdaemun History & Culture Park Stn (Lines 2/4/5), Exit 1',
    hours: 'DDP outdoor areas always open; malls until late',
    price: 'Free to wander',
    duration: 2,
    tips: ['The LED rose garden lights up after dark.'],
  },
  {
    id: 'noryangjin',
    name: 'Noryangjin Fisheries Market',
    nameKo: '노량진수산시장',
    category: 'market',
    area: 'West Seoul',
    blurb: 'Pick your own live seafood, then have it cooked upstairs.',
    mapQuery: '노량진수산시장',
    directions: 'Noryangjin Stn (Lines 1/9), Exit 1 → overpass',
    hours: 'Retail ~03:00–22:00',
    price: 'Seafood priced by weight; upstairs cooking fee per person',
    duration: 1.5,
  },

  // Shopping
  {
    id: 'myeongdong',
    name: 'Myeongdong',
    nameKo: '명동',
    category: 'shopping',
    area: 'Central Seoul',
    blurb: 'Flagship K-beauty and fashion shopping strip.',
    mapQuery: '명동',
    directions: 'Myeongdong Stn (Line 4), Exit 6',
    hours: 'Shops ~10:00–22:00; street food from ~16:00',
    price: 'Free to wander',
    duration: 2,
    tips: ['Bring your passport — instant tax refunds at most big beauty stores.'],
  },
  {
    id: 'hongdae-free-market',
    name: 'Hongdae Free Market',
    nameKo: '홍대 프리마켓',
    category: 'shopping',
    area: 'West Seoul',
    blurb: 'Weekend indie artist market with handmade goods and live busking.',
    mapQuery: '홍익어린이공원',
    directions: 'Hongik Univ. Stn (Line 2), Exit 9 → Hongik Children’s Park',
    hours: 'Saturdays ~13:00–18:00 (Mar–Nov)',
    closedDays: [0, 1, 2, 3, 4, 5],
    price: 'Free entry',
    duration: 1,
  },
  {
    id: 'coex',
    name: 'COEX Mall & Starfield Library',
    nameKo: '별마당도서관',
    category: 'shopping',
    area: 'Gangnam',
    blurb: "Underground megamall home to Korea's most photographed library.",
    mapQuery: '별마당도서관',
    directions: 'Bongeunsa Stn (Line 9), Exit 7 or Samseong Stn (Line 2), Exit 5',
    hours: '10:00–22:00',
    price: 'Free',
    duration: 2,
    tips: ['Bongeunsa Temple is directly across the road.'],
  },
  {
    id: 'ewha',
    name: 'Ewha Womans University Shopping Street',
    nameKo: '이화여대길',
    category: 'shopping',
    area: 'West Seoul',
    blurb: 'Youthful fashion alley next to a landmark university gate.',
    mapQuery: '이화여자대학교',
    directions: 'Ewha Womans Univ. Stn (Line 2), Exit 2',
    price: 'Free to wander',
    duration: 1.5,
  },

  // Day Trips
  {
    id: 'nami',
    name: 'Nami Island',
    nameKo: '남이섬',
    category: 'daytrip',
    area: 'Gyeonggi / Gangwon',
    blurb: 'Tree-lined island and famous K-drama filming location, reached by ferry.',
    mapQuery: '남이섬',
    directions: 'ITX-Cheongchun to Gapyeong Stn, then taxi/bus to Gapyeong Wharf',
    hours: '~08:00–21:00 (ferry times)',
    price: 'Entry incl. ferry ~₩16,000',
    duration: 6,
    tips: ['Pair with the Garden of Morning Calm — they are on the same rail line.'],
  },
  {
    id: 'dmz',
    name: 'DMZ Tour — Third Tunnel & Dora Observatory',
    nameKo: '도라전망대',
    category: 'daytrip',
    area: 'Gyeonggi (border)',
    blurb: 'Guided day trip to the border: the Third Infiltration Tunnel and the Dora Observatory.',
    mapQuery: '도라전망대',
    directions: 'Tour bus from Seoul only — bring your passport',
    closedDays: [1],
    price: 'Tours ~₩50,000–90,000',
    duration: 7,
    tips: ['Tours can be cancelled at short notice for military reasons.'],
  },
  {
    id: 'everland',
    name: 'Everland',
    nameKo: '에버랜드',
    category: 'daytrip',
    area: 'Yongin',
    blurb: "Korea's largest theme park: rides, a zoo, and seasonal flower festivals.",
    mapQuery: '에버랜드',
    directions: 'Shuttle bus from Seoul, or Everland Stn (Yongin EverLine)',
    hours: '~10:00–21:00 (varies by season)',
    price: 'Day pass ~₩60,000+ (cheaper online)',
    duration: 8,
  },
  {
    id: 'morning-calm',
    name: 'Garden of Morning Calm & Petite France',
    nameKo: '아침고요수목원',
    category: 'daytrip',
    area: 'Gapyeong',
    blurb: 'Lantern-lit botanical garden paired with a French-village film set.',
    mapQuery: '아침고요수목원',
    directions: 'Cheongpyeong Stn (Gyeongchun Line), then bus or shuttle',
    hours: '~08:30–19:00; lights festival until ~21:00 in winter',
    price: '~₩11,000',
    duration: 4,
  },
  {
    id: 'hwaseong',
    name: 'Suwon Hwaseong Fortress',
    nameKo: '수원화성',
    category: 'daytrip',
    area: 'Suwon',
    blurb: 'UNESCO fortress walls with a walkable rampart loop and market.',
    mapQuery: '수원화성',
    directions: 'Suwon Stn (Line 1), then bus to Paldalmun',
    hours: 'Walls open daytime; Haenggung Palace 09:00–18:00',
    price: '₩1,000',
    duration: 5,
    tips: ['Try Suwon galbi (marinated beef ribs) for dinner.'],
  },

  // Nature
  {
    id: 'hangang-banpo',
    name: 'Han River Park (Banpo)',
    nameKo: '반포한강공원',
    category: 'nature',
    area: 'Central Seoul',
    blurb: 'Biking, picnics, and the Banpo Bridge Moonlight Rainbow Fountain.',
    mapQuery: '반포한강공원',
    directions: 'Express Bus Terminal Stn (Lines 3/7/9), Exit 8-1',
    hours: 'Fountain shows ~Apr–Oct evenings',
    price: 'Free',
    duration: 2,
    tips: ['Order fried chicken to the park — delivery drivers know the meeting points.'],
  },
  {
    id: 'bukhansan',
    name: 'Bukhansan National Park',
    nameKo: '북한산국립공원',
    category: 'nature',
    area: 'North Seoul',
    blurb: 'Granite-peak hiking trails inside the city limits of Seoul.',
    mapQuery: '북한산국립공원',
    directions: 'Bukhansan Ui Stn (Ui LRT), Exit 2',
    price: 'Free',
    duration: 5,
    tips: ['Baegundae summit is about 3–4 hours return. Start early and bring water.'],
  },

  // Food & Drink
  {
    id: 'kbbq',
    name: 'Korean BBQ Dinner',
    nameKo: '삼겹살 구이',
    category: 'food',
    area: 'Anywhere',
    blurb: 'Sit-down grilled pork belly dinner with soju — a trip essential.',
    mapQuery: '삼겹살',
    directions: 'Open the map near where you are — Mapo and Hongdae are classic areas',
    price: '~₩16,000–20,000 per portion',
    duration: 1.5,
    tips: ['Most places need an order of at least 2 portions.'],
  },
  {
    id: 'tea-house',
    name: 'Traditional Tea House (Insadong)',
    nameKo: '인사동 전통찻집',
    category: 'food',
    area: 'Central Seoul',
    blurb: 'Quiet hanok tea house serving omija and citron teas.',
    mapQuery: '인사동 전통찻집',
    directions: 'Anguk Stn (Line 3), Exit 6',
    price: '~₩8,000–12,000 per tea',
    duration: 1,
  },

  // Beyond Seoul
  {
    id: 'busan',
    name: 'Busan — Haeundae & Gamcheon',
    nameKo: '감천문화마을',
    category: 'beyond',
    area: 'Busan',
    blurb: 'Coastal city with a famous beach and a colorful hillside art village.',
    mapQuery: '감천문화마을',
    directions: 'KTX Seoul → Busan (~2h30m)',
    price: 'Gamcheon is free',
    duration: 8,
    tips: ['Give Busan at least 2 days — see the Busan guide in the Read tab.'],
  },
  {
    id: 'jeju',
    name: 'Jeju Island',
    nameKo: '성산일출봉',
    category: 'beyond',
    area: 'Jeju',
    blurb: 'Hallasan volcano, beaches, and the Olle coastal trails.',
    mapQuery: '성산일출봉',
    directions: 'Fly Gimpo → Jeju (~1h10m), then rent a car',
    price: 'Seongsan Ilchulbong ~₩5,000',
    duration: 8,
  },
  {
    id: 'gyeongju',
    name: 'Gyeongju',
    nameKo: '불국사',
    category: 'beyond',
    area: 'Gyeongju',
    blurb: 'Silla-dynasty tombs, temples, and Bulguksa Temple.',
    mapQuery: '불국사',
    directions: 'KTX Seoul → Singyeongju (~2h), then bus',
    price: 'Bulguksa is free',
    duration: 8,
  },
];

const byId = new Map(Spots.map((s) => [s.id, s]));

export function getSpot(id: string): Spot | undefined {
  return byId.get(id);
}

const DayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function isClosedOn(spot: Spot, date: Date): boolean {
  return spot.closedDays?.includes(date.getDay()) ?? false;
}

export function closedDaysLabel(spot: Spot): string | undefined {
  if (!spot.closedDays?.length) return undefined;
  if (spot.closedDays.length >= 5) {
    const open = DayNames.filter((_, i) => !spot.closedDays!.includes(i));
    return `Open ${open.join(', ')} only`;
  }
  return `Closed ${spot.closedDays.map((d) => DayNames[d]).join(', ')}`;
}
