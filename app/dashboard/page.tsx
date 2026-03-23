'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getDonations, updateDonation, DONATION_CATEGORIES, type Donation, type DonationSite } from '@/lib/storage'
import { getPlans, type Plan } from '@/lib/plans'
import { loadTaxSettings, calculate } from '@/lib/calculator'
import { PREFECTURES } from '@/lib/prefectures'
import { yen } from '@/lib/format'
import { isDemoMode, loadDemoData, clearDemoData } from '@/lib/sampleData'

// ── constants ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()

const SITE_LABELS: Record<DonationSite, string> = {
  Rakuten:  '楽天ふるさと納税',
  Satofull: 'さとふる',
  Choice:   'ふるさとチョイス',
  Other:    'その他',
}

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const PIE_COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#94a3b8']

const CATEGORY_COLORS = [
  '#16a34a', '#2563eb', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#e879f9', '#64748b',
]

const CATEGORY_EMOJI: Record<string, string> = {
  '肉類':         '🥩',
  '魚介類':       '🐟',
  '野菜・果物':   '🍎',
  '米・穀物':     '🌾',
  '乳製品・加工食品': '🧀',
  '飲料・お酒':   '🍶',
  '日用品・雑貨': '🧴',
  '工芸品・アート': '🎨',
  '体験・旅行':   '✈️',
  'その他':       '📦',
}

type SortField = 'date' | 'amount'
type SortDir   = 'asc'  | 'desc'

function yearLabel(y: number | 'all') {
  return y === 'all' ? '全年度' : `${y}年`
}

// ── deadline helpers ──────────────────────────────────────────────────────────

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

function daysUntil(target: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(target)
  t.setHours(0, 0, 0, 0)
  return Math.round((t.getTime() - today.getTime()) / 86_400_000)
}

