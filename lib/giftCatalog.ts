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
  {
    id: 'miyakonojo-rice-1',
    prefecture: '宮崎県', municipality: '都城市',
    name: '都城産 ヒノヒカリ 精米 10kg',
    category: '米・穀物', minAmount: 7000,
    description: '南九州の豊かな陽光が育てた食味ランクA以上のお米。',
    rakutenUrl: r('都城市', 'ヒノヒカリ'),
    choiceUrl:   c('都城市', '米'),
  },
  {
    id: 'miyakonojo-mango-1',
    prefecture: '宮崎県', municipality: '都城市',
    name: '完熟マンゴー 宮崎産 2玉（約600g）',
    category: '野菜・果物', minAmount: 12000, popular: true,
    description: '完熟して自然落下した「太陽のタマゴ」。濃厚な甘みとなめらかな果肉。',
    rakutenUrl: r('都城市', 'マンゴー'),
    satofullUrl: s('都城市', 'マンゴー'),
    choiceUrl:   c('都城市', 'マンゴー'),
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
  {
    id: 'nemuro-cheese-1',
    prefecture: '北海道', municipality: '根室市',
    name: '根室産 ナチュラルチーズ 詰め合わせ 4種',
    category: '乳製品・加工食品', minAmount: 7000,
    description: '広大な牧場の生乳から作るゴーダ・カマンベールなど4種のチーズセット。',
    rakutenUrl: r('根室市', 'チーズ'),
    choiceUrl:   c('根室市', 'チーズ'),
  },
  {
    id: 'nemuro-salmon-1',
    prefecture: '北海道', municipality: '根室市',
    name: '根室産 秋鮭 切り身 約2kg（冷凍）',
    category: '魚介類', minAmount: 8000,
    description: '脂がのった旬の秋鮭。ムニエル・塩焼き・ちゃんちゃん焼きに。',
    rakutenUrl: r('根室市', '秋鮭'),
    choiceUrl:   c('根室市', '鮭'),
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
  {
    id: 'minamiuonuma-pork-1',
    prefecture: '新潟県', municipality: '南魚沼市',
    name: '魚沼産 雪室熟成豚 ロース・バラ切り落とし 1kg',
    category: '肉類', minAmount: 8000,
    description: '雪室の低温・高湿度でじっくり熟成させた旨味たっぷりの豚肉。',
    rakutenUrl: r('南魚沼市', '豚肉'),
    choiceUrl:   c('南魚沼市', '豚肉'),
  },
  {
    id: 'minamiuonuma-edamame-1',
    prefecture: '新潟県', municipality: '南魚沼市',
    name: '南魚沼産 冷凍枝豆 500g × 4袋',
    category: '野菜・果物', minAmount: 6000,
    description: '新潟のブランド枝豆「くろさき茶豆」を急速冷凍。甘みと香りが格別。',
    choiceUrl: c('南魚沼市', '枝豆'),
  },

  // ── 天童市（山形県）— さくらんぼの王国・将棋駒の里 ──────────────────────────
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
  {
    id: 'tendo-beef-1',
    prefecture: '山形県', municipality: '天童市',
    name: '山形牛 肩ロース 焼き肉用 400g',
    category: '肉類', minAmount: 8000,
    description: '山形が誇るブランド和牛。赤みと霜降りのバランスが良く旨味豊か。',
    rakutenUrl: r('天童市', '山形牛'),
    choiceUrl:   c('天童市', '山形牛'),
  },
  {
    id: 'tendo-sake-1',
    prefecture: '山形県', municipality: '天童市',
    name: '天童市 地酒セット 純米大吟醸 720ml × 2本',
    category: '飲料・お酒', minAmount: 10000,
    description: '天童の名水と山形酵母で醸した芳醇な純米大吟醸の飲み比べ。',
    rakutenUrl: r('天童市', '地酒'),
    choiceUrl:   c('天童市', '地酒'),
  },
  {
    id: 'tendo-peach-1',
    prefecture: '山形県', municipality: '天童市',
    name: '山形産 桃 秀品 2kg（6〜8玉）',
    category: '野菜・果物', minAmount: 8000,
    description: '山形の夏を代表する桃。みずみずしい果汁と上品な甘みが自慢。',
    rakutenUrl: r('天童市', '桃'),
    choiceUrl:   c('天童市', '桃'),
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
  {
    id: 'nachikatsuura-umeshu-1',
    prefecture: '和歌山県', municipality: '那智勝浦町',
    name: '紀州南高梅 梅酒・梅干しセット',
    category: '飲料・お酒', minAmount: 8000, popular: true,
    description: '日本一の梅産地・和歌山の南高梅。梅酒と梅干しのお得なセット。',
    rakutenUrl: r('那智勝浦町', '南高梅'),
    choiceUrl:   c('那智勝浦町', '梅'),
  },
  {
    id: 'nachikatsuura-onsen-1',
    prefecture: '和歌山県', municipality: '那智勝浦町',
    name: '那智勝浦温泉 旅館ペア宿泊券',
    category: '体験・旅行', minAmount: 30000,
    description: '日本三古湯のひとつ。熊野那智大社へのアクセス抜群の温泉宿泊。',
    choiceUrl: c('那智勝浦町', '温泉 宿泊'),
  },
  {
    id: 'nachikatsuura-mandarin-1',
    prefecture: '和歌山県', municipality: '那智勝浦町',
    name: '有田みかん 秀品 5kg（L〜2Lサイズ）',
    category: '野菜・果物', minAmount: 5000,
    description: '全国ブランドの有田みかん。酸味と甘みのバランスが良く皮が薄い。',
    rakutenUrl: r('那智勝浦町', 'みかん'),
    choiceUrl:   c('那智勝浦町', 'みかん'),
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
  {
    id: 'shiranutka-shijimi-1',
    prefecture: '北海道', municipality: '白糠町',
    name: '白糠産 大和しじみ 冷凍 1kg',
    category: '魚介類', minAmount: 6000,
    description: '阿寒湖系の清水で育った大粒しじみ。旨味たっぷりの味噌汁に。',
    rakutenUrl: r('白糠町', 'しじみ'),
    choiceUrl:   c('白糠町', 'しじみ'),
  },
  {
    id: 'shiranutka-butter-1',
    prefecture: '北海道', municipality: '白糠町',
    name: '白糠産 発酵バター・チーズ セット',
    category: '乳製品・加工食品', minAmount: 6000,
    description: '牧場直送の生乳から作る芳醇な発酵バターと熟成チーズの詰め合わせ。',
    choiceUrl: c('白糠町', 'バター チーズ'),
  },
  {
    id: 'shiranutka-venison-1',
    prefecture: '北海道', municipality: '白糠町',
    name: 'エゾシカ ジビエ 煮込み用ブロック 500g',
    category: '肉類', minAmount: 8000,
    description: '北海道の大自然で育ったエゾシカ。高タンパク・低脂肪のジビエ肉。',
    rakutenUrl: r('白糠町', 'エゾシカ'),
    choiceUrl:   c('白糠町', 'エゾシカ'),
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
  {
    id: 'shibushi-shochu-1',
    prefecture: '鹿児島県', municipality: '志布志市',
    name: '志布志産 芋焼酎 プレミアム 720ml × 3本',
    category: '飲料・お酒', minAmount: 9000, popular: true,
    description: '志布志の豊かな水と黄金千貫（コガネセンガン）で醸した本格芋焼酎。',
    rakutenUrl: r('志布志市', '芋焼酎'),
    choiceUrl:   c('志布志市', '芋焼酎'),
  },
  {
    id: 'shibushi-rice-1',
    prefecture: '鹿児島県', municipality: '志布志市',
    name: '志布志産 ひのひかり 精米 5kg × 2袋',
    category: '米・穀物', minAmount: 7000,
    description: '温暖な鹿児島の気候と豊富な日射量で育てた艶やかなお米。',
    rakutenUrl: r('志布志市', '米'),
    choiceUrl:   c('志布志市', '米'),
  },
  {
    id: 'shibushi-pork-1',
    prefecture: '鹿児島県', municipality: '志布志市',
    name: '鹿児島黒豚 バラ・ロース しゃぶしゃぶ用 500g',
    category: '肉類', minAmount: 8000,
    description: '飼育期間が長く旨味が凝縮した鹿児島黒豚。脂が甘くとろける食感。',
    rakutenUrl: r('志布志市', '鹿児島黒豚'),
    choiceUrl:   c('志布志市', '黒豚'),
  },

  // ── 唐津市（佐賀県）— 呼子のイカ・玄界灘の海産物 ───────────────────────────
  {
    id: 'karatsu-ika-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '呼子のヤリイカ 活け造り用 冷凍 4杯',
    category: '魚介類', minAmount: 12000, popular: true,
    description: '日本三大朝市・呼子で有名なコリコリ食感のイカ。',
    rakutenUrl: r('唐津市', '呼子 イカ'),
    choiceUrl:   c('唐津市', '呼子 イカ'),
  },
  {
    id: 'karatsu-beef-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '佐賀牛 切り落とし 500g',
    category: '肉類', minAmount: 8000, popular: true,
    description: '全国トップ水準の評価を誇る佐賀牛。口どけなめらかで深い旨味。',
    rakutenUrl: r('唐津市', '佐賀牛'),
    choiceUrl:   c('唐津市', '佐賀牛'),
  },
  {
    id: 'karatsu-kakiyaki-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '唐津産 牡蠣 殻付き 2kg（約20〜25個）',
    category: '魚介類', minAmount: 8000,
    description: '玄界灘の清流で育った濃厚な唐津産カキ。BBQやカキ鍋に最適。',
    rakutenUrl: r('唐津市', '牡蠣'),
    choiceUrl:   c('唐津市', '牡蠣'),
  },
  {
    id: 'karatsu-tea-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '嬉野・唐津 銘茶セット 100g × 3種',
    category: '飲料・お酒', minAmount: 5000,
    description: '佐賀の名産地から選りすぐりの緑茶・ほうじ茶・玉露の3種セット。',
    choiceUrl: c('唐津市', 'お茶'),
  },
  {
    id: 'karatsu-karatsuware-1',
    prefecture: '佐賀県', municipality: '唐津市',
    name: '唐津焼 湯のみ 2客セット',
    category: '工芸品・アート', minAmount: 10000,
    description: '「一楽・二萩・三唐津」と茶人に愛された唐津焼。素朴で温かみある一品。',
    rakutenUrl: r('唐津市', '唐津焼'),
    choiceUrl:   c('唐津市', '唐津焼'),
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
  {
    id: 'ureshino-tofu-1',
    prefecture: '佐賀県', municipality: '嬉野市',
    name: '嬉野温泉 温泉湯豆腐 セット（2〜3人前）',
    category: '乳製品・加工食品', minAmount: 5000, popular: true,
    description: '温泉水で煮るとトロトロに溶ける嬉野名物。お土産用出汁付き。',
    rakutenUrl: r('嬉野市', '温泉湯豆腐'),
    choiceUrl:   c('嬉野市', '温泉豆腐'),
  },
  {
    id: 'ureshino-beef-1',
    prefecture: '佐賀県', municipality: '嬉野市',
    name: '佐賀牛 嬉野産 しゃぶしゃぶ用 300g',
    category: '肉類', minAmount: 8000,
    description: '嬉野の豊かな自然で育てた佐賀牛。薄切りでしゃぶしゃぶに最適。',
    choiceUrl: c('嬉野市', '佐賀牛'),
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
  {
    id: 'kaga-sake-1',
    prefecture: '石川県', municipality: '加賀市',
    name: '加賀の地酒 純米大吟醸 720ml × 2本',
    category: '飲料・お酒', minAmount: 10000,
    description: '霊峰白山の清冽な伏流水で仕込む芳醇な吟醸酒。',
    rakutenUrl: r('加賀市', '加賀 地酒'),
    choiceUrl:   c('加賀市', '日本酒'),
  },
  {
    id: 'kaga-vegetable-1',
    prefecture: '石川県', municipality: '加賀市',
    name: '加賀野菜 詰め合わせボックス 旬の5〜6種',
    category: '野菜・果物', minAmount: 6000,
    description: '加賀れんこん・五郎島金時などブランド「加賀野菜」の旬野菜セット。',
    rakutenUrl: r('加賀市', '加賀野菜'),
    choiceUrl:   c('加賀市', '加賀野菜'),
  },
  {
    id: 'kaga-onsen-1',
    prefecture: '石川県', municipality: '加賀市',
    name: '山代温泉・山中温泉 旅館ペア宿泊券',
    category: '体験・旅行', minAmount: 40000,
    description: '松尾芭蕉も愛した山中温泉。九谷焼の山代温泉と合わせた文化の旅。',
    choiceUrl: c('加賀市', '加賀温泉 宿泊'),
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
  {
    id: 'hirado-kasutera-1',
    prefecture: '長崎県', municipality: '平戸市',
    name: '平戸カステラ 長崎伝統製法 1本',
    category: '乳製品・加工食品', minAmount: 5000, popular: true,
    description: 'ポルトガル伝来の南蛮菓子を守り続ける平戸の老舗カステラ。しっとり濃厚。',
    rakutenUrl: r('平戸市', 'カステラ'),
    choiceUrl:   c('平戸市', 'カステラ'),
  },
  {
    id: 'hirado-abalone-1',
    prefecture: '長崎県', municipality: '平戸市',
    name: '平戸産 あわび 冷凍 300g（3〜4個）',
    category: '魚介類', minAmount: 12000,
    description: '海流豊かな平戸沿岸で育った天然アワビ。刺身・バター焼きに。',
    rakutenUrl: r('平戸市', 'あわび'),
    choiceUrl:   c('平戸市', 'アワビ'),
  },
  {
    id: 'hirado-tourist-1',
    prefecture: '長崎県', municipality: '平戸市',
    name: '平戸城観光・平戸ザビエル記念教会 体験プラン',
    category: '体験・旅行', minAmount: 20000,
    description: '日本最古の西洋式城下町・平戸の城と教会が共存する異国情緒の歴史体験。',
    choiceUrl: c('平戸市', '体験 観光'),
  },

  // ── 松阪市（三重県）— 日本三大和牛・松阪牛 ──────────────────────────────────
  {
    id: 'matsusaka-beef-1',
    prefecture: '三重県', municipality: '松阪市',
    name: '松阪牛 A5等級 肩ロース すき焼き・しゃぶしゃぶ用 300g',
    category: '肉類', minAmount: 20000, popular: true,
    description: '日本三大和牛のひとつ。一頭の農家が大切に育てた幻の霜降り牛肉。',
    rakutenUrl: r('松阪市', '松阪牛'),
    satofullUrl: s('松阪市', '松阪牛'),
    choiceUrl:   c('松阪市', '松阪牛'),
  },
  {
    id: 'matsusaka-beef-2',
    prefecture: '三重県', municipality: '松阪市',
    name: '松阪牛 切り落とし 500g（冷凍）',
    category: '肉類', minAmount: 10000,
    description: '手頃な価格で松阪牛の旨味を。牛丼・炒め物・カレーに最適。',
    rakutenUrl: r('松阪市', '松阪牛 切り落とし'),
    choiceUrl:   c('松阪市', '松阪牛 切り落とし'),
  },
  {
    id: 'matsusaka-ise-seafood-1',
    prefecture: '三重県', municipality: '松阪市',
    name: '伊勢湾産 的矢かき 殻付き 2kg',
    category: '魚介類', minAmount: 8000,
    description: '三重県的矢湾の清澄な海で育った牡蠣。海のミルクと呼ばれる濃厚な味わい。',
    rakutenUrl: r('松阪市', '的矢かき'),
    choiceUrl:   c('松阪市', '牡蠣'),
  },
  {
    id: 'matsusaka-tea-1',
    prefecture: '三重県', municipality: '松阪市',
    name: '伊勢茶 松阪産 特上煎茶 100g × 3本',
    category: '飲料・お酒', minAmount: 6000,
    description: '全国3位の産地・三重の伊勢茶。深蒸し製法でコク深く旨味が強い。',
    rakutenUrl: r('松阪市', '伊勢茶'),
    choiceUrl:   c('松阪市', '伊勢茶'),
  },
  {
    id: 'matsusaka-miso-1',
    prefecture: '三重県', municipality: '松阪市',
    name: '三重県産 赤味噌・白味噌 詰め合わせ 各500g',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '松阪の老舗蔵元が醸す伝統の麹味噌。料理の奥行きを引き出す旨味。',
    choiceUrl: c('松阪市', '味噌'),
  },

  // ── 南三陸町（宮城県）— 三陸の豊かな海産物 ─────────────────────────────────
  {
    id: 'minamisan-riku-oyster-1',
    prefecture: '宮城県', municipality: '南三陸町',
    name: '南三陸産 殻付き牡蠣 2kg（約16〜20個）',
    category: '魚介類', minAmount: 7000, popular: true,
    description: '世界三大漁場・三陸の豊かなプランクトンで育った濃厚な牡蠣。',
    rakutenUrl: r('南三陸町', '牡蠣'),
    satofullUrl: s('南三陸町', '牡蠣'),
    choiceUrl:   c('南三陸町', '牡蠣'),
  },
  {
    id: 'minamisan-riku-scallop-1',
    prefecture: '宮城県', municipality: '南三陸町',
    name: '三陸産 ホタテ 貝柱 1kg（冷凍）',
    category: '魚介類', minAmount: 8000, popular: true,
    description: '冷たい三陸の海でゆっくり育った肉厚な大粒ホタテ。甘みが抜群。',
    rakutenUrl: r('南三陸町', 'ホタテ'),
    choiceUrl:   c('南三陸町', 'ホタテ'),
  },
  {
    id: 'minamisan-riku-wakame-1',
    prefecture: '宮城県', municipality: '南三陸町',
    name: '南三陸産 生わかめ 塩蔵 500g × 2袋',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '三陸の荒波で育った肉厚わかめ。茎わかめも付いた絶品の塩蔵わかめ。',
    rakutenUrl: r('南三陸町', 'わかめ'),
    choiceUrl:   c('南三陸町', 'わかめ'),
  },
  {
    id: 'minamisan-riku-salmon-1',
    prefecture: '宮城県', municipality: '南三陸町',
    name: '三陸産 銀鮭 切り身 約1.5kg（冷凍）',
    category: '魚介類', minAmount: 7000,
    description: '三陸沖の養殖銀鮭。脂のりが良く旨味が強い。塩焼き・ムニエルに。',
    choiceUrl: c('南三陸町', '銀鮭'),
  },
  {
    id: 'minamisan-riku-abalone-1',
    prefecture: '宮城県', municipality: '南三陸町',
    name: '南三陸産 天然アワビ 300g（2〜3個）',
    category: '魚介類', minAmount: 15000,
    description: '豊かな海藻を食べて育った肉厚の天然アワビ。煮貝・バター焼きに絶品。',
    rakutenUrl: r('南三陸町', 'アワビ'),
    choiceUrl:   c('南三陸町', 'アワビ'),
  },

  // ── 境港市（鳥取県）— 松葉ガニ・水木しげるの聖地 ──────────────────────────
  {
    id: 'sakaiminato-crab-1',
    prefecture: '鳥取県', municipality: '境港市',
    name: '松葉ガニ（ズワイガニ雄） 1杯 約800g',
    category: '魚介類', minAmount: 20000, popular: true,
    description: '境港水揚げのブランドズワイガニ。タグ付き証明品。甘みと濃厚な味噌が絶品。',
    rakutenUrl: r('境港市', '松葉ガニ'),
    satofullUrl: s('境港市', '松葉ガニ'),
    choiceUrl:   c('境港市', '松葉ガニ'),
  },
  {
    id: 'sakaiminato-benizuwai-1',
    prefecture: '鳥取県', municipality: '境港市',
    name: '紅ズワイガニ 姿ゆで 3杯 計1.5kg',
    category: '魚介類', minAmount: 10000, popular: true,
    description: '甘みが強く身がぎっしり詰まった紅ズワイガニ。コスパ抜群。',
    rakutenUrl: r('境港市', '紅ズワイガニ'),
    choiceUrl:   c('境港市', '紅ズワイガニ'),
  },
  {
    id: 'sakaiminato-hamachi-1',
    prefecture: '鳥取県', municipality: '境港市',
    name: '境港産 ハマチ・ブリ 刺身用サク 500g（冷凍）',
    category: '魚介類', minAmount: 8000,
    description: '日本海の荒波で鍛えられた脂のりが良いブリ。刺身・照り焼きに。',
    rakutenUrl: r('境港市', 'ブリ'),
    choiceUrl:   c('境港市', 'ブリ'),
  },
  {
    id: 'sakaiminato-mizuki-1',
    prefecture: '鳥取県', municipality: '境港市',
    name: '水木しげる記念館 入館チケット（2名分）',
    category: '体験・旅行', minAmount: 10000,
    description: '鬼太郎の生みの親・水木しげるの出身地。妖怪ブロンズ像が立ち並ぶ聖地観光。',
    choiceUrl: c('境港市', '水木しげる 観光'),
  },
  {
    id: 'sakaiminato-nashi-1',
    prefecture: '鳥取県', municipality: '境港市',
    name: '鳥取産 二十世紀梨 秀品 約2.5kg（6〜8玉）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '鳥取が誇る甘くみずみずしい二十世紀梨。爽やかな清涼感が魅力。',
    rakutenUrl: r('境港市', '二十世紀梨'),
    choiceUrl:   c('境港市', '二十世紀梨'),
  },

  // ── 宇和島市（愛媛県）— 鯛・みかん・真珠の里 ───────────────────────────────
  {
    id: 'uwajima-tai-1',
    prefecture: '愛媛県', municipality: '宇和島市',
    name: '宇和島産 真鯛 鯛めしセット（出汁・タレ付き）2〜3人前',
    category: '魚介類', minAmount: 8000, popular: true,
    description: '漁獲量日本一の宇和島産真鯛。刺身を卵・タレに絡めて食べる宇和島鯛めし。',
    rakutenUrl: r('宇和島市', '鯛めし'),
    satofullUrl: s('宇和島市', '鯛めし'),
    choiceUrl:   c('宇和島市', '鯛めし'),
  },
  {
    id: 'uwajima-mikan-1',
    prefecture: '愛媛県', municipality: '宇和島市',
    name: '愛媛産 みかん 2kg・伊予柑 2kg セット',
    category: '野菜・果物', minAmount: 6000, popular: true,
    description: '南予の段々畑で育った太陽の恵みたっぷりのみかん・伊予柑詰め合わせ。',
    rakutenUrl: r('宇和島市', 'みかん'),
    choiceUrl:   c('宇和島市', 'みかん'),
  },
  {
    id: 'uwajima-pearl-1',
    prefecture: '愛媛県', municipality: '宇和島市',
    name: '宇和島産 アコヤ真珠 ネックレス（42cm）',
    category: '工芸品・アート', minAmount: 30000,
    description: '世界一の品質を誇る宇和島産アコヤ真珠。職人が丁寧に仕上げたネックレス。',
    rakutenUrl: r('宇和島市', '真珠 ネックレス'),
    choiceUrl:   c('宇和島市', '真珠'),
  },
  {
    id: 'uwajima-jakoten-1',
    prefecture: '愛媛県', municipality: '宇和島市',
    name: '宇和島名物 じゃこ天 10枚セット',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '宇和海の小魚をすり身にして揚げた南予の郷土料理。おつまみ・汁物に。',
    rakutenUrl: r('宇和島市', 'じゃこ天'),
    choiceUrl:   c('宇和島市', 'じゃこ天'),
  },
  {
    id: 'uwajima-uwajimajo-1',
    prefecture: '愛媛県', municipality: '宇和島市',
    name: '宇和島城・南予観光 体験プラン（2名）',
    category: '体験・旅行', minAmount: 20000,
    description: '現存12天守のひとつ宇和島城と闘牛体験、真珠養殖見学を楽しむ南予の旅。',
    choiceUrl: c('宇和島市', '観光 体験'),
  },

  // ── 京都市（京都府）— 1200年の文化・伝統工芸 ───────────────────────────────
  {
    id: 'kyoto-nishijin-1',
    prefecture: '京都府', municipality: '京都市',
    name: '西陣織 テーブルランナー 約180cm（正絹）',
    category: '工芸品・アート', minAmount: 20000, popular: true,
    description: '1200年以上続く伝統技術・西陣織。金糸・銀糸が織りなす格調高い卓上飾り。',
    rakutenUrl: r('京都市', '西陣織'),
    choiceUrl:   c('京都市', '西陣織'),
  },
  {
    id: 'kyoto-matcha-1',
    prefecture: '京都府', municipality: '京都市',
    name: '宇治抹茶 特選 缶入り 30g × 2本',
    category: '飲料・お酒', minAmount: 8000, popular: true,
    description: '茶の聖地・宇治の最高級抹茶。茶道・スイーツ・ラテに幅広く使える濃い抹茶。',
    rakutenUrl: r('京都市', '宇治抹茶'),
    satofullUrl: s('京都市', '抹茶'),
    choiceUrl:   c('京都市', '宇治抹茶'),
  },
  {
    id: 'kyoto-kyo-sweets-1',
    prefecture: '京都府', municipality: '京都市',
    name: '老舗の京菓子 詰め合わせ 8種（羊羹・干菓子・生菓子）',
    category: '乳製品・加工食品', minAmount: 8000,
    description: '創業100年以上の老舗が作る季節の上生菓子・羊羹・干菓子の豪華詰め合わせ。',
    rakutenUrl: r('京都市', '京菓子'),
    choiceUrl:   c('京都市', '京菓子'),
  },
  {
    id: 'kyoto-kiyomizu-1',
    prefecture: '京都府', municipality: '京都市',
    name: '京都 着物レンタル・茶道体験 ペアプラン',
    category: '体験・旅行', minAmount: 30000, popular: true,
    description: '祇園・清水寺周辺での着物散策と正式な茶道体験がセットになった京都文化体験。',
    rakutenUrl: r('京都市', '着物 体験'),
    choiceUrl:   c('京都市', '茶道 体験'),
  },
  {
    id: 'kyoto-kyo-yasai-1',
    prefecture: '京都府', municipality: '京都市',
    name: '京野菜 旬のセット（賀茂茄子・九条ねぎ など 5〜6種）',
    category: '野菜・果物', minAmount: 6000,
    description: '1000年以上継承されてきた伝統の京ブランド野菜。料亭御用達の希少品種。',
    rakutenUrl: r('京都市', '京野菜'),
    choiceUrl:   c('京都市', '京野菜'),
  },

  // ── 弘前市（青森県）— りんご日本一・津軽 ────────────────────────────────────
  {
    id: 'hirosaki-apple-1',
    prefecture: '青森県', municipality: '弘前市',
    name: '弘前産 サンふじりんご 特A 約3kg（8〜12玉）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '全国生産量1位・青森のりんご。蜜入り完熟サンふじは甘みが濃厚。',
    rakutenUrl: r('弘前市', 'サンふじ'),
    satofullUrl: s('弘前市', 'りんご'),
    choiceUrl:   c('弘前市', 'りんご'),
  },
  {
    id: 'hirosaki-apple-juice-1',
    prefecture: '青森県', municipality: '弘前市',
    name: '弘前産 りんごジュース ストレート 1L × 6本',
    category: '飲料・お酒', minAmount: 6000,
    description: '100%果汁のストレートりんごジュース。果肉感と自然な甘みが豊か。',
    rakutenUrl: r('弘前市', 'りんごジュース'),
    choiceUrl:   c('弘前市', 'りんごジュース'),
  },
  {
    id: 'hirosaki-beef-1',
    prefecture: '青森県', municipality: '弘前市',
    name: '青森県産 黒毛和牛 焼き肉用 400g',
    category: '肉類', minAmount: 8000,
    description: '津軽の冷涼な気候でじっくり育てた和牛。旨味と赤みのバランスが良い。',
    choiceUrl: c('弘前市', '黒毛和牛'),
  },
  {
    id: 'hirosaki-tsugaru-lacquer-1',
    prefecture: '青森県', municipality: '弘前市',
    name: '津軽塗 箸・箸置きセット',
    category: '工芸品・アート', minAmount: 8000,
    description: '40以上の工程を経て作られる津軽の伝統漆器。斑点模様が美しい実用品。',
    choiceUrl: c('弘前市', '津軽塗'),
  },

  // ── 二戸市（岩手県）— 南部鉄器・短角牛 ─────────────────────────────────────
  {
    id: 'ninohe-beef-1',
    prefecture: '岩手県', municipality: '二戸市',
    name: '岩手短角牛 赤身ステーキ 200g × 2枚',
    category: '肉類', minAmount: 10000, popular: true,
    description: '放牧で育てた赤身主体の希少な短角牛。赤みが濃く噛むほど旨味が広がる。',
    rakutenUrl: r('二戸市', '短角牛'),
    choiceUrl:   c('二戸市', '短角牛'),
  },
  {
    id: 'ninohe-nanbu-iron-1',
    prefecture: '岩手県', municipality: '二戸市',
    name: '南部鉄器 急須 0.5L（黒）',
    category: '工芸品・アート', minAmount: 10000,
    description: '400年の伝統を誇る南部鉄器。鉄分が溶け出しまろやかな味のお茶に。',
    rakutenUrl: r('二戸市', '南部鉄器'),
    choiceUrl:   c('二戸市', '南部鉄器'),
  },
  {
    id: 'ninohe-sake-1',
    prefecture: '岩手県', municipality: '二戸市',
    name: '南部美人 純米大吟醸 720ml',
    category: '飲料・お酒', minAmount: 8000,
    description: '国際大会受賞歴多数の二戸の地酒。華やかな香りとキレのある辛口。',
    rakutenUrl: r('二戸市', '南部美人'),
    choiceUrl:   c('二戸市', '南部美人'),
  },

  // ── 大仙市（秋田県）— 比内地鶏・きりたんぽ ─────────────────────────────────
  {
    id: 'daisen-chicken-1',
    prefecture: '秋田県', municipality: '大仙市',
    name: '比内地鶏 もも・むね・ガラセット 1.2kg',
    category: '肉類', minAmount: 8000, popular: true,
    description: '日本三大地鶏のひとつ。しっかりした歯ごたえと濃厚な旨味が特徴。',
    rakutenUrl: r('大仙市', '比内地鶏'),
    satofullUrl: s('大仙市', '比内地鶏'),
    choiceUrl:   c('大仙市', '比内地鶏'),
  },
  {
    id: 'daisen-kiritanpo-1',
    prefecture: '秋田県', municipality: '大仙市',
    name: 'きりたんぽ鍋 セット（2〜3人前）比内地鶏スープ付き',
    category: '乳製品・加工食品', minAmount: 6000,
    description: '秋田の郷土鍋。比内地鶏スープ・きりたんぽ・舞茸がセットで届く。',
    rakutenUrl: r('大仙市', 'きりたんぽ'),
    choiceUrl:   c('大仙市', 'きりたんぽ'),
  },
  {
    id: 'daisen-rice-1',
    prefecture: '秋田県', municipality: '大仙市',
    name: '秋田県産 あきたこまち 精米 10kg',
    category: '米・穀物', minAmount: 7000, popular: true,
    description: '日本を代表するブランド米・あきたこまち。粘りと甘みのバランスが秀逸。',
    rakutenUrl: r('大仙市', 'あきたこまち'),
    satofullUrl: s('大仙市', 'あきたこまち'),
    choiceUrl:   c('大仙市', 'あきたこまち'),
  },

  // ── 会津若松市（福島県）— 会津漆器・日本酒・桃 ──────────────────────────────
  {
    id: 'aizuwakamatsu-lacquer-1',
    prefecture: '福島県', municipality: '会津若松市',
    name: '会津塗 汁椀 ペアセット（朱・黒）',
    category: '工芸品・アート', minAmount: 10000, popular: true,
    description: '400年の伝統を誇る会津漆器。上品な艶と軽さで日常使いにも最適。',
    rakutenUrl: r('会津若松市', '会津塗'),
    choiceUrl:   c('会津若松市', '会津漆器'),
  },
  {
    id: 'aizuwakamatsu-sake-1',
    prefecture: '福島県', municipality: '会津若松市',
    name: '会津の地酒 純米大吟醸 飲み比べ 720ml × 3本',
    category: '飲料・お酒', minAmount: 12000,
    description: '全国新酒鑑評会で日本一の受賞数を誇る福島の地酒。会津の名蔵元3本セット。',
    rakutenUrl: r('会津若松市', '地酒'),
    choiceUrl:   c('会津若松市', '日本酒'),
  },
  {
    id: 'aizuwakamatsu-peach-1',
    prefecture: '福島県', municipality: '会津若松市',
    name: '福島産 桃 あかつき 秀品 2kg（5〜8玉）',
    category: '野菜・果物', minAmount: 6000,
    description: '全国一の生産量を誇る福島の桃。みずみずしい甘みと果汁が自慢。',
    rakutenUrl: r('会津若松市', '桃'),
    choiceUrl:   c('会津若松市', '桃'),
  },

  // ── 鉾田市（茨城県）— メロン・サツマイモ ────────────────────────────────────
  {
    id: 'hokota-melon-1',
    prefecture: '茨城県', municipality: '鉾田市',
    name: '茨城産 アンデスメロン 秀品 2玉（約1.6kg）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '全国1位の産地・茨城が誇る糖度15度以上の完熟メロン。芳醇な香り。',
    rakutenUrl: r('鉾田市', 'メロン'),
    satofullUrl: s('鉾田市', 'メロン'),
    choiceUrl:   c('鉾田市', 'メロン'),
  },
  {
    id: 'hokota-sweet-potato-1',
    prefecture: '茨城県', municipality: '鉾田市',
    name: '茨城産 紅はるか 干し芋 300g × 3袋',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '甘みが凝縮した茨城産紅はるかの干し芋。とろける食感と上品な甘さ。',
    rakutenUrl: r('鉾田市', '干し芋'),
    choiceUrl:   c('鉾田市', '干し芋'),
  },
  {
    id: 'hokota-beef-1',
    prefecture: '茨城県', municipality: '鉾田市',
    name: '常陸牛 肩ロース すき焼き用 300g',
    category: '肉類', minAmount: 8000,
    description: '黒毛和牛の銘柄「常陸牛」。きめ細かな霜降りと芳醇な旨味。',
    choiceUrl: c('鉾田市', '常陸牛'),
  },

  // ── 那須塩原市（栃木県）— 那須高原の乳製品・苺 ──────────────────────────────
  {
    id: 'nasushiobara-dairy-1',
    prefecture: '栃木県', municipality: '那須塩原市',
    name: '那須高原 生クリーム・バターセット',
    category: '乳製品・加工食品', minAmount: 6000, popular: true,
    description: '那須高原の牧草で育てた乳牛の濃厚な生クリームとバターのセット。',
    rakutenUrl: r('那須塩原市', '那須高原 バター'),
    choiceUrl:   c('那須塩原市', '乳製品'),
  },
  {
    id: 'nasushiobara-strawberry-1',
    prefecture: '栃木県', municipality: '那須塩原市',
    name: '栃木産 とちおとめ 2パック（約500g）',
    category: '野菜・果物', minAmount: 5000,
    description: '全国1位の産地・栃木の苺「とちおとめ」。大粒で甘みが強く酸味は控えめ。',
    rakutenUrl: r('那須塩原市', 'とちおとめ'),
    choiceUrl:   c('那須塩原市', 'いちご'),
  },
  {
    id: 'nasushiobara-wagyu-1',
    prefecture: '栃木県', municipality: '那須塩原市',
    name: 'とちぎ和牛 ロース しゃぶしゃぶ用 400g',
    category: '肉類', minAmount: 10000,
    description: '厳しい認定基準をクリアした栃木のブランド和牛。柔らかで脂のりが絶妙。',
    rakutenUrl: r('那須塩原市', 'とちぎ和牛'),
    choiceUrl:   c('那須塩原市', 'とちぎ和牛'),
  },

  // ── 嬬恋村（群馬県）— 高原キャベツ・浅間山麓野菜 ───────────────────────────
  {
    id: 'tsumagoi-cabbage-1',
    prefecture: '群馬県', municipality: '嬬恋村',
    name: '嬬恋高原キャベツ 約10kg（5〜6玉）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '全国シェア4割・標高1000m超の冷涼な高原で育てた甘くて柔らかいキャベツ。',
    rakutenUrl: r('嬬恋村', 'キャベツ'),
    satofullUrl: s('嬬恋村', 'キャベツ'),
    choiceUrl:   c('嬬恋村', 'キャベツ'),
  },
  {
    id: 'tsumagoi-vegetable-set-1',
    prefecture: '群馬県', municipality: '嬬恋村',
    name: '嬬恋村 高原野菜セット 旬の6種（約4kg）',
    category: '野菜・果物', minAmount: 5000,
    description: '浅間山の火山灰土が育む高原野菜。じゃがいも・レタス・とうもろこし等。',
    choiceUrl: c('嬬恋村', '高原野菜'),
  },
  {
    id: 'tsumagoi-pork-1',
    prefecture: '群馬県', municipality: '嬬恋村',
    name: '上州麦豚 しゃぶしゃぶ用 500g',
    category: '肉類', minAmount: 6000,
    description: '麦を食べて育てた上州の豚。脂が甘く臭みが少ないブランド豚。',
    choiceUrl: c('嬬恋村', '上州豚'),
  },

  // ── 秩父市（埼玉県）— ウィスキー・わらじかつ ────────────────────────────────
  {
    id: 'chichibu-whisky-1',
    prefecture: '埼玉県', municipality: '秩父市',
    name: 'イチローズモルト ホワイトラベル 700ml',
    category: '飲料・お酒', minAmount: 15000, popular: true,
    description: '世界が注目する秩父蒸溜所のジャパニーズウィスキー。国際賞受賞の逸品。',
    rakutenUrl: r('秩父市', 'イチローズモルト'),
    choiceUrl:   c('秩父市', 'イチローズモルト'),
  },
  {
    id: 'chichibu-pork-1',
    prefecture: '埼玉県', municipality: '秩父市',
    name: '秩父名物 わらじかつ丼 冷凍セット 2食分',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '草鞋のように大きな秩父名物のカツ丼。甘辛タレがご飯に合う郷土料理。',
    rakutenUrl: r('秩父市', 'わらじかつ'),
    choiceUrl:   c('秩父市', 'わらじかつ'),
  },
  {
    id: 'chichibu-ham-1',
    prefecture: '埼玉県', municipality: '秩父市',
    name: '秩父ハム 詰め合わせセット（ベーコン・ソーセージ）',
    category: '乳製品・加工食品', minAmount: 6000,
    description: '秩父の老舗が作る無添加ハム・ベーコン。自然の甘みと燻製香が上品。',
    choiceUrl: c('秩父市', '秩父ハム'),
  },

  // ── いすみ市（千葉県）— 自然栽培米・クラフトビール ──────────────────────────
  {
    id: 'isumi-rice-1',
    prefecture: '千葉県', municipality: 'いすみ市',
    name: 'いすみ産 自然栽培コシヒカリ 精米 5kg',
    category: '米・穀物', minAmount: 8000, popular: true,
    description: '農薬・化学肥料不使用で育てた希少な自然栽培米。素朴な甘みと旨味。',
    rakutenUrl: r('いすみ市', '自然栽培 米'),
    choiceUrl:   c('いすみ市', 'コシヒカリ'),
  },
  {
    id: 'isumi-craft-beer-1',
    prefecture: '千葉県', municipality: 'いすみ市',
    name: 'いすみビール クラフトビール 330ml × 6本',
    category: '飲料・お酒', minAmount: 6000,
    description: '房総の食材を使ったローカルクラフトビール。ペールエール・スタウトなど6種。',
    rakutenUrl: r('いすみ市', 'クラフトビール'),
    choiceUrl:   c('いすみ市', 'クラフトビール'),
  },
  {
    id: 'isumi-seafood-1',
    prefecture: '千葉県', municipality: 'いすみ市',
    name: '房総 伊勢えび・あわび セット（冷凍）',
    category: '魚介類', minAmount: 12000,
    description: '外房の荒波が育んだ伊勢えびとアワビの贅沢セット。刺身・焼きで。',
    choiceUrl: c('いすみ市', '伊勢えび'),
  },

  // ── 八丈島（東京都）— くさや・明日葉・焼酎 ─────────────────────────────────
  {
    id: 'hachijojima-shochu-1',
    prefecture: '東京都', municipality: '八丈町',
    name: '八丈島 芋焼酎 島のナポレオン 720ml',
    category: '飲料・お酒', minAmount: 5000, popular: true,
    description: '火山島・八丈島の伝統焼酎「島のナポレオン」。独特の香りと力強い味。',
    rakutenUrl: r('八丈町', '八丈島 焼酎'),
    choiceUrl:   c('八丈町', '八丈島 焼酎'),
  },
  {
    id: 'hachijojima-kusaya-1',
    prefecture: '東京都', municipality: '八丈町',
    name: '八丈島 くさや 真空パック 100g × 3枚',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '一度食べたら忘れられない伝統発酵食品。独特の風味と濃厚な旨味が病みつきに。',
    choiceUrl: c('八丈町', 'くさや'),
  },
  {
    id: 'hachijojima-ashitaba-1',
    prefecture: '東京都', municipality: '八丈町',
    name: '八丈島産 明日葉 青汁・乾燥パウダー セット',
    category: '野菜・果物', minAmount: 5000,
    description: '八丈島原産のスーパーフード・明日葉。豊富なカルコンとビタミンが特徴。',
    choiceUrl: c('八丈町', '明日葉'),
  },

  // ── 小田原市（神奈川県）— かまぼこ・干物 ────────────────────────────────────
  {
    id: 'odawara-kamaboko-1',
    prefecture: '神奈川県', municipality: '小田原市',
    name: '小田原 鈴廣 かまぼこ 詰め合わせセット',
    category: '乳製品・加工食品', minAmount: 6000, popular: true,
    description: '江戸時代から続く老舗「鈴廣」の蒲鉾。相模湾の新鮮な魚で作る上質な味。',
    rakutenUrl: r('小田原市', '鈴廣 かまぼこ'),
    choiceUrl:   c('小田原市', 'かまぼこ'),
  },
  {
    id: 'odawara-himono-1',
    prefecture: '神奈川県', municipality: '小田原市',
    name: '相模湾産 干物 詰め合わせ 12枚（あじ・さば・いわし）',
    category: '魚介類', minAmount: 5000,
    description: '潮風と太陽で仕上げた小田原伝統の干物。シンプルな塩干しで素材の旨味が際立つ。',
    rakutenUrl: r('小田原市', '干物'),
    choiceUrl:   c('小田原市', '干物'),
  },
  {
    id: 'odawara-ume-1',
    prefecture: '神奈川県', municipality: '小田原市',
    name: '小田原産 梅干し 白干し・はちみつ梅 2種セット 各100g',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '北条氏の時代から続く小田原梅。塩だけで漬けた昔ながらの梅干し。',
    choiceUrl: c('小田原市', '梅干し'),
  },

  // ── 氷見市（富山県）— 氷見ブリ・白えび ─────────────────────────────────────
  {
    id: 'himi-buri-1',
    prefecture: '富山県', municipality: '氷見市',
    name: '氷見寒ブリ 刺身用サク 400g（冷凍）',
    category: '魚介類', minAmount: 12000, popular: true,
    description: '日本海の荒波と豊富なエサで育つ天然ブリ。脂のりが格別の冬の最高峰。',
    rakutenUrl: r('氷見市', '氷見ブリ'),
    satofullUrl: s('氷見市', 'ブリ'),
    choiceUrl:   c('氷見市', '氷見ブリ'),
  },
  {
    id: 'himi-shiroebi-1',
    prefecture: '富山県', municipality: '氷見市',
    name: '富山湾産 白えび 刺身用 150g（冷凍）',
    category: '魚介類', minAmount: 8000, popular: true,
    description: '「富山湾の宝石」と呼ばれる希少な白えび。甘みが強く口の中でとろける。',
    rakutenUrl: r('氷見市', '白えび'),
    choiceUrl:   c('氷見市', '白えび'),
  },
  {
    id: 'himi-kanikama-1',
    prefecture: '富山県', municipality: '氷見市',
    name: '氷見うどん 手延べ 500g × 3束',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '富山の三大うどんのひとつ。細くてコシのある手延べ麺。にゅうめんにも。',
    choiceUrl: c('氷見市', '氷見うどん'),
  },

  // ── 越前市（福井県）— 越前がに・越前そば ────────────────────────────────────
  {
    id: 'echizen-crab-1',
    prefecture: '福井県', municipality: '越前市',
    name: '越前がに（ズワイガニ雄） タグ付き 1杯 約800g',
    category: '魚介類', minAmount: 20000, popular: true,
    description: '日本海のブランドガニ・越前がに。黄色いタグが品質の証明。濃厚な旨味。',
    rakutenUrl: r('越前市', '越前がに'),
    satofullUrl: s('越前市', '越前がに'),
    choiceUrl:   c('越前市', '越前がに'),
  },
  {
    id: 'echizen-soba-1',
    prefecture: '福井県', municipality: '越前市',
    name: '越前おろしそば 乾麺 400g × 3袋（だいこん付き）',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '全国区の名物・越前そば。大根おろしをたっぷりのせた辛口のぶっかけスタイル。',
    rakutenUrl: r('越前市', '越前そば'),
    choiceUrl:   c('越前市', '越前そば'),
  },
  {
    id: 'echizen-washi-1',
    prefecture: '福井県', municipality: '越前市',
    name: '越前和紙 文具セット（便箋・封筒・はがき）',
    category: '工芸品・アート', minAmount: 6000,
    description: '1500年の歴史を持つ日本最古の和紙のひとつ。独特の風合いと丈夫さが特徴。',
    choiceUrl: c('越前市', '越前和紙'),
  },

  // ── 笛吹市（山梨県）— 桃・ぶどう・ワイン ────────────────────────────────────
  {
    id: 'fuefuki-peach-1',
    prefecture: '山梨県', municipality: '笛吹市',
    name: '笛吹産 白鳳桃 秀品 約2.5kg（6〜10玉）',
    category: '野菜・果物', minAmount: 6000, popular: true,
    description: '全国1位の産地・山梨の桃。甘みが強くジューシーな果汁が特徴。',
    rakutenUrl: r('笛吹市', '桃'),
    satofullUrl: s('笛吹市', '桃'),
    choiceUrl:   c('笛吹市', '桃'),
  },
  {
    id: 'fuefuki-wine-1',
    prefecture: '山梨県', municipality: '笛吹市',
    name: '甲州ワイン 白・赤 飲み比べ 750ml × 2本',
    category: '飲料・お酒', minAmount: 8000, popular: true,
    description: '日本固有品種「甲州」と「マスカット・ベーリーA」を使った国産ワイン。',
    rakutenUrl: r('笛吹市', '甲州ワイン'),
    choiceUrl:   c('笛吹市', '甲州ワイン'),
  },
  {
    id: 'fuefuki-grape-1',
    prefecture: '山梨県', municipality: '笛吹市',
    name: 'シャインマスカット 秀品 2房（約800g）',
    category: '野菜・果物', minAmount: 8000,
    description: '大粒で種なし・皮ごと食べられる高級ぶどう。糖度18度以上のフルーティな甘み。',
    rakutenUrl: r('笛吹市', 'シャインマスカット'),
    choiceUrl:   c('笛吹市', 'シャインマスカット'),
  },

  // ── 飯山市（長野県）— 信州サーモン・野沢菜 ─────────────────────────────────
  {
    id: 'iiyama-salmon-1',
    prefecture: '長野県', municipality: '飯山市',
    name: '信州サーモン 刺身用フィレ 約400g（冷凍）',
    category: '魚介類', minAmount: 6000, popular: true,
    description: '長野県が独自開発した内陸の鮭。臭みがなく脂のりが良いサーモン。',
    rakutenUrl: r('飯山市', '信州サーモン'),
    choiceUrl:   c('飯山市', '信州サーモン'),
  },
  {
    id: 'iiyama-nozawana-1',
    prefecture: '長野県', municipality: '飯山市',
    name: '野沢温泉産 野沢菜漬け 500g × 3袋',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '信州の郷土漬物。シャキシャキした食感と塩気が白米に合う定番の一品。',
    rakutenUrl: r('飯山市', '野沢菜'),
    choiceUrl:   c('飯山市', '野沢菜'),
  },
  {
    id: 'iiyama-apple-1',
    prefecture: '長野県', municipality: '飯山市',
    name: '長野産 ふじりんご 約3kg（8〜10玉）',
    category: '野菜・果物', minAmount: 5000,
    description: '全国2位の産地・長野のりんご。蜜がたっぷり入った甘みの強い品種。',
    rakutenUrl: r('飯山市', 'りんご'),
    choiceUrl:   c('飯山市', 'りんご'),
  },

  // ── 飛騨市（岐阜県）— 飛騨牛・朴葉味噌 ─────────────────────────────────────
  {
    id: 'hida-beef-1',
    prefecture: '岐阜県', municipality: '飛騨市',
    name: '飛騨牛 A5等級 ロース すき焼き用 300g',
    category: '肉類', minAmount: 15000, popular: true,
    description: 'ブランド和牛のトップクラス・飛騨牛A5。口の中でとろける霜降りが絶品。',
    rakutenUrl: r('飛騨市', '飛騨牛'),
    satofullUrl: s('飛騨市', '飛騨牛'),
    choiceUrl:   c('飛騨市', '飛騨牛'),
  },
  {
    id: 'hida-hoba-miso-1',
    prefecture: '岐阜県', municipality: '飛騨市',
    name: '飛騨 朴葉味噌 セット（味噌・乾燥朴葉付き）',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '朴葉の上で味噌を焼く飛騨の郷土料理。香ばしい朴葉の香りと甘辛味噌。',
    choiceUrl: c('飛騨市', '朴葉味噌'),
  },
  {
    id: 'hida-sake-1',
    prefecture: '岐阜県', municipality: '飛騨市',
    name: '飛騨の地酒 純米吟醸 720ml × 2本',
    category: '飲料・お酒', minAmount: 8000,
    description: '北アルプスの清冽な雪解け水で仕込む飛騨の清酒。冷やしても燗でも旨い。',
    rakutenUrl: r('飛騨市', '飛騨 地酒'),
    choiceUrl:   c('飛騨市', '飛騨 日本酒'),
  },

  // ── 焼津市（静岡県）— マグロ・桜えび・わさび ───────────────────────────────
  {
    id: 'yaizu-tuna-1',
    prefecture: '静岡県', municipality: '焼津市',
    name: '遠洋マグロ 赤身・中トロ 食べ比べ 約500g（冷凍）',
    category: '魚介類', minAmount: 10000, popular: true,
    description: '日本最大の水揚げ港・焼津のマグロ。遠洋一本釣りの品質。',
    rakutenUrl: r('焼津市', 'マグロ'),
    satofullUrl: s('焼津市', 'マグロ'),
    choiceUrl:   c('焼津市', 'マグロ'),
  },
  {
    id: 'yaizu-sakuraebi-1',
    prefecture: '静岡県', municipality: '焼津市',
    name: '由比産 桜えび 素干し 40g × 3袋',
    category: '魚介類', minAmount: 6000, popular: true,
    description: '世界でも駿河湾でしか獲れない桜えび。かき揚げ・ちらし寿司・お茶漬けに。',
    rakutenUrl: r('焼津市', '桜えび'),
    choiceUrl:   c('焼津市', '桜えび'),
  },
  {
    id: 'yaizu-wasabi-1',
    prefecture: '静岡県', municipality: '焼津市',
    name: '静岡産 本わさび チューブ 2本セット（各43g）',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '本場・静岡の清流で育てた天然わさび100%。辛みと香りが市販品とは別格。',
    choiceUrl: c('焼津市', '本わさび'),
  },

  // ── 豊田市（愛知県）— 三河牛・農産物 ───────────────────────────────────────
  {
    id: 'toyota-beef-1',
    prefecture: '愛知県', municipality: '豊田市',
    name: '三河牛 ロース すき焼き用 300g',
    category: '肉類', minAmount: 10000, popular: true,
    description: '愛知が誇るブランド和牛「三河牛」。柔らかな肉質と甘みのある旨味。',
    rakutenUrl: r('豊田市', '三河牛'),
    choiceUrl:   c('豊田市', '三河牛'),
  },
  {
    id: 'toyota-chicken-1',
    prefecture: '愛知県', municipality: '豊田市',
    name: '名古屋コーチン もも・むね肉セット 1kg',
    category: '肉類', minAmount: 8000, popular: true,
    description: '日本三大地鶏のひとつ。コリコリした食感と凝縮した旨味が特徴。',
    rakutenUrl: r('豊田市', '名古屋コーチン'),
    choiceUrl:   c('豊田市', '名古屋コーチン'),
  },
  {
    id: 'toyota-miso-1',
    prefecture: '愛知県', municipality: '豊田市',
    name: '愛知 八丁味噌 詰め合わせ（赤味噌・赤だし）各500g',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '2年以上熟成させた愛知の伝統味噌。濃厚な旨味とコクが料理に深みを与える。',
    rakutenUrl: r('豊田市', '八丁味噌'),
    choiceUrl:   c('豊田市', '八丁味噌'),
  },

  // ── 長浜市（滋賀県）— 近江牛・琵琶湖の恵み ─────────────────────────────────
  {
    id: 'nagahama-beef-1',
    prefecture: '滋賀県', municipality: '長浜市',
    name: '近江牛 肩ロース すき焼き用 300g',
    category: '肉類', minAmount: 12000, popular: true,
    description: '日本三大和牛のひとつ。柔らかな肉質と適度な霜降りのバランスが最高。',
    rakutenUrl: r('長浜市', '近江牛'),
    satofullUrl: s('長浜市', '近江牛'),
    choiceUrl:   c('長浜市', '近江牛'),
  },
  {
    id: 'nagahama-funa-sushi-1',
    prefecture: '滋賀県', municipality: '長浜市',
    name: '琵琶湖産 鮒寿司（ふなずし） 半身入り',
    category: '乳製品・加工食品', minAmount: 8000,
    description: '琵琶湖固有種「ニゴロブナ」を使った発酵食品。1000年以上続く滋賀の宝。',
    choiceUrl: c('長浜市', '鮒寿司'),
  },
  {
    id: 'nagahama-sake-1',
    prefecture: '滋賀県', municipality: '長浜市',
    name: '長浜の地酒 純米吟醸 飲み比べ 720ml × 2本',
    category: '飲料・お酒', minAmount: 8000,
    description: '琵琶湖の伏流水で仕込む滋賀の地酒。清涼感ある淡麗辛口スタイル。',
    choiceUrl: c('長浜市', '滋賀 地酒'),
  },

  // ── 泉佐野市（大阪府）— 全国トップ級の寄付額 ──────────────────────────────
  {
    id: 'izumisano-crab-1',
    prefecture: '大阪府', municipality: '泉佐野市',
    name: 'ズワイガニ 姿ゆで 3杯（計約1.2kg）',
    category: '魚介類', minAmount: 10000, popular: true,
    description: '寄付金額全国最多常連・泉佐野のふるさと納税。プロが選んだ最高品のズワイガニ。',
    rakutenUrl: r('泉佐野市', 'ズワイガニ'),
    satofullUrl: s('泉佐野市', 'カニ'),
    choiceUrl:   c('泉佐野市', 'カニ'),
  },
  {
    id: 'izumisano-wagyu-1',
    prefecture: '大阪府', municipality: '泉佐野市',
    name: '和牛 切り落とし 500g',
    category: '肉類', minAmount: 8000,
    description: 'コスパ最強と話題の泉佐野市のふるさと納税。黒毛和牛の旨味が詰まった切り落とし。',
    rakutenUrl: r('泉佐野市', '和牛'),
    choiceUrl:   c('泉佐野市', '和牛'),
  },
  {
    id: 'izumisano-rice-1',
    prefecture: '大阪府', municipality: '泉佐野市',
    name: '選べるお米 10kg（コシヒカリ・ひとめぼれ等）',
    category: '米・穀物', minAmount: 7000,
    description: '全国の銘柄米から選べる人気セット。毎年リピーターが続出するコスパ返礼品。',
    rakutenUrl: r('泉佐野市', 'お米'),
    choiceUrl:   c('泉佐野市', 'お米'),
  },

  // ── 豊岡市（兵庫県）— 但馬牛・コウノトリ米 ─────────────────────────────────
  {
    id: 'toyooka-beef-1',
    prefecture: '兵庫県', municipality: '豊岡市',
    name: '但馬牛 特選ロース しゃぶしゃぶ用 300g',
    category: '肉類', minAmount: 15000, popular: true,
    description: '神戸牛・松阪牛のルーツである但馬牛。きめ細かな霜降りと上品な甘みの旨味。',
    rakutenUrl: r('豊岡市', '但馬牛'),
    choiceUrl:   c('豊岡市', '但馬牛'),
  },
  {
    id: 'toyooka-rice-1',
    prefecture: '兵庫県', municipality: '豊岡市',
    name: 'コウノトリ育む農法 但馬産コシヒカリ 5kg',
    category: '米・穀物', minAmount: 6000, popular: true,
    description: '農薬を極限まで抑えてコウノトリの生息を守る特別栽培米。安心・安全のお米。',
    rakutenUrl: r('豊岡市', 'コウノトリ米'),
    choiceUrl:   c('豊岡市', 'コウノトリ米'),
  },
  {
    id: 'toyooka-crab-1',
    prefecture: '兵庫県', municipality: '豊岡市',
    name: '松葉ガニ（ズワイガニ）タグ付き 1杯 約700g',
    category: '魚介類', minAmount: 15000,
    description: '兵庫・但馬漁港が誇るブランドズワイガニ。黄色タグが品質証明。',
    rakutenUrl: r('豊岡市', '松葉ガニ'),
    choiceUrl:   c('豊岡市', '松葉ガニ'),
  },

  // ── 五條市（奈良県）— 柿・大和牛・吉野葛 ───────────────────────────────────
  {
    id: 'gojo-kaki-1',
    prefecture: '奈良県', municipality: '五條市',
    name: '奈良産 富有柿 秀品 2kg（6〜10玉）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '全国2位の産地・奈良の柿。甘みが強く種なしで食べやすいブランド柿。',
    rakutenUrl: r('五條市', '富有柿'),
    choiceUrl:   c('五條市', '柿'),
  },
  {
    id: 'gojo-beef-1',
    prefecture: '奈良県', municipality: '五條市',
    name: '大和牛 焼き肉用 300g',
    category: '肉類', minAmount: 8000,
    description: '奈良の豊かな自然で育てた大和牛。赤みが主体で噛むほどに旨みが広がる。',
    choiceUrl: c('五條市', '大和牛'),
  },
  {
    id: 'gojo-kuzu-1',
    prefecture: '奈良県', municipality: '五條市',
    name: '吉野本葛 詰め合わせ（葛粉・葛湯・葛菓子）',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '吉野山の葛根から取る天然の本葛。とろとろの葛湯と上品な葛菓子セット。',
    choiceUrl: c('五條市', '吉野葛'),
  },

  // ── 邑南町（島根県）— のどぐろ・中山間地牛 ─────────────────────────────────
  {
    id: 'ohnan-nodoguro-1',
    prefecture: '島根県', municipality: '邑南町',
    name: '島根産 のどぐろ 姿干し 2尾（冷凍）',
    category: '魚介類', minAmount: 10000, popular: true,
    description: '「白身のトロ」と称される高級魚のどぐろ。脂のりが抜群で塩焼きが絶品。',
    rakutenUrl: r('邑南町', 'のどぐろ'),
    choiceUrl:   c('邑南町', 'のどぐろ'),
  },
  {
    id: 'ohnan-beef-1',
    prefecture: '島根県', municipality: '邑南町',
    name: '邑南産 石見和牛 焼き肉用 300g',
    category: '肉類', minAmount: 8000,
    description: '豊かな山間で育てた石見和牛。草原の風味が感じられる赤身が主体の旨み。',
    choiceUrl: c('邑南町', '石見和牛'),
  },
  {
    id: 'ohnan-shijimi-1',
    prefecture: '島根県', municipality: '邑南町',
    name: '宍道湖産 大和しじみ 冷凍 500g',
    category: '魚介類', minAmount: 5000,
    description: '日本一の生産量を誇る宍道湖のしじみ。旨味成分が豊富でコクのある味噌汁に。',
    rakutenUrl: r('邑南町', '宍道湖 しじみ'),
    choiceUrl:   c('邑南町', 'しじみ'),
  },

  // ── 備前市（岡山県）— 備前焼・桃太郎トマト ─────────────────────────────────
  {
    id: 'bizen-pottery-1',
    prefecture: '岡山県', municipality: '備前市',
    name: '備前焼 ぐい呑み 2客セット',
    category: '工芸品・アート', minAmount: 10000, popular: true,
    description: '釉薬を使わない焼締めで1000年以上続く名陶・備前焼。独特の渋みある風合い。',
    rakutenUrl: r('備前市', '備前焼'),
    choiceUrl:   c('備前市', '備前焼'),
  },
  {
    id: 'bizen-tomato-1',
    prefecture: '岡山県', municipality: '備前市',
    name: '桃太郎トマト 約2kg（約12〜16個）',
    category: '野菜・果物', minAmount: 5000,
    description: '糖度8度以上の高品質ブランドトマト。果肉が厚く甘みと酸味のバランスが絶妙。',
    rakutenUrl: r('備前市', '桃太郎トマト'),
    choiceUrl:   c('備前市', 'トマト'),
  },
  {
    id: 'bizen-grape-1',
    prefecture: '岡山県', municipality: '備前市',
    name: 'マスカット・オブ・アレキサンドリア 1房（約500g）',
    category: '野菜・果物', minAmount: 8000,
    description: '「ぶどうの女王」と呼ばれる高級品種。岡山が誇る独特の高貴な香りと甘み。',
    rakutenUrl: r('備前市', 'マスカット'),
    choiceUrl:   c('備前市', 'マスカット'),
  },

  // ── 呉市（広島県）— 牡蠣・広島レモン ──────────────────────────────────────
  {
    id: 'kure-oyster-1',
    prefecture: '広島県', municipality: '呉市',
    name: '広島産 牡蠣 むき身 1kg（冷凍）',
    category: '魚介類', minAmount: 7000, popular: true,
    description: '全国生産1位の広島牡蠣。豊かな海のミルクで育った大粒でふっくらした旨み。',
    rakutenUrl: r('呉市', '広島 牡蠣'),
    satofullUrl: s('呉市', '牡蠣'),
    choiceUrl:   c('呉市', '広島 牡蠣'),
  },
  {
    id: 'kure-lemon-1',
    prefecture: '広島県', municipality: '呉市',
    name: '広島レモン 国産 2kg（ノーワックス）',
    category: '野菜・果物', minAmount: 5000, popular: true,
    description: '国産レモン生産1位・広島の瀬戸内レモン。皮ごと使える安心のノーワックス。',
    rakutenUrl: r('呉市', '広島レモン'),
    choiceUrl:   c('呉市', '広島レモン'),
  },
  {
    id: 'kure-sake-1',
    prefecture: '広島県', municipality: '呉市',
    name: '広島 銘酒 純米吟醸 飲み比べ 720ml × 2本',
    category: '飲料・お酒', minAmount: 8000,
    description: '軟水醸造の技術で醸す広島の地酒。穏やかな香りと滑らかな口当たり。',
    rakutenUrl: r('呉市', '広島 地酒'),
    choiceUrl:   c('呉市', '広島 日本酒'),
  },

  // ── 下関市（山口県）— ふく刺し・うに ────────────────────────────────────────
  {
    id: 'shimonoseki-fugu-1',
    prefecture: '山口県', municipality: '下関市',
    name: '下関産 とらふく刺身セット 2〜3人前（冷凍）',
    category: '魚介類', minAmount: 15000, popular: true,
    description: '「ふくの本場」下関産のとらふぐ。薄造りの美しさと上品な甘みが絶品。',
    rakutenUrl: r('下関市', 'ふぐ刺身'),
    satofullUrl: s('下関市', 'ふぐ'),
    choiceUrl:   c('下関市', 'ふぐ'),
  },
  {
    id: 'shimonoseki-uni-1',
    prefecture: '山口県', municipality: '下関市',
    name: '響灘産 生うに（バフンウニ） 板雲丹 100g',
    category: '魚介類', minAmount: 10000,
    description: '日本海・響灘の荒波で育った濃厚なバフンウニ。甘みとコクが格別。',
    rakutenUrl: r('下関市', 'うに'),
    choiceUrl:   c('下関市', 'うに'),
  },
  {
    id: 'shimonoseki-hagi-sake-1',
    prefecture: '山口県', municipality: '下関市',
    name: '山口 地酒 純米大吟醸 獺祭（だっさい） 720ml',
    category: '飲料・お酒', minAmount: 10000, popular: true,
    description: '世界的に人気の山口が誇るブランド日本酒。磨き三割九分の洗練された味。',
    rakutenUrl: r('下関市', '獺祭'),
    choiceUrl:   c('下関市', '獺祭'),
  },

  // ── 阿波市（徳島県）— 阿波尾鶏・すだち・なると金時 ─────────────────────────
  {
    id: 'awa-chicken-1',
    prefecture: '徳島県', municipality: '阿波市',
    name: '阿波尾鶏 もも・むね・手羽元 セット 1.2kg',
    category: '肉類', minAmount: 7000, popular: true,
    description: '全国地鶏生産1位・徳島のブランド地鶏「阿波尾鶏」。肉質が引き締まり旨味が濃い。',
    rakutenUrl: r('阿波市', '阿波尾鶏'),
    satofullUrl: s('阿波市', '阿波尾鶏'),
    choiceUrl:   c('阿波市', '阿波尾鶏'),
  },
  {
    id: 'awa-sudachi-1',
    prefecture: '徳島県', municipality: '阿波市',
    name: '徳島産 すだち 秀品 約1kg（約30〜35個）',
    category: '野菜・果物', minAmount: 4000,
    description: '全国生産の98%を占める徳島のすだち。爽やかな香りと酸味が魚料理・鍋に最高。',
    rakutenUrl: r('阿波市', 'すだち'),
    choiceUrl:   c('阿波市', 'すだち'),
  },
  {
    id: 'awa-sweet-potato-1',
    prefecture: '徳島県', municipality: '阿波市',
    name: '鳴門金時 さつまいも 約2kg',
    category: '野菜・果物', minAmount: 4000,
    description: '「なると金時」の名で知られる鳴門産のさつまいも。ホクホク食感と上品な甘み。',
    rakutenUrl: r('阿波市', 'なると金時'),
    choiceUrl:   c('阿波市', 'なると金時'),
  },

  // ── 三豊市（香川県）— 讃岐うどん・オリーブ ─────────────────────────────────
  {
    id: 'mitoyo-udon-1',
    prefecture: '香川県', municipality: '三豊市',
    name: '讃岐うどん 半生 400g × 5袋（出汁付き）',
    category: '乳製品・加工食品', minAmount: 5000, popular: true,
    description: '日本一の産地・香川のもちもちコシある讃岐うどん。本場の出汁付きセット。',
    rakutenUrl: r('三豊市', '讃岐うどん'),
    satofullUrl: s('三豊市', 'うどん'),
    choiceUrl:   c('三豊市', '讃岐うどん'),
  },
  {
    id: 'mitoyo-olive-1',
    prefecture: '香川県', municipality: '三豊市',
    name: '小豆島産 エクストラバージンオリーブオイル 180ml × 2本',
    category: '乳製品・加工食品', minAmount: 8000, popular: true,
    description: '国産オリーブの9割を産する小豆島。早摘みフレッシュオリーブの最高品質オイル。',
    rakutenUrl: r('三豊市', '小豆島 オリーブオイル'),
    choiceUrl:   c('三豊市', 'オリーブオイル'),
  },
  {
    id: 'mitoyo-somen-1',
    prefecture: '香川県', municipality: '三豊市',
    name: '小豆島手延べ素麺 200g × 6束（化粧箱入り）',
    category: '乳製品・加工食品', minAmount: 4000,
    description: '三大素麺のひとつ・小豆島そうめん。オリーブオイルを使った細くてつるつるの麺。',
    choiceUrl: c('三豊市', '小豆島 素麺'),
  },

  // ── 室戸市（高知県）— かつお・ゆず・土佐牛 ─────────────────────────────────
  {
    id: 'muroto-katsuo-1',
    prefecture: '高知県', municipality: '室戸市',
    name: '土佐 藁焼きかつおのたたき 約600g（冷凍）',
    category: '魚介類', minAmount: 7000, popular: true,
    description: '高知伝統の藁直火焼き。皮目の香ばしさと新鮮なかつおの旨みが絶品。',
    rakutenUrl: r('室戸市', 'かつおのたたき'),
    satofullUrl: s('室戸市', 'かつお'),
    choiceUrl:   c('室戸市', 'かつおのたたき'),
  },
  {
    id: 'muroto-yuzu-1',
    prefecture: '高知県', municipality: '室戸市',
    name: '高知産 ゆず 搾り汁 200ml × 3本',
    category: '飲料・お酒', minAmount: 5000, popular: true,
    description: '全国1位の産地・高知のゆず果汁。爽やかな香りと酸味で鍋・ポン酢・ドレッシングに。',
    rakutenUrl: r('室戸市', 'ゆず 果汁'),
    choiceUrl:   c('室戸市', 'ゆず'),
  },
  {
    id: 'muroto-beef-1',
    prefecture: '高知県', municipality: '室戸市',
    name: '土佐和牛 焼き肉用 400g',
    category: '肉類', minAmount: 8000,
    description: '土佐の自然の中でのびのびと育てた和牛。赤身が豊富で旨みが強い。',
    choiceUrl: c('室戸市', '土佐和牛'),
  },

  // ── 飯塚市（福岡県）— あまおう苺・博多和牛 ─────────────────────────────────
  {
    id: 'iizuka-strawberry-1',
    prefecture: '福岡県', municipality: '飯塚市',
    name: 'あまおう 秀品 約600g（2パック）',
    category: '野菜・果物', minAmount: 6000, popular: true,
    description: '「甘い・丸い・大きい・うまい」の頭文字から生まれたブランド苺。日本最高峰。',
    rakutenUrl: r('飯塚市', 'あまおう'),
    satofullUrl: s('飯塚市', 'あまおう'),
    choiceUrl:   c('飯塚市', 'あまおう'),
  },
  {
    id: 'iizuka-mentaiko-1',
    prefecture: '福岡県', municipality: '飯塚市',
    name: '博多 辛子明太子 200g × 2本',
    category: '乳製品・加工食品', minAmount: 5000, popular: true,
    description: '博多発祥の辛子明太子。ぷりぷりの食感と濃厚な旨みと辛さがご飯に合う。',
    rakutenUrl: r('飯塚市', '博多 明太子'),
    choiceUrl:   c('飯塚市', '明太子'),
  },
  {
    id: 'iizuka-beef-1',
    prefecture: '福岡県', municipality: '飯塚市',
    name: '博多和牛 ロース すき焼き用 300g',
    category: '肉類', minAmount: 10000,
    description: '九州産の黒毛和牛「博多和牛」。柔らかな肉質と甘みのある上質な霜降り。',
    choiceUrl: c('飯塚市', '博多和牛'),
  },

  // ── 阿蘇市（熊本県）— 阿蘇あか牛・馬刺し ───────────────────────────────────
  {
    id: 'aso-akagyu-1',
    prefecture: '熊本県', municipality: '阿蘇市',
    name: '阿蘇あか牛 ステーキ 200g × 2枚',
    category: '肉類', minAmount: 12000, popular: true,
    description: '阿蘇の広大な草原で放牧して育てる赤牛。脂が少なく旨みが凝縮された赤身。',
    rakutenUrl: r('阿蘇市', 'あか牛'),
    satofullUrl: s('阿蘇市', 'あか牛'),
    choiceUrl:   c('阿蘇市', 'あか牛'),
  },
  {
    id: 'aso-basashi-1',
    prefecture: '熊本県', municipality: '阿蘇市',
    name: '熊本産 馬刺し 上赤身・霜降り 食べ比べ 200g',
    category: '肉類', minAmount: 8000, popular: true,
    description: '全国9割の産地・熊本の馬刺し。新鮮な上赤身と霜降りの食べ比べセット。',
    rakutenUrl: r('阿蘇市', '馬刺し'),
    choiceUrl:   c('阿蘇市', '馬刺し'),
  },
  {
    id: 'aso-rice-1',
    prefecture: '熊本県', municipality: '阿蘇市',
    name: '阿蘇産 ヒノヒカリ 精米 10kg',
    category: '米・穀物', minAmount: 7000,
    description: '阿蘇の清流と豊かな火山灰土が育む米。甘みと粘りが強い九州の代表品種。',
    rakutenUrl: r('阿蘇市', 'ヒノヒカリ'),
    choiceUrl:   c('阿蘇市', '米'),
  },

  // ── 臼杵市（大分県）— 関アジ関サバ・かぼす ─────────────────────────────────
  {
    id: 'usuki-seki-aji-1',
    prefecture: '大分県', municipality: '臼杵市',
    name: '関アジ・関サバ 刺身用サク 各200g（冷凍）',
    category: '魚介類', minAmount: 12000, popular: true,
    description: '豊後水道の激流で育った最高級ブランド魚。鮮度抜群の旨みと締まった身質。',
    rakutenUrl: r('臼杵市', '関アジ 関サバ'),
    choiceUrl:   c('臼杵市', '関アジ'),
  },
  {
    id: 'usuki-kabosu-1',
    prefecture: '大分県', municipality: '臼杵市',
    name: '大分産 かぼす 秀品 約1.5kg（約20〜25個）',
    category: '野菜・果物', minAmount: 4000, popular: true,
    description: '全国生産の97%を占める大分のかぼす。爽やかな香りと程よい酸味で魚料理に最高。',
    rakutenUrl: r('臼杵市', 'かぼす'),
    choiceUrl:   c('臼杵市', 'かぼす'),
  },
  {
    id: 'usuki-shoyu-1',
    prefecture: '大分県', municipality: '臼杵市',
    name: '臼杵 老舗醤油 詰め合わせ 3種',
    category: '乳製品・加工食品', minAmount: 5000,
    description: '江戸時代から続く臼杵の醤油蔵。甘み・旨みのバランスが取れた九州醤油。',
    choiceUrl: c('臼杵市', '臼杵 醤油'),
  },

  // ── 恩納村（沖縄県）— もずく・マンゴー・海ぶどう ───────────────────────────
  {
    id: 'onna-mozuku-1',
    prefecture: '沖縄県', municipality: '恩納村',
    name: '沖縄産 太もずく 塩蔵 500g × 4袋',
    category: '魚介類', minAmount: 5000, popular: true,
    description: '全国生産9割・沖縄のもずく。太くてシャキシャキした食感と磯の香り。',
    rakutenUrl: r('恩納村', 'もずく'),
    satofullUrl: s('恩納村', 'もずく'),
    choiceUrl:   c('恩納村', 'もずく'),
  },
  {
    id: 'onna-mango-1',
    prefecture: '沖縄県', municipality: '恩納村',
    name: '沖縄産 完熟マンゴー アーウィン 2玉（約600g）',
    category: '野菜・果物', minAmount: 10000, popular: true,
    description: '太陽の恵みで完熟した沖縄マンゴー。濃厚な甘みとトロピカルな香りが格別。',
    rakutenUrl: r('恩納村', '沖縄マンゴー'),
    choiceUrl:   c('恩納村', 'マンゴー'),
  },
  {
    id: 'onna-sea-grapes-1',
    prefecture: '沖縄県', municipality: '恩納村',
    name: '沖縄産 海ぶどう 100g × 3パック（タレ付き）',
    category: '魚介類', minAmount: 4000,
    description: '「緑のキャビア」とも呼ばれるプチプチ食感の沖縄名物。ポン酢でそのまま食べられる。',
    rakutenUrl: r('恩納村', '海ぶどう'),
    choiceUrl:   c('恩納村', '海ぶどう'),
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
