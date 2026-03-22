'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  getDonations, addDonation, deleteDonation,
  DONATION_CATEGORIES, type Donation, type DonationSite, type DonationCategory,
} from '@/lib/storage'
import { getPlans, updatePlan, type Plan } from '@/lib/plans'
import { loadTaxSettings, calculate } from '@/lib/calculator'
import { PREFECTURES } from '@/lib/prefectures'
import { MunicipalitySelect, MunicipalityCombobox, MUNICIPALITIES } from '@/components/MunicipalitySelect'

// ── constants ─────────────────────────────────────────────────────────────────

const SITES: DonationSite[] = ['Rakuten', 'Satofull', 'Choice', 'Other']

const SITE_LABELS: Record<DonationSite, string> = {
  Rakuten:  '楽天ふるさと納税',
  Satofull: 'さとふる',
  Choice:   'ふるさとチョイス',
  Other:    'その他',
}

const CURRENT_YEAR = new Date().getFullYear()
const TODAY = new Date().toISOString().slice(0, 10)

const CSV_HEADERS = 'prefecture,municipality,amount,date,giftItem,site,notes,category'
const CSV_TEMPLATE = [
  CSV_HEADERS,
  '北海道,余市町,10000,2025-01-15,余市産リンゴ 5kg,Rakuten,,野菜・果物',
].join('\n')

// ── helpers ───────────────────────────────────────────────────────────────────

function yearTotal(donations: Donation[]): number {
  return donations
    .filter(d => d.date.startsWith(String(CURRENT_YEAR)))
    .reduce((s, d) => s + d.amount, 0)
}

// ── CSV parsing ───────────────────────────────────────────────────────────────

interface ParsedCsvRow {
  prefecture: string
  municipality: string
  amount: string
  date: string
  giftItem: string
  site: string
  notes: string
  category: string
  errors: string[]
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    const cells: string[] = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ } else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        cells.push(cur.trim()); cur = ''
      } else { cur += ch }
    }
    cells.push(cur.trim())
    rows.push(cells)
  }
  return rows
}

function parseCsvRows(text: string): ParsedCsvRow[] {
  const raw = parseCSV(text)
  if (!raw.length) return []
  const isHeader = raw[0][0]?.toLowerCase().trim() === 'prefecture'
  return (isHeader ? raw.slice(1) : raw)
    .filter(r => r.some(c => c.trim()))
    .map(r => {
      const [prefecture = '', municipality = '', amount = '', date = '', giftItem = '', site = '', notes = '', category = ''] = r
      const errors: string[] = []
      const pref = prefecture.trim()
      const muni = municipality.trim()
      if (!pref)                                                       errors.push('都道府県が未入力')
      if (!muni)                                                       errors.push('市区町村が未入力')
      if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) errors.push('金額が未入力')
      // Validate municipality against official list when prefecture is known
      if (pref && muni && (MUNICIPALITIES[pref] ?? []).length > 0 && !(MUNICIPALITIES[pref] ?? []).includes(muni)) {
        errors.push('市区町村が見つかりません — スペルを確認してください')
      }
      return { prefecture, municipality, amount, date, giftItem, site, notes, category, errors }
    })
}

// ── shared types ──────────────────────────────────────────────────────────────

type AddFn = (items: Omit<Donation, 'id'>[]) => void

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── 1. Manual entry tab ───────────────────────────────────────────────────────

