export type DonationSite = 'Rakuten' | 'Satofull' | 'Choice' | 'Other'

export const DONATION_CATEGORIES = [
  '肉類',
  '魚介類',
  '野菜・果物',
  '米・穀物',
  '乳製品・加工食品',
  '飲料・お酒',
  '日用品・雑貨',
  '工芸品・アート',
  '体験・旅行',
  'その他',
] as const

export type DonationCategory = typeof DONATION_CATEGORIES[number]

export interface Donation {
  id: string
  municipality: string   // 市区町村
  prefecture: string     // 都道府県
  amount: number         // 円
  date: string           // YYYY-MM-DD
  giftItem: string       // 返礼品名
  category?: DonationCategory  // 返礼品カテゴリ（任意）
  site: DonationSite
  notes: string
  giftReceived?: boolean         // 返礼品受取済み
  certificateReceived?: boolean  // 寄附金受領証明書受取済み
}

const STORAGE_KEY = 'furusato_donations'

export function getDonations(): Donation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDonations(donations: Donation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donations))
}

export function addDonation(donation: Omit<Donation, 'id'>): Donation {
  const donations = getDonations()
  const newDonation: Donation = { ...donation, id: crypto.randomUUID() }
  saveDonations([...donations, newDonation])
  return newDonation
}

export function deleteDonation(id: string): void {
  const donations = getDonations()
  saveDonations(donations.filter((d) => d.id !== id))
}

export function updateDonation(updated: Donation): void {
  const donations = getDonations()
  saveDonations(donations.map((d) => (d.id === updated.id ? updated : d)))
}
