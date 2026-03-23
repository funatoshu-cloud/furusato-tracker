/**
 * Static curated gift catalog.
 *
 * Seed: ~10 well-known furusato nozei municipalities, 2-4 items each.
 * Forward-compatible with a future discover mode:
 *   - `getMuniGifts`   → per-municipality modal tab (Chunk 1)
 *   - `getPrefGiftMunis` / `ALL_GIFT_MUNIS` → map density layer (Chunk 2)
 *
 * Affiliate links are search-style URLs so they stay stable even as
 * individual product pages are updated.
 */

import { DONATION_CATEGORIES, type DonationCategory } from './storage'

export interface GiftItem {
  id: string
  prefecture: string
  municipality: string
  name: string
  category: DonationCategory
  minAmount: number       // minimum donation amount (¥) to receive this gift
  description?: string    // one-line description shown in the modal
  popular?: boolean       // curated 「人気」 badge
  rakutenUrl?: string     // affiliate search link — 楽天ふるさと納税
  satofullUrl?: string    // affiliate search link — さとふる
  choiceUrl?: string      // affiliate search link — ふるさとチョイス
}

// ── URL builders (search-style — stable across product page changes) ───────────

const r = (muni: string, q: string) =>
  `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${muni} ${q}`)}/`
const s = (muni: string, q: string) =>
  `https://www.satofull.jp/search/?keyword=${encodeURIComponent(`${muni} ${q}`)}`
const c = (muni: string, q: string) =>
  `https://www.furusato-tax.jp/search?q=${encodeURIComponent(`${muni} ${q}`)}`

// ── catalog ───────────────────────────────────────────────────────────────────

