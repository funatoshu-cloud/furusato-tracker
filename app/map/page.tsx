'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getDonations, addDonation, type Donation } from '@/lib/storage'

const DonationMap = dynamic(() => import('@/components/DonationMap'), { ssr: false })

export default function MapPage() {
  const [donations, setDonations] = useState<Donation[]>([])

  useEffect(() => {
    setDonations(getDonations())
  }, [])

  const handleAddDonation = useCallback((data: Omit<Donation, 'id'>) => {
    const newDonation = addDonation(data)
    setDonations(prev => [...prev, newDonation])
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 sm:px-8 py-4 sm:py-5 bg-white border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">マップ</h2>
        <p className="text-sm text-gray-500 mt-0.5">寄付を記録、または返礼品を発見しましょう</p>
      </div>
      <div className="flex-1">
        <DonationMap donations={donations} onAddDonation={handleAddDonation} />
      </div>
    </div>
  )
}
