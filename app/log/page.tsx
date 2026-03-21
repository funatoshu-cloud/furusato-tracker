'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getDonations, addDonation, deleteDonation, type Donation, type DonationSite } from '@/lib/storage'
import { loadTaxSettings, calculate } from '@/lib/calculator'
import { PREFECTURES } from '@/lib/prefectures'

// ── site config ──────────────────────────────────────────────────────────────

const SITES: DonationSite[] = ['Rakuten', 'Satofull', 'Choice', 'Other']

const SITE_LABELS: Record<DonationSite, string> = {
  Rakuten:  '楽天ふるさと納税',
  Satofull: 'さとふる',
  Choice:   'ふるさとチョイス',
  Other:    'その他',
}

// ── helpers ───────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()

function yearTotal(donations: Donation[]): number {
  return donations
    .filter((d) => d.date.startsWith(String(CURRENT_YEAR)))
    .reduce((s, d) => s + d.amount, 0)
}

// ── form default ──────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  prefecture: '' as string,
  municipality: '',
  amount: '',
  date: '',
  giftItem: '',
  site: 'Rakuten' as DonationSite,
  notes: '',
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function LogPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [limit, setLimit] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  // Load donations + limit on mount
  useEffect(() => {
    const all = getDonations()
    setDonations(all)

    const settings = loadTaxSettings()
    if (settings && settings.income > 0) {
      setLimit(calculate(settings).limit)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newDonation = addDonation({
      prefecture: form.prefecture,
      municipality: form.municipality,
      amount: Number(form.amount),
      date: form.date,
      giftItem: form.giftItem,
      site: form.site,
      notes: form.notes,
    })
    const next = [...donations, newDonation]
    setDonations(next)
    setForm(EMPTY_FORM)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleDelete(id: string) {
    deleteDonation(id)
    setDonations((prev) => prev.filter((d) => d.id !== id))
  }

  const total = yearTotal(donations)
  const pct = limit ? Math.min((total / limit) * 100, 100) : 0
  const overLimit = limit !== null && total > limit

  // progress bar colour
  const barColour =
    overLimit ? 'bg-red-500' :
    limit && pct >= 80 ? 'bg-amber-400' :
    'bg-green-500'

  const totalColour =
    overLimit ? 'text-red-600' :
    limit && pct >= 80 ? 'text-amber-600' :
    'text-green-700'

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      {/* ── running total banner ─────────────────────────────────────────── */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 px-5 py-4">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{CURRENT_YEAR}年の寄付合計</p>
            <p className={`text-2xl font-bold tabular-nums ${totalColour}`}>
              ¥{total.toLocaleString()}
              {limit !== null && (
                <span className="text-sm font-normal text-gray-400 ml-1">
                  / ¥{limit.toLocaleString()}
                </span>
              )}
            </p>
          </div>

          {limit === null ? (
            <Link
              href="/settings"
              className="text-xs text-green-600 hover:underline shrink-0"
            >
              設定で上限額を計算する →
            </Link>
          ) : overLimit ? (
            <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              上限超過
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              残り ¥{(limit - total).toLocaleString()}
            </span>
          )}
        </div>

        {limit !== null && (
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColour}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* ── form ────────────────────────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">寄付を記録</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-8 space-y-4">
        {/* 都道府県 + 市区町村 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="都道府県" required>
            <select
              className="input"
              value={form.prefecture}
              onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
              required
            >
              <option value="" disabled>都道府県を選択</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="市区町村" required>
            <input
              className="input"
              placeholder="例: 余市町"
              value={form.municipality}
              onChange={(e) => setForm({ ...form, municipality: e.target.value })}
              required
            />
          </Field>
        </div>

        {/* 金額 + 日付 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="寄付金額（円）" required>
            <div className="relative">
              <input
                className="input pr-8"
                type="number"
                min={1}
                placeholder="10000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                円
              </span>
            </div>
          </Field>
          <Field label="寄付日" required>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </Field>
        </div>

        {/* 返礼品 */}
        <Field label="返礼品名" required>
          <input
            className="input"
            placeholder="例: 余市産リンゴ 5kg"
            value={form.giftItem}
            onChange={(e) => setForm({ ...form, giftItem: e.target.value })}
            required
          />
        </Field>

        {/* サイト */}
        <Field label="サイト">
          <select
            className="input"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value as DonationSite })}
          >
            {SITES.map((s) => (
              <option key={s} value={s}>{SITE_LABELS[s]}</option>
            ))}
          </select>
        </Field>

        {/* メモ */}
        <Field label="メモ">
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="任意のメモ"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            記録する
          </button>
          {saved && (
            <span className="text-sm text-green-600 animate-pulse">保存しました！</span>
          )}
        </div>
      </form>

      {/* ── donation list ────────────────────────────────────────────────── */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">記録一覧</h3>
      {donations.length === 0 ? (
        <p className="text-gray-400 text-sm">まだ記録がありません。上のフォームから追加してください。</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[...donations]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((d) => (
              <div key={d.id} className="flex items-start justify-between px-5 py-3.5 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {d.prefecture} {d.municipality}
                    <span className="ml-2 font-semibold">¥{d.amount.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">{d.giftItem}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d.date}・{SITE_LABELS[d.site] ?? d.site}
                  </p>
                  {d.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 italic truncate">{d.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 mt-0.5 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
