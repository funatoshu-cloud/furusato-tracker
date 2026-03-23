/**
 * Demo / sample-data mode.
 *
 * Loads a realistic set of donations + plans so a brand-new user can
 * explore the dashboard without entering their own data first.
 *
 * The DEMO_KEY flag lets the UI show a "sample data active" banner and
 * offer a one-click clear.  Clearing removes ALL donations and plans
 * (safe because demo is only offered when the user has no existing data).
 */

import { saveDonations } from './storage'
import { savePlans, type Plan } from './plans'
import type { Donation } from './storage'

export const DEMO_KEY = 'furusato_demo_mode'

export function isDemoMode(): boolean {
  try { return !!localStorage.getItem(DEMO_KEY) } catch { return false }
}

export function clearDemoData(): void {
  saveDonations([])
  savePlans([])
  try { localStorage.removeItem(DEMO_KEY) } catch { /* ignore */ }
}

// ── sample data ───────────────────────────────────────────────────────────────

export function loadDemoData(): { donations: Donation[]; plans: Plan[] } {
  const y = new Date().getFullYear()

  const rawDonations: Omit<Donation, 'id'>[] = [
    {
      prefecture: '北海道', municipality: '根室市',
      amount: 10000, date: `${y}-02-14`,
      giftItem: 'ホタテ貝柱 大粒 1kg（冷凍）',
      category: '魚介類', site: 'Rakuten', notes: '',
      giftReceived: true, certificateReceived: true,
    },
    {
      prefecture: '宮崎県', municipality: '都城市',
      amount: 10000, date: `${y}-03-20`,
      giftItem: '本格芋焼酎 飲み比べセット 720ml × 3本',
      category: '飲料・お酒', site: 'Rakuten', notes: '',
      giftReceived: true, certificateReceived: true,
    },
    {
      prefecture: '新潟県', municipality: '南魚沼市',
      amount: 10000, date: `${y}-05-03`,
      giftItem: '魚沼産コシヒカリ 精米 10kg',
      category: '米・穀物', site: 'Choice', notes: 'リピート確定',
      giftReceived: true, certificateReceived: true,
    },
    {
      prefecture: '山形県', municipality: '天童市',
      amount: 10000, date: `${y}-06-20`,
      giftItem: 'さくらんぼ 佐藤錦 秀品 1kg',
      category: '野菜・果物', site: 'Satofull', notes: 'また頼みたい',
      giftReceived: true, certificateReceived: true,
    },
    {
      prefecture: '佐賀県', municipality: '唐津市',
      amount: 12000, date: `${y}-09-15`,
      giftItem: '呼子のヤリイカ 活け造り用 冷凍 4杯',
      category: '魚介類', site: 'Choice', notes: '',
      giftReceived: true, certificateReceived: false,
    },
    {
      prefecture: '石川県', municipality: '加賀市',
      amount: 10000, date: `${y}-10-30`,
      giftItem: '九谷焼 湯のみ・茶碗セット',
      category: '工芸品・アート', site: 'Rakuten', notes: '母へのプレゼント用',
      giftReceived: false, certificateReceived: false,
    },
    {
      prefecture: '鹿児島県', municipality: '志布志市',
      amount: 15000, date: `${y}-11-11`,
      giftItem: '鹿児島黒牛 ロースステーキ 200g × 3枚',
      category: '肉類', site: 'Rakuten', notes: 'ブラックフライデーセール',
      giftReceived: false, certificateReceived: false,
    },
    {
      prefecture: '長崎県', municipality: '平戸市',
      amount: 8000, date: `${y}-12-01`,
      giftItem: '平戸の恵み 旬の鮮魚詰め合わせ 2kg',
      category: '魚介類', site: 'Choice', notes: '',
      giftReceived: false, certificateReceived: false,
    },
  ]

  const donations: Donation[] = rawDonations.map(d => ({
    ...d,
    id: crypto.randomUUID(),
  }))

  const rawPlans: Omit<Plan, 'id'>[] = [
    {
      prefecture: '和歌山県', municipality: '那智勝浦町',
      plannedAmount: 15000, targetGiftItem: '本マグロ 赤身・中トロ 食べ比べセット',
      site: 'Rakuten', year: y, notes: '年末に頼む予定', status: 'planned',
    },
    {
      prefecture: '北海道', municipality: '白糠町',
      plannedAmount: 8000, targetGiftItem: 'いくら醤油漬け 400g × 2パック',
      site: 'Satofull', year: y, notes: '', status: 'planned',
    },
    {
      prefecture: '佐賀県', municipality: '嬉野市',
      plannedAmount: 6000, targetGiftItem: '嬉野茶 特選かぶせ茶 100g × 3本',
      site: 'Choice', year: y, notes: 'お歳暮用に', status: 'planned',
    },
  ]

  const plans: Plan[] = rawPlans.map(p => ({
    ...p,
    id: crypto.randomUUID(),
  }))

  saveDonations(donations)
  savePlans(plans)
  try { localStorage.setItem(DEMO_KEY, '1') } catch { /* ignore */ }

  return { donations, plans }
}
