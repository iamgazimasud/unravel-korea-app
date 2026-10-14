/** Offline content for the Korean tab: the phrases travelers actually use, plus emergency numbers. */

export type Phrase = { ko: string; roman: string; en: string };

/** Twelve phrases cover almost every situation on a first trip. Order = how often you'll need them. */
export const Phrases: Phrase[] = [
  { ko: '안녕하세요', roman: 'annyeonghaseyo', en: 'Hello' },
  { ko: '감사합니다', roman: 'gamsahamnida', en: 'Thank you' },
  { ko: '저기요', roman: 'jeogiyo', en: 'Excuse me (to get attention)' },
  { ko: '죄송합니다', roman: 'joesonghamnida', en: "I'm sorry" },
  { ko: '이거 주세요', roman: 'igeo juseyo', en: 'This one, please' },
  { ko: '얼마예요?', roman: 'eolmayeyo?', en: 'How much is it?' },
  { ko: '안 맵게 해 주세요', roman: 'an maepge hae juseyo', en: 'Not spicy, please' },
  { ko: '물 주세요', roman: 'mul juseyo', en: 'Water, please' },
  { ko: '계산해 주세요', roman: 'gyesanhae juseyo', en: 'The bill, please' },
  { ko: '화장실 어디예요?', roman: 'hwajangsil eodiyeyo?', en: 'Where is the restroom?' },
  { ko: '여기로 가 주세요', roman: 'yeogiro ga juseyo', en: 'Please take me here (taxi)' },
  { ko: '도와주세요!', roman: 'dowajuseyo!', en: 'Help!' },
];

export const EmergencyNumbers = [
  { number: '112', label: 'Police', detail: 'Interpretation available' },
  { number: '119', label: 'Fire & ambulance', detail: 'Medical emergencies too' },
  { number: '1330', label: 'Korea Travel Hotline', detail: '24/7 in English — +82-2-1330 from abroad' },
];

export const Tips: { title: string; icon: string; body: string }[] = [
  {
    title: 'Use Naver Map, not Google Maps',
    icon: 'navigate',
    body: 'Google Maps cannot give walking directions in Korea. Every place in this app has a Directions button that opens Naver Map in Korean for you. Add Papago for translating menus with your camera.',
  },
  {
    title: 'Get a T-money card',
    icon: 'card',
    body: 'Buy one (or a WOWPASS) at any convenience store and top it up with cash. Tap in and out on subways and buses. Taxis: use the Kakao T app, or show the driver a Taxi card from this app.',
  },
  {
    title: 'Cards work, tipping doesn’t',
    icon: 'cash',
    body: 'Cards are accepted almost everywhere, but carry some cash for markets. There is no tipping. Big stores refund tax instantly with your passport.',
  },
];
