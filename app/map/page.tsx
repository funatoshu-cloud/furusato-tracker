'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getDonations, addDonation, type Donation } from '@/lib/storage'

const DonationMap = dynamic(() => import('@/components/DonationMap'), { ssr: false })

export default function MapPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [hintDismissed, setHintDismissed] = useState(false)

  useEffect(() => {
    setDonations(getDonations())
  }, [])

  const handleAddDonation = useCallback((data: Omit<Donation, 'id'>) => {
    const newDonation = addDonation(data)
    setDonations(prev => [...prev, newDonation])
  }, [])

  // Show hint strip only when there are no donations and user hasn't dismissed it
  const showHint = donations.length === 0 && !hintDismissed

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="px-4 sm:px-8 py-4 sm:py-5 bg-white border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">マップ</h2>
        <p className="text-sm text-gray-500 mt-0.5">寄付を記録、または返礼品を発見しましょう</p>
      </div>

      {/* ── first-visit hint strip ── */}
      {showHint && (
        <div className="flex items-center gap-3 bg-amber-50 border-b border-amber-100 px-4 sm:px-8 py-2.5 shrink-0">
          <span className="text-lg shrink-0 select-none">💡</span>
          <p className="text-xs text-amber-800 flex-1 leading-relaxed">
            <span className="font-semibold">はじめての方へ：</span>
            右上の「<span className="font-semibold">🔍 発見する</span>」に切り替えると、全国の人気返礼品をマップで探せます。
            都道府県 → 市区町村の順にクリックして記録しましょう。
          </p>
          <button
            onClick={() => setHintDismissed(true)}
            aria-label="閉じる"
            className="shrink-0 text-amber-300 hover:text-amber-500 transition-colors text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <DonationMap donations={donations} onAddDonation={handleAddDonation} />
      </div>
    </div>
  )
}
