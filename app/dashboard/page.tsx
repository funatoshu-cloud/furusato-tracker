'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getDonations, type Donation, type DonationSite } from '@/lib/storage'
import { loadTaxSettings, calculate } from '@/lib/calculator'
import { yen } from '@/lib/format'

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

type SortField = 'date' | 'amount'
type SortDir   = 'asc'  | 'desc'

// ── page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [limit, setLimit]         = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')

  useEffect(() => {
    setDonations(getDonations())
    const s = loadTaxSettings()
    if (s && s.income > 0) setLimit(calculate(s).limit)
  }, [])

  // ── derived data ────────────────────────────────────────────────────────────

  const thisYear = useMemo(
    () => donations.filter((d) => d.date.startsWith(String(CURRENT_YEAR))),
    [donations],
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
    a.download = `furusato-${CURRENT_YEAR}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        {thisYear.length > 0 && (
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition-colors shrink-0"
          >
            JSON エクスポート
          </button>
        )}
      </div>

      {/* ── summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`${CURRENT_YEAR}年の寄付合計`}
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
          label={`${CURRENT_YEAR}年の寄付自治体数`}
          value={`${municipalityCount} 自治体`}
        />
        <StatCard
          label="最多寄付都道府県"
          value={topPrefecture}
        />
      </div>

      {/* ── charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* monthly bar chart — 2/3 */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            月別寄付額（{CURRENT_YEAR}年）
          </h3>
          {thisYear.length === 0 ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v === 0 ? '0' : v >= 10_000 ? `${v / 10_000}万` : `${v / 1_000}k`
                  }
                  width={42}
                />
                <Tooltip
                  formatter={(v) => [`¥${Number(v).toLocaleString()}`, '寄付額']}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* pie chart — 1/3 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">サイト別内訳</h3>
          {siteData.length === 0 ? (
            <ChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={siteData}
                  cx="50%"
                  cy="42%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {siteData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`¥${Number(v).toLocaleString()}`]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* ── sortable table ── */}
      <section className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            {CURRENT_YEAR}年 寄付一覧
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
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={d.giftItem}>
                      {d.giftItem}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {SITE_LABELS[d.site] ?? d.site}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                      {yen(d.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-100 text-xs font-semibold text-gray-600">
                  <td colSpan={4} className="px-4 py-3">合計</td>
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
  accent?: 'green' | 'red' | 'default'
  linkHref?: string
  linkLabel?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1 leading-tight">{label}</p>
      <p className={`text-xl font-bold leading-snug ${
        accent === 'green' ? 'text-green-700' :
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