export const GIFT_CATALOG: GiftItem[] = [

  // ── 都城市（宮崎県）— 寄付額全国トップ常連 ───────────────────────────────────
  {
    id: 'miyakonojo-beef-1',
    prefecture: '宮崎県', municipality: '都城市',
    name: '宮崎牛 ロース すき焼き・しゃぶしゃぶ用 500g',
    category: '肉類', minAmount: 10000, popular: true,
    description: '日本一の称号を何度も獲得した宮崎牛。上質な霜降りと豊かな旨味。',
    rakutenUrl: r('都城市', '宮崎牛'),
    satofullUrl: s('都城市', '宮崎牛'),
    choiceUrl:   c('都城市', '宮崎牛'),
  },
  {
    id: 'miyakonojo-chicken-1',
    prefecture: '宮崎県', municipality: '都城市',
    name: '宮崎地頭鶏 もも・むね肉セット 1kg',
    category: '肉類', minAmount: 6000,
    description: '歯ごたえと旨味が特徴の宮崎ブランド地鶏。',
    rakutenUrl: r('都城市', '地頭鶏'),
    choiceUrl:   c('都城市', '地頭鶏'),
  },
  {
    id: 'miyakonojo-shochu-1',
    prefecture: '宮崎県', municipality: '都城市',
    name: '本格芋焼酎 飲み比べセット 720ml × 3本',
    category: '飲料・お酒', minAmount: 10000, popular: true,
    description: '都城は焼酎の聖地。老舗蔵元の飲み比べセット。',
    rakutenUrl: r('都城市', '芋焼酎'),
    satofullUrl: s('都城市', '芋焼酎'),
    choiceUrl:   c('都城市', '芋焼酎'),
  },

  // ── 根室市（北海道）— 花咲ガニ・ホタテの産地 ────────────────────────────────
  {
    id: 'nemuro-crab-1',
    prefecture: '北海道', municipality: '根室市',
    name: '花咲ガニ 姿ゆで 2杯 約1.2kg',
    category: '魚介類', minAmount: 15000, popular: true,
    description: '根室でしか獲れない希少な花咲ガニ。濃厚な旨味とみそが絶品。',
    rakutenUrl: r('根室市', '花咲ガニ'),
    choiceUrl:   c('根室市', '花咲ガニ'),
  },
  {
    id: 'nemuro-scallop-1',
    prefecture: '北海道', municipality: '根室市',
    name: 'ホタテ貝柱 大粒 1kg（冷凍）',
    category: '魚介類', minAmount: 10000, popular: true,
    description: 'オホーツク海の冷水で育った大粒ホタテ。刺身・バター焼きに最適。',
    rakutenUrl: r('根室市', 'ホタテ'),
    satofullUrl: s('根室市', 'ホタテ'),
    choiceUrl:   c('根室市', 'ホタテ'),
  },
  {
    id: 'nemuro-ikura-1',
    prefecture: '北海道', municipality: '根室市',
    name: 'いくら醤油漬け 500g（冷凍）',
    category: '魚介類', minAmount: 10000,
    description: '根室産サーモンを使った醤油漬け。粒が大きく上品な甘み。',
    rakutenUrl: r('根室市', 'いくら'),
    choiceUrl:   c('根室市', 'いくら'),
  },

  // ── 南魚沼市（新潟県）— 魚沼産コシヒカリの本場 ──────────────────────────────
  {
    id: 'minamiuonuma-rice-1',
    prefecture: '新潟県', municipality: '南魚沼市',
    name: '魚沼産コシヒカリ 精米 10kg',
    category: '米・穀物', minAmount: 10000, popular: true,
    description: '日本最高峰のブランド米。甘み・粘り・艶・香りすべてが最高水準。',
    rakutenUrl: r('南魚沼市', 'コシヒカリ'),
    satofullUrl: s('南魚沼市', 'コシヒカリ'),
    choiceUrl:   c('南魚沼市', 'コシヒカリ'),
  },
  {
    id: 'minamiuonuma-sake-1',
    prefecture: '新潟県', municipality: '南魚沼市',
    name: '南魚沼産 純米吟醸酒 飲み比べセット 720ml × 2本',
    category: '飲料・お酒', minAmount: 10000,
    description: '魚沼の清冽な雪解け水で仕込まれた淡麗辛口の地酒。',
    rakutenUrl: r('南魚沼市', '日本酒'),
    choiceUrl:   c('南魚沼市', '日本酒'),
  },

  // ── 天童市（山形県）— さくらんぼの王国 ──────────────────────────────────────
  {
    id: 'tendo-cherry-1',
    prefecture: '山形県', municipality: '天童市',
    name: 'さくらんぼ 佐藤錦 秀品 1kg（バラ詰め）',
    category: '野菜・果物', minAmount: 10000, popular: true,
    description: 'さくらんぼの王様・佐藤錦。甘みと酸味の絶妙なバランス。',
    rakutenUrl: r('天童市', 'さくらんぼ'),
    satofullUrl: s('天童市', 'さくらんぼ'),
    choiceUrl:   c('天童市', 'さくらんぼ'),
  },
  {
    id: 'tendo-shogi-1',
    prefecture: '山形県', municipality: '天童市',
    name: '天童将棋駒 一字書 置物セット',
    category: '工芸品・アート', minAmount: 10000,
    description: '全国シェア99%を誇る天童の将棋駒。職人が仕上げた一品。',
    choiceUrl: c('天童市', '将棋駒'),
  },

  // ── 那智勝浦町（和歌山県）— 本マグロの水揚げ日本一 ──────────────────────────
  {
    id: 'nachikatsuura-tuna-1',
    prefecture: '和歌山県', municipality: '那智勝浦町',
    name: '本マグロ 赤身・中トロ 食べ比べセット 約500g',
    category: '魚介類', minAmount: 15000, popular: true,
    description: '勝浦漁港水揚げ・遠洋一本釣りの本マグロ。刺身グレードの上質な味。',
    rakutenUrl: r('那智勝浦町', '本マグロ'),
    satofullUrl: s('那智勝浦町', 'マグロ'),
    choiceUrl:   c('那智勝浦町', 'マグロ'),
  },
  {
    id: 'nachikatsuura-katsuobushi-1',
    prefecture: '和歌山県', municipality: '那智勝浦町',
    name: '本枯かつおぶし 削りパック 3g × 30袋',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '勝浦産かつおを伝統の枯節製法で。豊かな旨味と上品な香り。',
    choiceUrl: c('那智勝浦町', 'かつおぶし'),
  },

  // ── 白糠町（北海道）— いくら・ラムが有名 ────────────────────────────────────
  {
    id: 'shiranutka-ikura-1',
    prefecture: '北海道', municipality: '白糠町',
    name: 'いくら醤油漬け 400g × 2パック（冷凍）',
    category: '魚介類', minAmount: 8000, popular: true,
    description: '道東の清流で育ったサーモンの上質なイクラ。大粒でプチッと食感。',
    rakutenUrl: r('白糠町', 'いくら'),
    satofullUrl: s('白糠町', 'いくら'),
    choiceUrl:   c('白糠町', 'いくら'),
  },
  {
    id: 'shiranutka-lamb-1',
    prefecture: '北海道', municipality: '白糠町',
    name: '白糠産ラム肉 ジンギスカン用 500g',
    category: '肉類', minAmount: 7000,
    description: '広大な牧場で育てた臭みの少ない柔らかなラム肉。',
    choiceUrl: c('白糠町', 'ラム肉'),
  },

  // ── 志布志市（鹿児島県）— 鹿児島黒牛・うなぎ ────────────────────────────────
  {
    id: 'shibushi-beef-1',
    prefecture: '鹿児島県', municipality: '志布志市',
    name: '鹿児島黒牛 ロースステーキ 200g × 3枚',
    category: '肉類', minAmount: 15000, popular: true,
    description: '全国和牛能力共進会で最高位を獲得。きめ細かい霜降りが口の中で溶ける。',
    rakutenUrl: r('志布志市', '鹿児島黒牛'),
    satofullUrl: s('志布志市', '黒牛'),
    choiceUrl:   c('志布志市', '黒牛'),
  },
  {
    id: 'shibushi-unagi-1',
    prefecture: '鹿児島県', municipality: '志布志市',
    name: '国産うなぎ 蒲焼き 3尾（冷凍）',
    category: '魚介類', minAmount: 12000,
    description: '志布志湾の清流で育てた国産うなぎ。ふっくら肉厚の蒲焼き。',
    choiceUrl: c('志布志市', 'うなぎ'),
  },

  // ── 唐津市（佐賀県）— 呼子のイカ ────────────────────────────────────────────
  {
    id: 'karatsu-ika-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '呼子のヤリイカ 活け造り用 冷凍 4杯',
    category: '魚介類', minAmount: 12000, popular: true,
    description: '日本三大朝市・呼子で有名なコリコリ食感のイカ。',
    rakutenUrl: r('唐津市', '呼子 イカ'),
    choiceUrl:   c('唐津市', '呼子 イカ'),
  },

  // ── 嬉野市（佐賀県）— 日本三大銘茶・嬉野温泉 ──────────────────────────────
  {
    id: 'ureshino-tea-1',
    prefecture: '佐賀県', municipality: '嬉野市',
    name: '嬉野茶 特選かぶせ茶 100g × 3本',
    category: '飲料・お酒', minAmount: 6000, popular: true,
    description: '日本三大銘茶のひとつ。まろやかな甘みと深い旨味が特徴。',
    rakutenUrl: r('嬉野市', '嬉野茶'),
    satofullUrl: s('嬉野市', '嬉野茶'),
    choiceUrl:   c('嬉野市', '嬉野茶'),
  },
  {
    id: 'ureshino-onsen-1',
    prefecture: '佐賀県', municipality: '嬉野市',
    name: '嬉野温泉 旅館ペア宿泊プラン',
    category: '体験・旅行', minAmount: 30000,
    description: '日本三大美肌の湯。にごり湯の温泉旅館でのペア宿泊。',
    choiceUrl: c('嬉野市', '嬉野温泉 宿泊'),
  },

  // ── 加賀市（石川県）— 九谷焼・加能ガニ ─────────────────────────────────────
  {
    id: 'kaga-kutaniyaki-1',
    prefecture: '石川県', municipality: '加賀市',
    name: '九谷焼 湯のみ・茶碗セット',
    category: '工芸品・アート', minAmount: 10000,
    description: '鮮やかな彩色が特徴の石川の伝統工芸品。日常使いできる実用品。',
    rakutenUrl: r('加賀市', '九谷焼'),
    choiceUrl:   c('加賀市', '九谷焼'),
  },
  {
    id: 'kaga-crab-1',
    prefecture: '石川県', municipality: '加賀市',
    name: '加能ガニ（ズワイガニ雄） 1杯 約800g',
    category: '魚介類', minAmount: 15000, popular: true,
    description: '石川のブランドズワイガニ。冬の味覚の王様。甘みと豊かな身。',
    choiceUrl: c('加賀市', '加能ガニ'),
  },

  // ── 平戸市（長崎県）— 海産物の宝庫 ─────────────────────────────────────────
  {
    id: 'hirado-seafood-1',
    prefecture: '長崎県', municipality: '平戸市',
    name: '平戸の恵み 旬の鮮魚詰め合わせ 2kg',
    category: '魚介類', minAmount: 8000, popular: true,
    description: '玄界灘と東シナ海に面した平戸の新鮮な旬魚。産地直送。',
    rakutenUrl: r('平戸市', '鮮魚'),
    choiceUrl:   c('平戸市', '鮮魚'),
  },
  {
    id: 'hirado-wagyu-1',
    prefecture: '長崎県', municipality: '平戸市',
    name: '平戸和牛 すき焼き用 300g',
    category: '肉類', minAmount: 10000,
    description: '平戸の豊かな自然で育った和牛。きめ細かくジューシーな味わい。',
    choiceUrl: c('平戸市', '平戸和牛'),
  },
]

