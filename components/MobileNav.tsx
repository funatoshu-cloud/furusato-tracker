'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ホーム',   icon: '📊' },
  { href: '/map',       label: 'マップ',   icon: '🗾' },
  { href: '/log',       label: '記録',     icon: '✏️' },
  { href: '/settings',  label: '設定',     icon: '⚙️' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex md:hidden bg-white border-t border-gray-200 safe-bottom">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              active ? 'text-green-700' : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
