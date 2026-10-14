export type Phrase = { ko: string; roman: string; en: string };

export const PhraseGroups: { title: string; phrases: Phrase[] }[] = [
  {
    title: 'Basics',
    phrases: [
      { ko: '안녕하세요', roman: 'annyeonghaseyo', en: 'Hello' },
      { ko: '감사합니다', roman: 'gamsahamnida', en: 'Thank you' },
      { ko: '죄송합니다', roman: 'joesonghamnida', en: "I'm sorry" },
      { ko: '저기요', roman: 'jeogiyo', en: 'Excuse me (to get attention)' },
      { ko: '괜찮아요', roman: 'gwaenchanayo', en: "It's okay / No thanks" },
      { ko: '영어 하세요?', roman: 'yeongeo haseyo?', en: 'Do you speak English?' },
    ],
  },
  {
    title: 'Food',
    phrases: [
      { ko: '두 명이요', roman: 'du myeong-iyo', en: 'Table for two' },
      { ko: '이거 주세요', roman: 'igeo juseyo', en: 'This one, please' },
      { ko: '안 맵게 해 주세요', roman: 'an maepge hae juseyo', en: 'Not spicy, please' },
      { ko: '물 주세요', roman: 'mul juseyo', en: 'Water, please' },
      { ko: '포장해 주세요', roman: 'pojanghae juseyo', en: 'To go, please' },
      { ko: '계산해 주세요', roman: 'gyesanhae juseyo', en: 'The bill, please' },
      { ko: '맛있어요!', roman: 'masisseoyo!', en: "It's delicious!" },
    ],
  },
  {
    title: 'Shopping',
    phrases: [
      { ko: '얼마예요?', roman: 'eolmayeyo?', en: 'How much is it?' },
      { ko: '카드 돼요?', roman: 'kadeu dwaeyo?', en: 'Can I pay by card?' },
      { ko: '영수증 주세요', roman: 'yeongsujeung juseyo', en: 'Receipt, please' },
      { ko: '택스 리펀 돼요?', roman: 'taekseu ripeon dwaeyo?', en: 'Can I get a tax refund?' },
    ],
  },
  {
    title: 'Getting around',
    phrases: [
      { ko: '여기로 가 주세요', roman: 'yeogiro ga juseyo', en: 'Please take me here (taxi)' },
      { ko: '화장실 어디예요?', roman: 'hwajangsil eodiyeyo?', en: 'Where is the restroom?' },
      { ko: '지하철역 어디예요?', roman: 'jihacheol-yeok eodiyeyo?', en: 'Where is the subway station?' },
      { ko: '사진 찍어 주시겠어요?', roman: 'sajin jjigeo jusigesseoyo?', en: 'Could you take a photo of us?' },
    ],
  },
  {
    title: 'Emergency',
    phrases: [
      { ko: '도와주세요!', roman: 'dowajuseyo!', en: 'Help!' },
      { ko: '병원 어디예요?', roman: 'byeongwon eodiyeyo?', en: 'Where is the hospital?' },
      { ko: '아파요', roman: 'apayo', en: "I'm sick / It hurts" },
    ],
  },
];

export const EmergencyNumbers = [
  { number: '112', label: 'Police', detail: 'Interpretation available' },
  { number: '119', label: 'Fire & ambulance', detail: 'Medical emergencies too' },
  { number: '1330', label: 'Korea Travel Hotline', detail: '24/7, English and more — +82-2-1330 from abroad' },
];

export const Tips: { title: string; icon: string; body: string }[] = [
  {
    title: 'Use Naver Map or KakaoMap',
    icon: 'navigate',
    body: 'Google Maps cannot give walking or driving directions in Korea. Every spot in this app has an "Open in Naver Map" button that searches in Korean for you.',
  },
  {
    title: 'Get a transit card',
    icon: 'card',
    body: 'Buy a T-money card (or a WOWPASS) at any convenience store and top it up with cash. Tap in and out on subways and buses — transfers within 30 minutes are discounted.',
  },
  {
    title: 'Taxis',
    icon: 'car',
    body: 'Kakao T is the main taxi app. If your foreign card is rejected, try K.Ride. Show the driver the Korean address from any spot card.',
  },
  {
    title: 'Money',
    icon: 'cash',
    body: 'Cards work almost everywhere, but carry some cash for markets and street food. Big stores give instant tax refunds with your passport.',
  },
  {
    title: 'Etiquette',
    icon: 'people',
    body: 'No tipping. Keep calls quiet on the subway and leave the priority seats empty. Take shoes off when you see a raised floor.',
  },
];

export const MustHaveApps = [
  { name: 'Naver Map', why: 'Directions, transit, opening hours' },
  { name: 'Papago', why: 'Best Korean translator — camera mode reads menus' },
  { name: 'Kakao T', why: 'Taxis (K.Ride as a backup for foreign cards)' },
  { name: 'Kakao Metro', why: 'Which train car to board for the fastest exit' },
];
