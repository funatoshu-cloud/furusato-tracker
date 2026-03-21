export type DonationSite = 'Rakuten' | 'Satofull' | 'Choice' | 'Other'

export interface Donation {
  id: string
  municipality: string  // 市区町村
  prefecture: string    // 都道府県
  amount: number        // 円
  date: string          // YYYY-MM-DD
  giftItem: string      // 返礼品名
  site: DonationSite
  notes: string
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
