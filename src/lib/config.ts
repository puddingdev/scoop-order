export const GAS_URL =
  'https://script.google.com/macros/s/AKfycbzNM4I-1rSyDFTRtigO08DXn64Ii6t1fZMGJiPE8yQoAZoHsJetlgYeHIU_XdmYqWRhgA/exec';

export const SIZES = [
  { id: 'M', label: 'M', scoops: 5, price: 50, maxFlavor: 1, freeTops: 0 },
  { id: 'L', label: 'L', scoops: 8, price: 75, maxFlavor: 2, freeTops: 1 },
] as const;

export const FLAVORS = [
  { id: 'choc',    label: 'ช็อกโกแลต',       emoji: '🍫' },
  { id: 'cnc',     label: 'คุกกี้แอนด์ครีม', emoji: '🍪' },
  { id: 'van',     label: 'วานิลลา',          emoji: '🍦' },
];

export const TOPPINGS = [
  { id: 'oreo',      label: 'โอรีโอ้',        emoji: '⚫' },
  { id: 'brownie',   label: 'บราวนี่',         emoji: '🟫' },
  { id: 'corn',      label: 'คอร์นเฟลก',      emoji: '🌽' },
  { id: 'ovaltine',  label: 'ผงโอวัลติน',     emoji: '☕' },
  { id: 'choc_s',    label: 'ซอสช็อกโกแลต',  emoji: '🫙' },
];

export const ZONES = [
  { fee: 5,  label: '5฿',  areas: 'พฤกษา 116' },
  { fee: 15, label: '15฿', areas: 'ซ.มาลี, ตะวันออก 14-16, นำรงค์, เศรษฐบุตร, Fullhouse, ซ.ซูม, เจริญสุข, สะพานชมพู' },
  { fee: 20, label: '20฿', areas: 'พร 3, พร 4, พรทวี, โฟร์บี, Maple, หมูน้ำแข็ง, R.S., Icon, ซ.อีส, Kave' },
];

export const STATUS_LABEL: Record<string, string> = {
  WAITING_FOR_STORE: 'รอร้านรับออเดอร์',
  WAITING_PAYMENT:   'รอชำระเงิน',
  MAKING:            'กำลังทำ 🍨',
  READY_TO_DELIVER:  'พร้อมส่ง',
  DELIVERING:        'กำลังส่ง 🛵',
  DELIVERED:         'ส่งสำเร็จ ✅',
  CANCELLED:         'ยกเลิก',
};

export const STATUS_STEPS = [
  'WAITING_FOR_STORE',
  'WAITING_PAYMENT',
  'MAKING',
  'READY_TO_DELIVER',
  'DELIVERING',
  'DELIVERED',
];