function ManualTab({
  onSave,
  plans,
  onPlanCompleted,
}: {
  onSave: AddFn
  plans: Plan[]
  onPlanCompleted: (planId: string) => void
}) {
  const empty = {
    prefecture: '' as string,
    municipality: '',
    amount: '',
    date: TODAY,
    giftItem: '',
    category: '' as DonationCategory | '',
    site: 'Rakuten' as DonationSite,
    notes: '',
  }

  const [form, setForm] = useState(empty)
  const [isPast, setIsPast] = useState(false)
  const [saved, setSaved] = useState(false)
  const [linkedPlanId, setLinkedPlanId] = useState('')

  function handlePlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const planId = e.target.value
    setLinkedPlanId(planId)
    if (!planId) return
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    // Set all fields from the plan — do NOT reset municipality when prefecture changes
    // because we are setting both simultaneously
    setForm(f => ({
      ...f,
      prefecture:   plan.prefecture,
      municipality: plan.municipality,
      amount:       String(plan.plannedAmount),
      site:         plan.site as DonationSite,
      giftItem:     plan.targetGiftItem || f.giftItem,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave([{
      prefecture:   form.prefecture,
      municipality: form.municipality,
      amount:       Number(form.amount),
      date:         form.date,
      giftItem:     form.giftItem,
      category:     form.category || undefined,
      site:         form.site,
      notes:        form.notes,
    }])
    if (linkedPlanId) {
      onPlanCompleted(linkedPlanId)
      setLinkedPlanId('')
    }
    setForm({ ...empty, date: isPast ? '' : TODAY })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Linked plan */}
      {plans.length > 0 && (
        <Field label="プランからインポート（任意）">
          <select className="input" value={linkedPlanId} onChange={handlePlanChange}>
            <option value="">— プランを選択してリンクする —</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.year}年　{p.prefecture} {p.municipality}　¥{p.plannedAmount.toLocaleString()}
                {p.targetGiftItem ? `　（${p.targetGiftItem}）` : ''}
              </option>
            ))}
          </select>
          {linkedPlanId && (
            <p className="text-xs text-blue-600 mt-1">
              📋 保存時にこのプランを「寄付済み」にマークします
            </p>
          )}
        </Field>
      )}

      {/* Past donation toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={isPast}
          onChange={e => {
            setIsPast(e.target.checked)
            setForm(f => ({ ...f, date: e.target.checked ? '' : TODAY }))
          }}
          className="accent-green-600 w-4 h-4"
        />
        <span className="text-sm text-gray-600">過去の寄付として記録する</span>
      </label>

      {/* 都道府県 + 市区町村 (cascading) */}
      <MunicipalitySelect
        prefecture={form.prefecture}
        municipality={form.municipality}
        onPrefectureChange={pref => setForm(f => ({ ...f, prefecture: pref, municipality: '' }))}
        onMunicipalityChange={muni => setForm(f => ({ ...f, municipality: muni }))}
        required
      />

      {/* 金額 + 日付 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="寄付金額（円）" required>
          <div className="relative">
            <input className="input pr-8" type="number" min={1} placeholder="10000"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">円</span>
          </div>
        </Field>
        <Field label="寄付日" required>
          <input className={`input ${!isPast ? 'bg-gray-50 text-gray-400' : ''}`}
            type="date" max={TODAY} value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            disabled={!isPast} required />
          {!isPast && (
            <p className="text-xs text-gray-400 mt-1">本日の日付で記録されます</p>
          )}
        </Field>
      </div>

      {/* 返礼品 */}
      <Field label="返礼品名" required>
        <input className="input" placeholder="例: 余市産リンゴ 5kg" value={form.giftItem}
          onChange={e => setForm({ ...form, giftItem: e.target.value })} required />
      </Field>

      {/* カテゴリ + サイト */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="カテゴリ">
          <select className="input" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as DonationCategory | '' }))}>
            <option value="">カテゴリを選択（任意）</option>
            {DONATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="サイト">
          <select className="input" value={form.site}
            onChange={e => setForm(f => ({ ...f, site: e.target.value as DonationSite }))}>
            {SITES.map(s => <option key={s} value={s}>{SITE_LABELS[s]}</option>)}
          </select>
        </Field>
      </div>

      {/* メモ */}
      <Field label="メモ">
        <textarea className="input resize-none" rows={2} placeholder="任意のメモ"
          value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit"
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
          記録する
        </button>
        {saved && <span className="text-sm text-green-600 animate-pulse">保存しました！</span>}
      </div>
    </form>
  )
}

// ── 2. Bulk entry tab ─────────────────────────────────────────────────────────

interface BulkRow {
  prefecture: string; municipality: string; amount: string
  date: string; giftItem: string; category: DonationCategory | ''; site: DonationSite | ''
}

const EMPTY_BULK_ROW: BulkRow = {
  prefecture: '', municipality: '', amount: '', date: '', giftItem: '', category: '', site: '',
}

function makeBulkRows(n: number): BulkRow[] {
  return Array.from({ length: n }, () => ({ ...EMPTY_BULK_ROW }))
}

