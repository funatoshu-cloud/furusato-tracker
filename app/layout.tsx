import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { OnboardingModal } from '@/components/OnboardingModal'
import { SiteFooter } from '@/components/SiteFooter'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://furusato-tracker.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'ふるさと納税トラッカー',
    template: '%s | ふるさと納税トラッカー',
  },
  description:
    'ふるさと納税の寄付を記録・管理し、全国の人気返礼品をマップで発見。控除上限額の自動計算、年間グラフ、申請書管理まで無料で使える。',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: APP_URL,
    siteName: 'ふるさと納税トラッカー',
    title: 'ふるさと納税トラッカー — 記録・管理・返礼品発見',
    description:
      '寄付を記録して控除上限を自動計算。マップで全国49自治体の人気返礼品を発見して楽天・さとふる・チョイスへ直行。',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'ふるさと納税トラッカー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ふるさと納税トラッカー — 記録・管理・返礼品発見',
    description:
      '寄付を記録して控除上限を自動計算。マップで全国の人気返礼品を発見。',
    images: ['/opengraph-image'],
  },
  keywords: [
    'ふるさと納税', '返礼品', '控除上限', 'ふるさと納税管理',
    '寄付記録', 'ふるさと納税マップ', 'ふるさと納税計算',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={geist.variable}>
      <body className="flex min-h-screen bg-gray-50 antialiased">
        <Sidebar />
        {/* Scrollable content area — flex-col so footer sticks below page content */}
        <div className="flex-1 flex flex-col overflow-auto pb-16 md:pb-0">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <MobileNav />
        <OnboardingModal />
      </body>
    </html>
  )
}
