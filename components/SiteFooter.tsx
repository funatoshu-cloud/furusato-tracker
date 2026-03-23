import Link from 'next/link'

/**
 * Site-wide footer: affiliate disclosure + legal links.
 * Rendered as a server component — no client JS needed.
 * Imported by individual pages that need it (dashboard, settings, etc.)
 * and also by the root layout inside the scrollable area.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-8 px-6 py-5 pb-24 md:pb-6 text-xs text-gray-400">
      <div className="max-w-5xl mx-auto space-y-2">
        <p className="leading-relaxed">
          当サイトは<strong className="text-gray-500">楽天アフィリエイト</strong>、
          さとふるアフィリエイト、ふるさとチョイスアフィリエイト等のアフィリエイトプログラムに参加しています。
          返礼品リンクをクリックして購入・寄付された場合、当サイトに報酬が発生することがあります。
          掲載内容は独自調査に基づいており、広告掲載の有無により推薦内容は変わりません。
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
          <span>© {new Date().getFullYear()} ふるさと納税トラッカー</span>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors underline underline-offset-2">
            プライバシーポリシー
          </Link>
          <Link href="/legal" className="hover:text-gray-600 transition-colors underline underline-offset-2">
            免責事項・広告について
          </Link>
        </div>
      </div>
    </footer>
  )
}