function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）`
}

function DeadlineItem({
  icon, label, date, days, passed, caution,
}: {
  icon: string; label: string; date: string
  days: number; passed: boolean; caution: boolean
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{date}</p>
        <p className={`text-xs mt-0.5 font-semibold ${
          passed ? 'text-gray-400' : caution ? 'text-amber-600' : 'text-green-600'
        }`}>
          {passed ? '締め切り終了' : days === 0 ? '今日が期限！' : `あと ${days}日`}
        </p>
      </div>
    </div>
  )
}

function DeadlineReminders() {
  const today = new Date()
  const year  = today.getFullYear()

  // Main furusato deadline: Dec 31 of the current year
  const mainDeadline = new Date(year, 11, 31)
  const daysMain     = daysUntil(mainDeadline)

  // One-stop exception deadline: Jan 10 following the donation year.
  // If today is on/before Jan 10 of this year → one-stop applies to last year's donations.
  // Otherwise → next Jan 10 applies to this year's donations.
  const jan10This   = new Date(year, 0, 10)
  const onestop     = today <= jan10This ? jan10This : new Date(year + 1, 0, 10)
  const onestopYear = today <= jan10This ? year - 1 : year
  const daysOnestop = daysUntil(onestop)

  // Severity flags
  const mainPassed   = daysMain < 0
  const mainUrgent   = !mainPassed && daysMain <= 7
  const mainWarn     = !mainPassed && daysMain <= 30
  const mainCaution  = !mainPassed && daysMain <= 60

  const onestopPassed = daysOnestop < 0
  const onestopUrgent = !onestopPassed && daysOnestop <= 7
  const onestopWarn   = !onestopPassed && daysOnestop <= 30

  // Show one-stop banner only when it's nearby (approaching within 60 days or just passed within 5 days)
  const showOnestopBanner = daysOnestop >= -5 && daysOnestop <= 60

  return (
    <div className="space-y-2">

      {/* ── Main deadline warning banner (≤30 days) ───────────────── */}
      {mainWarn && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
          mainUrgent
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-orange-50 border-orange-200 text-orange-800'
        }`}>
          <span className="text-2xl shrink-0">{mainUrgent ? '🚨' : '⚠️'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">
              {daysMain === 0
                ? 'ふるさと納税の締め切りは今日です！'
                : `ふるさと納税の締め切りまであと ${daysMain}日`}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {fmtDate(mainDeadline)}が{year}年分の受付期限です
            </p>
          </div>
          <Link
            href="/log"
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              mainUrgent
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            寄付を記録 →
          </Link>
        </div>
      )}

      {/* ── One-stop exception warning banner ─────────────────────── */}
      {showOnestopBanner && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
          onestopPassed
            ? 'bg-gray-50 border-gray-200 text-gray-500'
            : onestopUrgent
              ? 'bg-red-50 border-red-200 text-red-800'
              : onestopWarn
                ? 'bg-purple-50 border-purple-200 text-purple-800'
                : 'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <span className="text-2xl shrink-0">
            {onestopPassed ? '📋' : onestopUrgent ? '🚨' : '📋'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">
              ワンストップ特例（{onestopYear}年分）
              {onestopPassed
                ? ' — 申請期限終了'
                : daysOnestop === 0
                  ? ' — 今日が申請期限！'
                  : ` — あと ${daysOnestop}日`}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {onestopPassed
                ? `申請期限（${fmtDate(onestop)}）はすでに終了しています`
                : `${fmtDate(onestop)}までに各自治体へ申請書を郵送してください`}
            </p>
          </div>
        </div>
      )}

      {/* ── Quiet info strip (shown when no warning banners are active) ── */}
      {!mainWarn && (
        <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-100 px-5 py-3 flex-wrap gap-y-3">
          <DeadlineItem
            icon="🗓️"
            label={`${year}年分　申込期限`}
            date={fmtDate(mainDeadline)}
            days={daysMain}
            passed={mainPassed}
            caution={mainCaution}
          />
          <div className="w-px h-10 bg-gray-100 shrink-0 hidden sm:block" />
          <DeadlineItem
            icon="📋"
            label={`ワンストップ特例　${onestopYear}年分`}
            date={fmtDate(onestop)}
            days={daysOnestop}
            passed={onestopPassed}
            caution={onestopWarn}
          />
        </div>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [donations,    setDonations]    = useState<Donation[]>([])
  const [plans,        setPlans]        = useState<Plan[]>([])
  const [limit,        setLimit]        = useState<number | null>(null)
  const [sortField,    setSortField]    = useState<SortField>('date')
  const [sortDir,      setSortDir]      = useState<SortDir>('desc')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(CURRENT_YEAR)
  const [demoMode,     setDemoMode]     = useState(false)

  useEffect(() => {
    setDonations(getDonations())
    setPlans(getPlans())
    const s = loadTaxSettings()
    if (s && s.income > 0) setLimit(calculate(s).limit)
    setDemoMode(isDemoMode())
  }, [])

  function handleLoadDemo() {
    const { donations: d, plans: p } = loadDemoData()
    setDonations(d)
    setPlans(p)
    setDemoMode(true)
  }

  function handleClearDemo() {
    clearDemoData()
    setDonations([])
    setPlans([])
    setDemoMode(false)
  }

  // ── derived data ────────────────────────────────────────────────────────────

  const availableYears = useMemo(
    () => [...new Set(donations.map(d => Number(d.date.slice(0, 4))))].sort((a, b) => b - a),
    [donations],
  )

  // Donations filtered to the selected year (or all)
  const thisYear = useMemo(
    () => selectedYear === 'all'
      ? donations
      : donations.filter(d => d.date.startsWith(String(selectedYear))),
    [donations, selectedYear],
  )

  const totalThisYear = useMemo(
    () => thisYear.reduce((s, d) => s + d.amount, 0),
    [thisYear],
  )

  const overLimit = limit !== null && totalThisYear > limit
  const remaining = limit !== null ? limit - totalThisYear : null

  const municipalityCount = useMemo(
    () => new Set(thisYear.map((d) => `${d.prefecture}|${d.municipality}`)).size,
    [thisYear],
  )

  const topPrefecture = useMemo(() => {
    const sums: Record<string, number> = {}
    for (const d of thisYear) sums[d.prefecture] = (sums[d.prefecture] ?? 0) + d.amount
    const entries = Object.entries(sums)
    if (!entries.length) return '—'
    return entries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
  }, [thisYear])

  const monthlyData = useMemo(() => {
    const byMonth = Array<number>(12).fill(0)
    for (const d of thisYear) byMonth[Number(d.date.slice(5, 7)) - 1] += d.amount
    return MONTHS.map((month, i) => ({ month, amount: byMonth[i] }))
  }, [thisYear])

  const siteData = useMemo(() => {
    const sums: Partial<Record<DonationSite, number>> = {}
    for (const d of thisYear) sums[d.site] = (sums[d.site] ?? 0) + d.amount
    return (Object.keys(sums) as DonationSite[]).map((site) => ({
      name: SITE_LABELS[site],
      value: sums[site]!,
    }))
  }, [thisYear])

  const sorted = useMemo(() => {
    return [...thisYear].sort((a, b) => {
      const cmp = sortField === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [thisYear, sortField, sortDir])

  // Plans for the selected year (or current year when "all" is selected)
  const plansYear = selectedYear === 'all' ? CURRENT_YEAR : selectedYear
  const yearPlans = useMemo(
    () => plans.filter(p => p.year === plansYear && p.status !== 'cancelled'),
    [plans, plansYear],
  )
  const totalPlanned = useMemo(
    () => yearPlans.reduce((s, p) => s + p.plannedAmount, 0),
    [yearPlans],
  )

  // ── year-over-year ──────────────────────────────────────────────────────────

  // For YoY: "current" = selectedYear (or CURRENT_YEAR when 'all'), "previous" = one year before
  const yoyCurYear  = selectedYear === 'all' ? CURRENT_YEAR : (selectedYear as number)
  const yoyPrevYear = yoyCurYear - 1

  const prevYearDonations = useMemo(
    () => donations.filter(d => d.date.startsWith(String(yoyPrevYear))),
    [donations, yoyPrevYear],
  )

  const prevYearTotal = useMemo(
    () => prevYearDonations.reduce((s, d) => s + d.amount, 0),
    [prevYearDonations],
  )

  // Current-year slice — when 'all' is selected use CURRENT_YEAR for YoY comparison
  const yoyCurrentDonations = selectedYear === 'all'
    ? donations.filter(d => d.date.startsWith(String(CURRENT_YEAR)))
    : thisYear

  const yoyCurrentTotal = useMemo(
    () => yoyCurrentDonations.reduce((s, d) => s + d.amount, 0),
    [yoyCurrentDonations],
  )

  const yoyDelta = yoyCurrentTotal - prevYearTotal
  const yoyPct   = prevYearTotal > 0 ? Math.round(Math.abs(yoyDelta) / prevYearTotal * 100) : null

  const yoyData = useMemo(() => {
    const cur  = Array<number>(12).fill(0)
    const prev = Array<number>(12).fill(0)
    for (const d of yoyCurrentDonations) cur[Number(d.date.slice(5, 7)) - 1]  += d.amount
    for (const d of prevYearDonations)   prev[Number(d.date.slice(5, 7)) - 1] += d.amount
    return MONTHS.map((month, i) => ({ month, cur: cur[i], prev: prev[i] }))
  }, [yoyCurrentDonations, prevYearDonations])

  const hasLastYear = prevYearTotal > 0

  // ── category breakdown ───────────────────────────────────────────────────────

  const categoryData = useMemo(() => {
    const sums: Record<string, number> = {}
    for (const d of thisYear) {
      const cat = d.category ?? 'その他'
      sums[cat] = (sums[cat] ?? 0) + d.amount
    }
    return Object.entries(sums)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [thisYear])

  const hasCategoryData = categoryData.length > 0 &&
    thisYear.some(d => d.category)   // only show chart if at least one donation has a category

  // ── prefecture coverage ──────────────────────────────────────────────────────

  const donatedPrefs = useMemo(
    () => new Set(donations.map(d => d.prefecture)),   // all-time coverage
    [donations],
  )

  function handleToggle(id: string, field: 'giftReceived' | 'certificateReceived') {
    setDonations(prev => {
      const next = prev.map(d => d.id === id ? { ...d, [field]: !d[field] } : d)
      const updated = next.find(d => d.id === id)
      if (updated) updateDonation(updated)
      return next
    })
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('desc') }
  }

  // ── render ──────────────────────────────────────────────────────────────────

  function handleExport() {
    const blob = new Blob([JSON.stringify(thisYear, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `furusato-${selectedYear === 'all' ? 'all' : selectedYear}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-500 font-medium select-none">年度</span>
            <select
              value={selectedYear === 'all' ? 'all' : String(selectedYear)}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm font-semibold text-gray-900 border-none outline-none bg-transparent cursor-pointer"
            >
              <option value="all">全年度</option>
              {availableYears.map(y => (
                <option key={y} value={String(y)}>{y}年</option>
              ))}
            </select>
          </div>
          {thisYear.length > 0 && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition-colors shrink-0"
            >
              JSON エクスポート
            </button>
          )}
        </div>
      </div>

      {/* ── deadline reminders ── */}
      <DeadlineReminders />

      {/* ── demo mode banner ── */}
      {demoMode && <DemoBanner onClear={handleClearDemo} />}

      {/* ── settings nudge (shown until income is configured) ── */}
      {limit === null && <SettingsNudge />}

      {/* ── getting started (shown when no donations recorded yet) ── */}
      {donations.length === 0 && <GettingStartedCard onLoadDemo={handleLoadDemo} />}

      {/* ── summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label={`${yearLabel(selectedYear)}の寄付合計`}
          value={yen(totalThisYear)}
          sub={
            limit !== null
              ? overLimit ? '上限を超えています' : `上限 ${yen(limit)}`
              : undefined
          }
          accent={overLimit ? 'red' : totalThisYear > 0 ? 'green' : 'default'}
        />
        <StatCard
          label="残り寄付枠"
          value={
            remaining === null ? '—' :
            remaining < 0     ? `¥0（${yen(Math.abs(remaining))} 超過）` :
                                yen(remaining)
          }
          sub={limit === null ? '設定で上限を計算できます' : undefined}
          accent={overLimit ? 'red' : 'default'}
          linkHref={limit === null ? '/settings' : undefined}
          linkLabel="上限を設定 →"
        />
        <StatCard
          label={`${yearLabel(selectedYear)}の寄付自治体数`}
          value={`${municipalityCount} 自治体`}
        />
        <StatCard
          label={`${yearLabel(selectedYear)}の最多寄付県`}
          value={topPrefecture}
        />
        <StatCard
          label={`${plansYear}年のプラン`}
          value={`${yearPlans.length} 件`}
          sub={yearPlans.length > 0 ? `計画合計 ${yen(totalPlanned)}` : 'プランがありません'}
          accent={yearPlans.length > 0 ? 'blue' : 'default'}
          linkHref="/plan"
          linkLabel="プランを見る →"
        />
      </div>

      {/* ── charts row 1: YoY bar + site pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* year-over-year monthly bar — 2/3 */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-gray-700">
              月別比較（{yoyCurYear}年 vs {yoyPrevYear}年）
            </h3>
            {hasLastYear && (
              <p className="text-xs text-gray-500 shrink-0">
                前年比&nbsp;
                <span className={yoyDelta >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                  {yoyDelta >= 0 ? '+' : ''}{yen(yoyDelta)}
                  {yoyPct !== null ? `（${yoyDelta >= 0 ? '+' : '-'}${yoyPct}%）` : ''}
                </span>
              </p>
            )}
          </div>
          {yoyCurrentDonations.length === 0 && prevYearDonations.length === 0 ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yoyData} margin={{ top: 8, right: 4, left: 8, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false} width={42}
                  tickFormatter={(v: number) =>
                    v === 0 ? '0' : v >= 10_000 ? `${v / 10_000}万` : `${v / 1_000}k`}
                />
                <Tooltip
                  formatter={(v, name) => [`¥${Number(v).toLocaleString()}`, name === 'cur' ? `${yoyCurYear}年` : `${yoyPrevYear}年`]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Legend
                  formatter={name => name === 'cur' ? `${yoyCurYear}年` : `${yoyPrevYear}年`}
                  iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                />
                <Bar dataKey="cur"  fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="prev" fill="#bbf7d0" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* site pie — 1/3 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">サイト別内訳</h3>
          {siteData.length === 0 ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={siteData} cx="50%" cy="42%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value">
                  {siteData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`¥${Number(v).toLocaleString()}`]} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* ── charts row 2: category pie + prefecture coverage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* category pie — 1/3 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">カテゴリ別内訳</h3>
          {!hasCategoryData ? (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2">
              <p className="text-sm text-gray-300 select-none">カテゴリ未設定</p>
              <Link href="/log" className="text-xs text-green-600 hover:underline">
                寄付を記録してカテゴリを設定 →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="42%" innerRadius={48} outerRadius={74} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v, _n, props) => [
                    `¥${Number(v).toLocaleString()}`,
                    `${CATEGORY_EMOJI[props.payload?.name] ?? ''} ${props.payload?.name}`,
                  ]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend
                  formatter={name => `${CATEGORY_EMOJI[name] ?? ''} ${name}`}
                  iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* prefecture coverage — 2/3 */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">都道府県カバー率</h3>
            <div className="text-right">
              <span className="text-xl font-bold text-green-700">{donatedPrefs.size}</span>
              <span className="text-sm text-gray-400"> / {PREFECTURES.length}</span>
              {donatedPrefs.size > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  ({Math.round(donatedPrefs.size / PREFECTURES.length * 100)}%)
                </span>
              )}
            </div>
          </div>
          {/* progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${donatedPrefs.size / PREFECTURES.length * 100}%` }}
            />
          </div>
          {donatedPrefs.size === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              寄付を記録すると、訪問した都道府県がここに表示されます
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {PREFECTURES.map(pref => {
                const short = pref.endsWith('道') ? pref : pref.slice(0, -1)
                const donated = donatedPrefs.has(pref)
                return (
                  <span
                    key={pref}
                    title={pref}
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium select-none transition-colors ${
                      donated
                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {short}
                  </span>
                )
              })}
            </div>
          )}
          {donatedPrefs.size === PREFECTURES.length && (
            <p className="text-xs text-green-600 font-semibold mt-3 text-center">
              🎉 全47都道府県制覇！
            </p>
          )}
        </section>
      </div>

      {/* ── sortable table ── */}
      <section className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            {yearLabel(selectedYear)} 寄付一覧
          </h3>
          <span className="text-xs text-gray-400">{thisYear.length} 件</span>
        </div>

        {thisYear.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-400 mb-2">まだ寄付が記録されていません。</p>
            <Link href="/log" className="text-xs text-green-600 hover:underline">
              寄付を記録する →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <SortTh label="日付"   field="date"   current={sortField} dir={sortDir} onToggle={toggleSort} />
                  <th className="px-4 py-3 text-left font-medium">自治体</th>
                  <th className="px-4 py-3 text-left font-medium">返礼品</th>
                  <th className="px-4 py-3 text-left font-medium">サイト</th>
                  <th className="px-3 py-3 text-center font-medium leading-tight whitespace-nowrap" title="返礼品を受け取った">
                    返礼品<br/>受取
                  </th>
                  <th className="px-3 py-3 text-center font-medium leading-tight whitespace-nowrap" title="寄附金受領証明書を受け取った">
                    証明書<br/>受取
                  </th>
                  <SortTh label="金額"   field="amount" current={sortField} dir={sortDir} onToggle={toggleSort} right />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">{d.date}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {d.prefecture}&nbsp;{d.municipality}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <span className="truncate block" title={d.giftItem}>{d.giftItem}</span>
                      {d.category && (
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 py-px rounded-full bg-green-50 text-green-700 font-medium">
                          {CATEGORY_EMOJI[d.category]} {d.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {SITE_LABELS[d.site] ?? d.site}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CheckButton
                        checked={d.giftReceived ?? false}
                        onChange={() => handleToggle(d.id, 'giftReceived')}
                        title={d.giftReceived ? '受取済み' : '未受取'}
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CheckButton
                        checked={d.certificateReceived ?? false}
                        onChange={() => handleToggle(d.id, 'certificateReceived')}
                        title={d.certificateReceived ? '受取済み' : '未受取'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                      {yen(d.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-100 text-xs font-semibold text-gray-600">
                  <td colSpan={6} className="px-4 py-3">合計</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                    {yen(totalThisYear)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

function CheckButton({ checked, onChange, title }: {
  checked: boolean
  onChange: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-150 ${
        checked
          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
          : 'border-gray-200 text-transparent hover:border-green-300'
      }`}
    >
      <svg viewBox="0 0 12 10" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1,5 4,8 11,1" />
      </svg>
    </button>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent = 'default',
  linkHref,
  linkLabel,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'blue' | 'red' | 'default'
  linkHref?: string
  linkLabel?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1 leading-tight">{label}</p>
      <p className={`text-xl font-bold leading-snug ${
        accent === 'green' ? 'text-green-700' :
        accent === 'blue'  ? 'text-blue-700'  :
        accent === 'red'   ? 'text-red-600'   :
        'text-gray-900'
      }`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1 leading-tight">{sub}</p>}
      {linkHref && linkLabel && (
        <Link href={linkHref} className="text-xs text-green-600 hover:underline mt-1 inline-block">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function ChartEmpty() {
  return (
    <div className="h-[220px] flex items-center justify-center text-sm text-gray-300 select-none">
      データがありません
    </div>
  )
}

// ── onboarding helpers ────────────────────────────────────────────────────────

/**
 * Amber banner shown while sample / demo data is active.
 * One-click clear wipes all donations + plans and hides the banner.
 */
function DemoBanner({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
      <span className="text-2xl shrink-0 select-none">🎭</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">サンプルデータを表示中</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          これはデモ用のサンプルデータです。自分のデータを入力する準備ができたらクリアしてください。
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
      >
        クリアして始める
      </button>
    </div>
  )
}

/**
 * Blue nudge banner — visible until the user sets income > 0 in Settings.
 * Disappears automatically once `calculate(settings).limit` is available.
 */
function SettingsNudge() {
  return (
    <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5">
      <span className="text-2xl shrink-0 select-none">💡</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">控除上限を計算しましょう</p>
        <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
          年収・家族構成を入力するだけで、今年のふるさと納税の上限額が自動で計算されます。
        </p>
      </div>
      <Link
        href="/settings"
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        設定する →
      </Link>
    </div>
  )
}

/**
 * Green "getting started" card — visible when zero donations have been recorded.
 * Replaced automatically by real content as soon as the first donation is saved.
 */
function GettingStartedCard({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
      <p className="text-sm font-semibold text-green-800 mb-4">さっそく始めましょう</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StartAction
          icon="🔍"
          title="返礼品を発見"
          desc="マップで全国の人気返礼品を探す"
          href="/map"
        />
        <StartAction
          icon="✏️"
          title="寄付を記録"
          desc="今年の寄付を入力する"
          href="/log"
        />
        <StartAction
          icon="📋"
          title="プランを立てる"
          desc="寄付予定を事前に管理する"
          href="/plan"
        />
      </div>
      <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-green-700 opacity-70">
          まずはサンプルデータでダッシュボードの見た目を確認できます
        </p>
        <button
          type="button"
          onClick={onLoadDemo}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-700 bg-white hover:bg-green-50 transition-colors"
        >
          サンプルを読み込む →
        </button>
      </div>
    </div>
  )
}

function StartAction({
  icon, title, desc, href,
}: {
  icon: string; title: string; desc: string; href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-green-100 hover:border-green-300 hover:shadow-sm transition-all group"
    >
      <span className="text-2xl shrink-0 select-none">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </Link>
  )
}

function SortTh({
  label, field, current, dir, onToggle, right,
}: {
  label: string
  field: SortField
  current: SortField
  dir: SortDir
  onToggle: (f: SortField) => void
  right?: boolean
}) {
  const active = current === field
  return (
    <th
      onClick={() => onToggle(field)}
      className={`px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap
        hover:text-gray-800 transition-colors
        ${right ? 'text-right' : 'text-left'}
        ${active ? 'text-gray-700' : 'text-gray-500'}`}
    >
      {label}
      <span className="ml-1 text-gray-300">
        {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}