function BulkTab({ onSave }: { onSave: AddFn }) {
  const [rows, setRows] = useState<BulkRow[]>(makeBulkRows(10))
  const [savedCount, setSavedCount] = useState(0)

  function setRow(i: number, patch: Partial<BulkRow>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r))
  }

  const filledRows = rows.filter(r => r.prefecture && r.municipality && r.amount && Number(r.amount) > 0)

  function handleSave() {
    if (!filledRows.length) return
    onSave(filledRows.map(r => ({
      prefecture:   r.prefecture,
      municipality: r.municipality,
      amount:       Number(r.amount),
      date:         r.date || TODAY,
      giftItem:     r.giftItem || '（未入力）',
      category:     r.category || undefined,
      site:         (r.site || 'Rakuten') as DonationSite,
      notes:        '',
    })))
    setSavedCount(filledRows.length)
    setRows(makeBulkRows(10))
    setTimeout(() => setSavedCount(0), 3000)
  }

  const thCls = 'px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap'
  const tdCls = 'px-2 py-1.5'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[720px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className={`${thCls} w-8 text-center`}>#</th>
              <th className={thCls}>都道府県 <span className="text-red-400">*</span></th>
              <th className={thCls}>市区町村 <span className="text-red-400">*</span></th>
              <th className={thCls}>金額（円） <span className="text-red-400">*</span></th>
              <th className={thCls}>寄付日</th>
              <th className={thCls}>返礼品名</th>
              <th className={thCls}>カテゴリ</th>
              <th className={thCls}>サイト</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className={`${tdCls} text-center text-gray-400`}>{i + 1}</td>
                <td className={tdCls}>
                  <select className="input text-xs py-1" value={row.prefecture}
                    onChange={e => setRow(i, { prefecture: e.target.value, municipality: '' })}>
                    <option value="">選択</option>
                    {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className={tdCls}>
                  <MunicipalityCombobox
                    prefecture={row.prefecture}
                    municipality={row.municipality}
                    onChange={muni => setRow(i, { municipality: muni })}
                    className="text-xs py-1 w-36"
                  />
                </td>
                <td className={tdCls}>
                  <input className="input text-xs py-1 w-24" type="number" min={1} placeholder="10000"
                    value={row.amount} onChange={e => setRow(i, { amount: e.target.value })} />
                </td>
                <td className={tdCls}>
                  <input className="input text-xs py-1" type="date" max={TODAY}
                    value={row.date} onChange={e => setRow(i, { date: e.target.value })} />
                </td>
                <td className={tdCls}>
                  <input className="input text-xs py-1 w-36" placeholder="返礼品名"
                    value={row.giftItem} onChange={e => setRow(i, { giftItem: e.target.value })} />
                </td>
                <td className={tdCls}>
                  <select className="input text-xs py-1 w-28" value={row.category}
                    onChange={e => setRow(i, { category: e.target.value as DonationCategory | '' })}>
                    <option value="">—</option>
                    {DONATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className={tdCls}>
                  <select className="input text-xs py-1" value={row.site}
                    onChange={e => setRow(i, { site: e.target.value as DonationSite | '' })}>
                    <option value="">選択</option>
                    {SITES.map(s => <option key={s} value={s}>{SITE_LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
        <button type="button"
          onClick={() => setRows(prev => [...prev, ...makeBulkRows(10)])}
          className="text-xs font-medium text-green-600 hover:text-green-800">
          + 10行追加
        </button>
        <div className="flex items-center gap-3">
          {savedCount > 0 && (
            <span className="text-xs text-green-600 animate-pulse">{savedCount}件を保存しました！</span>
          )}
          <button type="button" onClick={handleSave} disabled={filledRows.length === 0}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors">
            すべて保存{filledRows.length > 0 ? `（${filledRows.length}件）` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 3. CSV import tab ─────────────────────────────────────────────────────────

function CsvTab({ onSave }: { onSave: AddFn }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[] | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'furusato-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setParsedRows(parseCsvRows(ev.target?.result as string))
      setImportedCount(null)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  function handleImport() {
    if (!parsedRows) return
    const valid = parsedRows.filter(r => r.errors.length === 0)
    onSave(valid.map(r => ({
      prefecture:   r.prefecture,
      municipality: r.municipality,
      amount:       Number(r.amount),
      date:         r.date || TODAY,
      giftItem:     r.giftItem || '（未入力）',
      category:     (DONATION_CATEGORIES as readonly string[]).includes(r.category)
                      ? r.category as DonationCategory
                      : undefined,
      site:         (SITES.includes(r.site as DonationSite) ? r.site : 'Rakuten') as DonationSite,
      notes:        r.notes,
    })))
    setImportedCount(valid.length)
    setParsedRows(null)
  }

  const validCount = parsedRows?.filter(r => r.errors.length === 0).length ?? 0
  const errorCount = parsedRows?.filter(r => r.errors.length > 0).length ?? 0

  return (
    <div className="space-y-4">
      {/* template + upload row */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">CSVテンプレート</h3>
          <p className="text-xs text-gray-500 mb-3">
            テンプレートをダウンロードして必要事項を記入し、インポートしてください。<br />
            ヘッダー：<code className="bg-gray-100 px-1 rounded text-[11px]">{CSV_HEADERS}</code>
          </p>
          <button type="button" onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors">
            テンプレートをダウンロード
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">ファイルをアップロード</h3>
          <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg cursor-pointer transition-colors">
            CSVファイルを選択
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {importedCount !== null && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            ✓ {importedCount}件のデータをインポートしました
          </div>
        )}
      </div>

      {/* preview table */}
      {parsedRows && parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">プレビュー</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {validCount}件が有効
                {errorCount > 0 && (
                  <span className="text-red-500 ml-2">{errorCount}件にエラー（スキップされます）</span>
                )}
              </p>
            </div>
            <button type="button" onClick={handleImport} disabled={validCount === 0}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
              {validCount}件をインポート
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['都道府県', '市区町村', '金額', '日付', '返礼品名', 'サイト', '状態'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.map((row, i) => {
                  const bad = row.errors.length > 0
                  const cell = (val: string, isErr: boolean) =>
                    `px-3 py-2 ${bad && isErr ? 'text-red-600 font-semibold' : 'text-gray-700'}`
                  const muniNotFound = row.errors.some(e => e.includes('見つかりません'))
                  return (
                    <tr key={i} className={bad ? 'bg-red-50' : ''}>
                      <td className={cell(row.prefecture, !row.prefecture)}>{row.prefecture || '—'}</td>
                      <td className={cell(row.municipality, !row.municipality || muniNotFound)}>{row.municipality || '—'}</td>
                      <td className={cell(row.amount, !row.amount || isNaN(Number(row.amount)))}>
                        {row.amount ? `¥${Number(row.amount).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {row.date || <span className="text-gray-400">今日</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{row.giftItem || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-2 text-gray-700">{row.site || <span className="text-gray-400">Rakuten</span>}</td>
                      <td className="px-3 py-2 max-w-[200px]">
                        {bad
                          ? (
                            <ul className="space-y-0.5">
                              {row.errors.map((e, ei) => (
                                <li key={ei} className="text-red-600 text-[11px] leading-snug">{e}</li>
                              ))}
                            </ul>
                          )
                          : <span className="text-green-600 font-medium">✓</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {parsedRows?.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">有効な行が見つかりませんでした。</p>
      )}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

type Tab = 'manual' | 'bulk' | 'csv'

const TABS: { id: Tab; label: string }[] = [
  { id: 'manual', label: '手動入力' },
  { id: 'bulk',   label: '一括入力' },
  { id: 'csv',    label: 'CSVインポート' },
]

export default function LogPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [plans,     setPlans]     = useState<Plan[]>([])
  const [limit, setLimit]         = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('manual')

  useEffect(() => {
    setDonations(getDonations())
    setPlans(getPlans())
    const settings = loadTaxSettings()
    if (settings && settings.income > 0) setLimit(calculate(settings).limit)
  }, [])

  function handleAddDonations(items: Omit<Donation, 'id'>[]) {
    const added = items.map(d => addDonation(d))
    setDonations(prev => [...prev, ...added])
  }

  function handlePlanCompleted(planId: string) {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    const completed: Plan = { ...plan, status: 'completed' }
    updatePlan(completed)
    setPlans(prev => prev.map(p => p.id === planId ? completed : p))
  }

  function handleDelete(id: string) {
    deleteDonation(id)
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const total    = yearTotal(donations)
  const pct      = limit ? Math.min((total / limit) * 100, 100) : 0
  const overLimit = limit !== null && total > limit
  const barColour   = overLimit ? 'bg-red-500' : limit && pct >= 80 ? 'bg-amber-400' : 'bg-green-500'
  const totalColour = overLimit ? 'text-red-600' : limit && pct >= 80 ? 'text-amber-600' : 'text-green-700'

  return (
    <div className="p-4 sm:p-8 max-w-4xl">

      {/* ── running total banner ── */}
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
            <Link href="/settings" className="text-xs text-green-600 hover:underline shrink-0">
              設定で上限額を計算する →
            </Link>
          ) : overLimit ? (
            <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              上限超過
            </span>
          ) : (
            <span className="text-xs text-gray-400">残り ¥{(limit - total).toLocaleString()}</span>
          )}
        </div>
        {limit !== null && (
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColour}`}
              style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* ── tab header ── */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">寄付を記録</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── tab content ── */}
      <div className="mb-8">
        {activeTab === 'manual' && (
          <ManualTab
            onSave={handleAddDonations}
            plans={plans.filter(p => p.status === 'planned')}
            onPlanCompleted={handlePlanCompleted}
          />
        )}
        {activeTab === 'bulk'   && <BulkTab   onSave={handleAddDonations} />}
        {activeTab === 'csv'    && <CsvTab    onSave={handleAddDonations} />}
      </div>

      {/* ── donation list ── */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">記録一覧</h3>
      {donations.length === 0 ? (
        <p className="text-gray-400 text-sm">まだ記録がありません。上のフォームから追加してください。</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[...donations].sort((a, b) => b.date.localeCompare(a.date)).map(d => (
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
              <button onClick={() => handleDelete(d.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0 mt-0.5 transition-colors">
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