// ── derived lookups (computed once at module load) ────────────────────────────

/** All municipalities with catalog entries, as "prefecture|municipality" keys. */
export const ALL_GIFT_MUNIS: ReadonlySet<string> = new Set(
  GIFT_CATALOG.map(g => `${g.prefecture}|${g.municipality}`),
)

/** All gifts for a specific municipality. */
export function getMuniGifts(prefecture: string, municipality: string): GiftItem[] {
  return GIFT_CATALOG.filter(
    g => g.prefecture === prefecture && g.municipality === municipality,
  )
}

/** All municipality names in a given prefecture that have catalog entries. */
export function getPrefGiftMunis(prefecture: string): Set<string> {
  return new Set(
    GIFT_CATALOG
      .filter(g => g.prefecture === prefecture)
      .map(g => g.municipality),
  )
}

/** Prefectures that have at least one catalog entry — for zoomed-out map coloring. */
export const ALL_GIFT_PREFS: ReadonlySet<string> = new Set(
  GIFT_CATALOG.map(g => g.prefecture),
)

/**
 * Number of distinct municipalities in a prefecture that have catalog entries,
 * optionally filtered by category. Used for discover-mode color intensity.
 */
export function getPrefDiscoverMuniCount(
  prefecture: string,
  category: DonationCategory | 'all',
): number {
  return new Set(
    GIFT_CATALOG
      .filter(g => g.prefecture === prefecture && (category === 'all' || g.category === category))
      .map(g => g.municipality),
  ).size
}

/**
 * Categories present in the catalog, in canonical DONATION_CATEGORIES order.
 * Used to populate the discover-mode category filter bar.
 */
export const CATALOG_CATEGORIES: ReadonlyArray<DonationCategory> =
  DONATION_CATEGORIES.filter(cat => GIFT_CATALOG.some(g => g.category === cat))
