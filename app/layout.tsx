import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { OnboardingModal } from '@/components/OnboardingModal'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'ふるさと納税トラッカー',
  description: 'ふるさと納税の寄付を記録・管理するアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={geist.variable}>
      <body className="flex min-h-screen bg-gray-50 antialiased">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
        <MobileNav />
        <OnboardingModal />
      </body>
    </html>
  )
}
