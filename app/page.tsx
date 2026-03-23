import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ふるさと納税トラッカー — 記録・管理・返礼品発見',
  description:
    'ふるさと納税の寄付を記録・管理し、全国の人気返礼品をマップで発見。控除上限額の自動計算、年間グラフ、申請書管理まで無料で使える。',
}

const FEATURES = [
  {
    emoji: '🗾',
    title: '全国マップで返礼品発見',
    desc: '全国47都道府県・49自治体の人気返礼品をインタラクティブマップで探索。楽天・さとふる・チョイスへ直接リンク。',
    href: '/map',
    cta: 'マップを開く',
  },
  {
    emoji: '💰',
    title: '控除上限を自動計算',
    desc: '年収・家族構成・申告方法を入力するだけ。2025年最新ルール対応の上限額をリアルタイムで計算します。',
    href: '/settings',
    cta: '上限を計算する',
  },
  {
    emoji: '📊',
    title: '寄付を記録・可視化',
    desc: '月別グラフ・サイト別内訳・都道府県カバー率など、今年の寄付状況をひと目で把握。CSV・JSON出力にも対応。',
    href: '/dashboard',
    cta: 'ダッシュボードへ',
  },
  {
    emoji: '📋',
    title: '寄付プランを管理',
    desc: '「この自治体に寄付する予定」を事前に登録。実際に寄付したら一発で記録に変換できます。',
    href: '/plan',
    cta: 'プランを立てる',
  },
]

const STEPS = [
  {
    n: '01',
    title: '控除上限を計算する',
    desc: '設定画面で年収と家族構成を入力。いくらまで寄付できるか即座にわかります。',
    href: '/settings',
    color: 'bg-blue-50 border-blue-100',
    numColor: 'text-blue-200',
  },
  {
    n: '02',
    title: 'マップで返礼品を選ぶ',
    desc: '日本地図を見ながら気になる自治体をクリック。人気の返礼品リストから好みのものを選ぼう。',
    href: '/map',
    color: 'bg-green-50 border-green-100',
    numColor: 'text-green-200',
  },
  {
    n: '03',
    title: '寄付を記録して管理',
    desc: '寄付したら記録するだけ。返礼品の受取状況・証明書の管理・年末の確定申告まで全部まとめて。',
    href: '/log',
    color: 'bg-amber-50 border-amber-100',
    numColor: 'text-amber-200',
  },
]

const STATS = [
  { value: '47', unit: '都道府県', label: '全国対応' },
  { value: '49', unit: '自治体', label: '返礼品カタログ収録' },
  { value: '¥0', unit: '', label: '完全無料・登録不要' },
  { value: '100%', unit: '', label: 'データはお使いの端末に保存' },
]

export default function LandingPage() {
  return (
    <div className="min-h-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white px-6 py-20 sm:py-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span>🗾</span>
            <span>無料・登録不要・データはあなたのブラウザに保存</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
            ふるさと納税を、<br className="hidden sm:block" />
            もっとかしこく。
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            控除上限の自動計算から、全国マップでの返礼品発見、寄付記録の管理まで。
            ふるさと納税に必要なすべてが、ひとつのアプリで。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-base shadow-lg shadow-black/10"
            >
              無料で使ってみる →
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              🗾 返礼品マップを見る
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-gray-900">
                {s.value}<span className="text-sm font-medium text-gray-500 ml-1">{s.unit}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
          ふるさと納税に必要な機能が全部揃っている
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          複雑な税額計算も、返礼品探しも、書類管理も。このアプリひとつで完結します。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-200 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-4 select-none">{f.emoji}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.desc}</p>
              <Link
                href={f.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
              >
                {f.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            3ステップで始められる
          </h2>
          <p className="text-gray-500 text-center mb-12">
            登録なし、インストールなし。今すぐ始められます。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STEPS.map(s => (
              <Link
                key={s.n}
                href={s.href}
                className={`relative rounded-2xl border p-6 hover:shadow-md transition-all ${s.color}`}
              >
                <p className={`text-6xl font-black leading-none mb-4 select-none ${s.numColor}`}>
                  {s.n}
                </p>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy callout ──────────────────────────────────────────────── */}
      <section className="px-6 py-14 max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-4xl mb-4 select-none">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            データはあなたのブラウザだけに保存されます
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-6">
            年収や寄付金額などの個人情報は、サーバーには一切送信されません。
            すべてのデータはお使いのデバイスのローカルストレージにのみ保存されます。
            アカウント登録も不要です。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-200">|</span>
            <Link
              href="/legal"
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              免責事項・広告について
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 px-6 py-16 sm:py-20 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            今年のふるさと納税、<br />始めませんか？
          </h2>
          <p className="text-white/75 mb-8 text-sm leading-relaxed">
            無料・登録不要。まずはサンプルデータでダッシュボードを体験してみてください。
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-10 py-4 rounded-xl hover:bg-green-50 transition-colors text-base shadow-lg shadow-black/10"
          >
            無料で使ってみる →
          </Link>
        </div>
      </section>

    </div>
  )
}
