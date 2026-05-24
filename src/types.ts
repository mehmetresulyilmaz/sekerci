/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CandyType {
  RED_CHERRY = 1,
  BLUE_JELLY = 2,
  YELLOW_LEMON = 3,
  GREEN_APPLE = 4,
  ORANGE_CARAMEL = 5,
  PURPLE_GUM = 6,
  COLOR_BOMB = 7, // Chocolate dynamic candy
}

export type SpecialType = 'NORMAL' | 'STRIPED_H' | 'STRIPED_V' | 'WRAPPED' | 'COLOR_BOMB';

export interface CandyItem {
  id: string; // Unique stable random ID for transition matching
  type: CandyType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isGhost?: boolean; // For sliding drops
  isBlocker?: boolean; // Static chocolate blocker item
  frozen?: boolean; // Ice capsule wrapper
}

export interface GameStats {
  score: number;
  highScore: number;
  movesLeft: number;
  targetScore: number;
  level: number;
  combos: number;
}

export interface BoosterState {
  extraMovesCount: number;
  stripeHammerCount: number;
  colorBombCount: number;
}

export interface DailyReward {
  day: number;
  rewardType: 'moves' | 'stripe' | 'color_bomb' | 'score_boost';
  amount: number;
  label: string;
  icon: string;
}

// Cookie Helpers
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export interface LevelDefinition {
  id: number;
  name: string;
  description: string;
  target: number;
  moves: number;
  objective: string;
  blockers?: { row: number; col: number }[];
  frozen?: { row: number; col: number }[];
}

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: "Naneli Başlangıç",
    description: "Tatlı Krallığı'na adım at ve temel eşleştirmelerle puan topla!",
    target: 1500,
    moves: 30,
    objective: "1.500 puana ulaşın"
  },
  {
    id: 2,
    name: "Jöle Vadisi",
    description: "Dört köşedeki dondurucu jöleli şekerleri eşleştirerek oyun dışı bırak!",
    target: 2500,
    moves: 26,
    objective: "2.500 puana ulaş ve buzları erit",
    frozen: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
      { row: 3, col: 3 }, { row: 4, col: 4 }
    ]
  },
  {
    id: 3,
    name: "Karamel Barajı",
    description: "Alt sıraya kurulmuş sert çikolata engellerini yanlarında eşleşmeler yaparak patlat!",
    target: 4000,
    moves: 24,
    objective: "4.000 puana ulaş ve çikolataları yok et",
    blockers: [
      { row: 7, col: 2 }, { row: 7, col: 3 },
      { row: 7, col: 4 }, { row: 7, col: 5 }
    ]
  },
  {
    id: 4,
    name: "Limonlu Girdap",
    description: "Çaprazlara yerleşen sert çikolatalar ve gizemli dondurulmuş çilekler!",
    target: 5200,
    moves: 22,
    objective: "Çapraz buzları ve engelleri aş",
    blockers: [
      { row: 2, col: 2 }, { row: 5, col: 5 },
      { row: 2, col: 5 }, { row: 5, col: 2 }
    ],
    frozen: [
      { row: 1, col: 1 }, { row: 6, col: 6 },
      { row: 1, col: 6 }, { row: 6, col: 1 }
    ]
  },
  {
    id: 5,
    name: "Çikolata Kalesi",
    description: "Diyarın muhafız karamelleri tahtanın dört bir yanını sardı. Engeller çok yoğun!",
    target: 7000,
    moves: 20,
    objective: "Merkez ve kenar engellerini un ufak et",
    blockers: [
      { row: 3, col: 0 }, { row: 4, col: 0 },
      { row: 3, col: 7 }, { row: 4, col: 7 },
      { row: 0, col: 3 }, { row: 0, col: 4 }
    ],
    frozen: [
      { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 5, col: 3 }, { row: 5, col: 4 }
    ]
  },
  {
    id: 6,
    name: "Orman Meyveli Buzul",
    description: "Tahtanın ortasından geçen kalın buzul katmanı şekerlerin düşüşünü engelliyor!",
    target: 9000,
    moves: 18,
    objective: "Merkez buzul setini eritin",
    frozen: [
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }
    ]
  },
  {
    id: 7,
    name: "Saray Labirenti",
    description: "Karmaşık labirentte hareket kısıtlı! En yüksek seviye şekerlerle engelleri aş.",
    target: 11000,
    moves: 17,
    objective: "Çikolataları yok ederek labirenti güvenli hale getirin",
    blockers: [
      { row: 1, col: 2 }, { row: 1, col: 5 },
      { row: 3, col: 2 }, { row: 3, col: 5 },
      { row: 5, col: 2 }, { row: 5, col: 5 }
    ],
    frozen: [
      { row: 2, col: 2 }, { row: 2, col: 5 },
      { row: 4, col: 2 }, { row: 4, col: 5 }
    ]
  },
  {
    id: 8,
    name: "Ekşi Elma Madeni",
    description: "Aşağıki elmas şekerler karamel ve çikolata bloklarının altında gizli!",
    target: 13500,
    moves: 16,
    objective: "Kalın maden katmanlarını patlatın",
    blockers: [
      { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
      { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }
    ],
    frozen: [
      { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 },
      { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }
    ]
  },
  {
    id: 9,
    name: "Gökkuşağı Krallığı",
    description: "Sarayın kapıları kilitli! Çizgili şekerler ve renk bombaları ile buzları kır.",
    target: 16500,
    moves: 15,
    objective: "Kombolarla buz hapishanesini kırın",
    frozen: [
      { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 0, col: 6 }, { row: 1, col: 7 },
      { row: 6, col: 0 }, { row: 7, col: 1 }, { row: 6, col: 7 }, { row: 7, col: 6 },
      { row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 5 }
    ],
    blockers: [
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 }
    ]
  },
  {
    id: 10,
    name: "Mega Karamel İmparatorluğu",
    description: "Tatlı İmparatorluğu'nun nihai mücadelesi! Her bir hamleni dahi hesaplamalısın.",
    target: 21000,
    moves: 14,
    objective: "Tüm engelleri yıkıp diyarı fethet!",
    blockers: [
      { row: 0, col: 0 }, { row: 0, col: 7 }, { row: 7, col: 0 }, { row: 7, col: 7 },
      { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 5, col: 3 }, { row: 5, col: 4 },
      { row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 5 }
    ],
    frozen: [
      { row: 1, col: 1 }, { row: 1, col: 6 }, { row: 6, col: 1 }, { row: 6, col: 6 },
      { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 3, col: 6 }, { row: 4, col: 6 }
    ]
  }
];

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardType: 'stripe' | 'color_bomb' | 'score_boost';
  rewardAmount: number;
  rewardLabel: string;
  isClaimed: boolean;
}

