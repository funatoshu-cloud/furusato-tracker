'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getPlans, addPlan, updatePlan, deletePlan,
  type Plan, type PlanSite, type PlanStatus,
} from '@/lib/plans'
import { addDonation, getDonations } from '@/lib/storage'
import { loadTaxSettings, calculate } from '@/lib/calculator'
import { PREFECTURES } from '@/lib/prefectures'
import { yen } from '@/lib/format'

// ── constants ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const TODAY = new Date().toISOString().slice(0, 10)

const SITES: PlanSite[] = ['Rakuten', 'Satofull', 'Choice']
const SITE_LABELS: Record<PlanSite, string> = {
  Rakuten:  '楽天ふるさと納税',
  Satofull: 'さとふる',
  Choice:   'ふるさとチョイス',
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  planned:   '計画中',
  completed: '寄付済み',
  cancelled: 'キャンセル',
}
const STATUS_STYLES: Record<PlanStatus, string> = {
  planned:   'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

// ── empty form helpers ─────────────────────────────────────────────────────────

type PlanFormData = Omit<Plan, 'id'>

function emptyForm(year: number): PlanFormData {
  return {
    prefecture: PREFECTURES[12], // 東京都 default
    municipality: '',
    plannedAmount: 10000,
    targetGiftItem: '',
    site: 'Rakuten',
    year,
    notes: '',
    status: 'planned',
  }
}

// ── Mark as Donated modal ──────────────────────────────────────────────────────

interface DonateModalProps {
  plan: Plan
  onClose: () => void
  onSave: (plan: Plan) => void
}

function DonateModal({ plan, onClose, onSave }: DonateModalProps) {
  const [amount,    setAmount]    = useState(String(plan.plannedAmount))
  const [date,      setDate]      = useState(TODAY)
  const [giftItem,  setGiftItem]  = useState(plan.targetGiftItem)
  const [site,      setSite]      = useState(plan.site)
  const [notes,     setNotes]     = useState(plan.notes)
  const [saved,     setSaved]     = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amtNum = parseInt(amount, 10)
    if (!amtNum || amtNum <= 0 || !giftItem.trim() || !date) return

    addDonation({
      prefecture:   plan.prefecture,
      municipality: plan.municipality,
      amount:       amtNum,
      date,
      giftItem:     giftItem.trim(),
      site:         site as import('@/lib/storage').DonationSite,
      notes:        notes.trim(),
    })
    const completed: Plan = { ...plan, status: 'completed' }
    updatePlan(completed)
    onSave(completed)
    setSaved(true)
    setTimeout(() => onClose(), 1500)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {saved ? (
          <div className="py-8 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-medium text-green-700">保存しました！</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-base font-semibold text-gray-900">寄付として記録する</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {plan.prefecture}　{plan.municipality}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    金額（円）<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    寄付日<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={TODAY}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  返礼品名<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：黒毛和牛 1kg"
                  value={giftItem}
                  onChange={e => setGiftItem(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">サイト</label>
                <select
                  value={site}
                  onChange={e => setSite(e.target.value as PlanSite)}
                  className="input"
                >
                  {SITES.map(s => (
                    <option key={s} value={s}>{SITE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  寄付として保存
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ── Add / Edit plan modal ──────────────────────────────────────────────────────

interface PlanModalProps {
  initial: PlanFormData
  onClose: () => void
  onSave: (data: PlanFormData) => void
  title: string
}

function PlanModal({ initial, onClose, onSave, title }: PlanModalProps) {
  const [form, setForm] = useState<PlanFormData>(initial)

  function set<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.municipality.trim() || !form.plannedAmount) return
    onSave({ ...form, municipality: form.municipality.trim() })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                都道府県<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                value={form.prefecture}
                onChange={e => set('prefecture', e.target.value)}
                className="input"
              >
                {PREFECTURES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                市区町村<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例：上富良野町"
                value={form.municipality}
                onChange={e => set('municipality', e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                予定金額（円）<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.plannedAmount}
                onChange={e => set('plannedAmount', parseInt(e.target.value, 10) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">年度</label>
              <input
                type="number"
                min={2020}
                max={2099}
                value={form.year}
                onChange={e => set('year', parseInt(e.target.value, 10) || CURRENT_YEAR)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">希望返礼品</label>
            <input
              type="text"
              placeholder="例：黒毛和牛 1kg"
              value={form.targetGiftItem}
              onChange={e => set('targetGiftItem', e.target.value)}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">サイト</label>
              <select
                value={form.site}
                onChange={e => set('site', e.target.value as PlanSite)}
                className="input"
              >
                {SITES.map(s => (
                  <option key={s} value={s}>{SITE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as PlanStatus)}
                className="input"
              >
                {(['planned', 'completed', 'cancelled'] as PlanStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="input resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const [plans,       setPlans]       = useState<Plan[]>([])
  const [limit,       setLimit]       = useState<number | null>(null)
  const [totalDonated, setTotalDonated] = useState(0)
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  // modals
  const [addModal,    setAddModal]    = useState(false)
  const [editTarget,  setEditTarget]  = useState<Plan | null>(null)
  const [donateTarget, setDonateTarget] = useState<Plan | null>(null)

  useEffect(() => {
    setPlans(getPlans())
    const s = loadTaxSettings()
    if (s && s.income > 0) setLimit(calculate(s).limit)
  }, [])

  // Re-derive donated total whenever selectedYear changes
  useEffect(() => {
    const donations = getDonations()
    const total = donations
      .filter(d => d.date.startsWith(String(selectedYear)))
      .reduce((sum, d) => sum + d.amount, 0)
    setTotalDonated(total)
  }, [selectedYear])

  // ── derived ────────────────────────────────────────────────────────────────

  const yearPlans = useMemo(
    () => plans.filter(p => p.year === selectedYear),
    [plans, selectedYear],
  )

  const activePlans = useMemo(
    () => yearPlans.filter(p => p.status !== 'cancelled'),
    [yearPlans],
  )

  const totalPlanned = useMemo(
    () => activePlans.reduce((sum, p) => sum + p.plannedAmount, 0),
    [activePlans],
  )

  const plannedNotDone = useMemo(
    () => activePlans
      .filter(p => p.status === 'planned')
      .reduce((sum, p) => sum + p.plannedAmount, 0),
    [activePlans],
  )

  const remainingLimit    = limit !== null ? limit - totalDonated : null
  const unplannedBudget   = remainingLimit !== null ? remainingLimit - plannedNotDone : null

  const progressPct = limit && limit > 0
    ? Math.min(100, Math.round((totalPlanned / limit) * 100))
    : null

  // available years = union of plan years + current year
  const availableYears = useMemo(() => {
    const years = new Set(plans.map(p => p.year))
    years.add(CURRENT_YEAR)
    return [...years].sort((a, b) => b - a)
  }, [plans])

  // ── handlers ──────────────────────────────────────────────────────────────

  function handleAddPlan(data: PlanFormData) {
    const newPlan = addPlan(data)
    setPlans(prev => [...prev, newPlan])
    setAddModal(false)
  }

  function handleEditPlan(data: PlanFormData) {
    if (!editTarget) return
    const updated: Plan = { ...editTarget, ...data }
    updatePlan(updated)
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditTarget(null)
  }

  function handleDeletePlan(id: string) {
    if (!confirm('このプランを削除しますか？')) return
    deletePlan(id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  function handleDonated(completed: Plan) {
    setPlans(prev => prev.map(p => p.id === completed.id ? completed : p))
    // refresh donated total
    const donations = getDonations()
    const total = donations
      .filter(d => d.date.startsWith(String(selectedYear)))
      .reduce((sum, d) => sum + d.amount, 0)
    setTotalDonated(total)
    setDonateTarget(null)
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-6">

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">プラン</h2>
          <p className="text-sm text-gray-500 mt-0.5">今年の寄付先を計画・管理できます</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="input !py-1.5 !text-sm w-28"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <button
            onClick={() => setAddModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors whitespace-nowrap"
          >
            ＋ プランを追加
          </button>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="計画合計"
          value={yen(totalPlanned)}
          sub={`${activePlans.length} 件`}
          accent={totalPlanned > 0 ? 'blue' : 'default'}
        />
        <SummaryCard
          label={`${selectedYear}年 寄付済み`}
          value={yen(totalDonated)}
          accent={totalDonated > 0 ? 'green' : 'default'}
        />
        <SummaryCard
          label="残り寄付枠"
          value={remainingLimit === null ? '—' : remainingLimit < 0 ? `¥0（超過）` : yen(remainingLimit)}
          sub={limit === null ? '設定で上限を計算' : `上限 ${yen(limit)}`}
          accent={remainingLimit !== null && remainingLimit < 0 ? 'red' : 'default'}
        />
        <SummaryCard
          label="未計画の残り予算"
          value={unplannedBudget === null ? '—' : unplannedBudget < 0 ? `¥0（超過）` : yen(unplannedBudget)}
          sub={unplannedBudget !== null && unplannedBudget < 0 ? '計画が予算を超えています' : undefined}
          accent={unplannedBudget !== null && unplannedBudget < 0 ? 'red' : 'default'}
        />
      </div>

      {/* progress bar */}
      {progressPct !== null && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>計画予算の使用率</span>
            <span className="font-medium text-gray-700">{progressPct}%　{yen(totalPlanned)} / {yen(limit!)}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progressPct >= 100 ? 'bg-red-400' :
                progressPct >= 80  ? 'bg-amber-400' :
                'bg-blue-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* plan list */}
      <section className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{selectedYear}年 プラン一覧</h3>
          <span className="text-xs text-gray-400">{yearPlans.length} 件</span>
        </div>

        {yearPlans.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">まだプランがありません。</p>
            <button
              onClick={() => setAddModal(true)}
              className="text-xs text-green-600 hover:underline"
            >
              プランを追加する →
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {yearPlans.map(plan => (
              <PlanRow
                key={plan.id}
                plan={plan}
                onEdit={() => setEditTarget(plan)}
                onDelete={() => handleDeletePlan(plan.id)}
                onDonate={() => setDonateTarget(plan)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* modals */}
      {addModal && (
        <PlanModal
          title="プランを追加"
          initial={emptyForm(selectedYear)}
          onClose={() => setAddModal(false)}
          onSave={handleAddPlan}
        />
      )}
      {editTarget && (
        <PlanModal
          title="プランを編集"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditPlan}
        />
      )}
      {donateTarget && (
        <DonateModal
          plan={donateTarget}
          onClose={() => setDonateTarget(null)}
          onSave={handleDonated}
        />
      )}
    </div>
  )
}

// ── PlanRow ───────────────────────────────────────────────────────────────────

function PlanRow({
  plan,
  onEdit,
  onDelete,
  onDonate,
}: {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
  onDonate: () => void
}) {
  return (
    <li className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {plan.prefecture}　{plan.municipality}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[plan.status]}`}>
            {STATUS_LABELS[plan.status]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="font-semibold text-gray-800 tabular-nums">{yen(plan.plannedAmount)}</span>
          {plan.targetGiftItem && (
            <span className="max-w-[200px] truncate" title={plan.targetGiftItem}>
              {plan.targetGiftItem}
            </span>
          )}
          <span>{SITE_LABELS[plan.site]}</span>
          {plan.notes && (
            <span className="text-gray-400 max-w-[180px] truncate" title={plan.notes}>
              {plan.notes}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {plan.status === 'planned' && (
          <button
            onClick={onDonate}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors whitespace-nowrap"
          >
            寄付として記録
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          編集
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          削除
        </button>
      </div>
    </li>
  )
}

// ── SummaryCard ───────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  accent = 'default',
}: {
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'blue' | 'red' | 'default'
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
    </div>
  )
}
