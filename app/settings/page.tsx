'use client'

import { useEffect, useState } from 'react'
import { getDonations, saveDonations } from '@/lib/storage'
import { yen } from '@/lib/format'
import {
  calculate,
  loadTaxSettings,
  saveTaxSettings,
  type TaxSettings,
  type CalcBreakdown,
  type FilingMethod,
} from '@/lib/calculator'

const DEFAULT_SETTINGS: TaxSettings = {
  income: 0,
  dependents: 0,
  method: 'one-stop',
  hasMortgage: false,
  mortgageDeduction: 0,
}

export default function SettingsPage() {
  // ── calculator state ──────────────────────────────────────────────
  const [form, setForm] = useState<TaxSettings>(DEFAULT_SETTINGS)
  const [result, setResult] = useState<CalcBreakdown | null>(null)

  useEffect(() => {
    const saved = loadTaxSettings()
    if (saved) setForm(saved)
  }, [])

  function handleCalc(e: React.FormEvent) {
    e.preventDefault()
    if (!form.income) return
    saveTaxSettings(form)
    setResult(calculate(form))
  }

  // ── info modal ────────────────────────────────────────────────────
  const [showInfo, setShowInfo] = useState(false)

  // ── data management state ─────────────────────────────────────────
  const [cleared, setCleared] = useState(false)
  const [imported, setImported] = useState(false)
  const [importError, setImportError] = useState('')

  function handleExport() {
    const donations = getDonations()
    const blob = new Blob([JSON.stringify(donations, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `furusato-donations-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(data)) throw new Error('Invalid format')
        saveDonations(data)
        setImported(true)
        setImportError('')
        setTimeout(() => setImported(false), 2000)
      } catch {
        setImportError('ファイルの形式が正しくありません。')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (!confirm('すべての寄付データを削除しますか？この操作は元に戻せません。')) return
    saveDonations([])
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  // ── notes based on inputs ─────────────────────────────────────────
  const notes: string[] = []
  if (form.method === 'one-stop') {
    notes.push('ワンストップ特例は寄付先が5自治体以内の場合のみ利用できます。')
    if (form.hasMortgage)
      notes.push(
        '住宅ローン控除の初年度は確定申告が必要なため、ワンストップ特例は利用できません。2年目以降（年末調整対応済み）は利用可能です。',
      )
  }
  if (form.method === 'tax-return') {
    notes.push('確定申告で申告する場合、寄付先の数に制限はありません。')
  }
  if (form.hasMortgage && result && result.mortgageToResidenceTax > 0) {
    notes.push(
      `住宅ローン控除により住民税が ${yen(result.mortgageToResidenceTax)} 減額されており、ふるさと納税の上限額に影響しています。`,
    )
  }
  if (form.hasMortgage && result && result.effectiveRate === 0) {
    notes.push(
      '住宅ローン控除により所得税が0円になっているため、ふるさと納税の所得税還付はありません。上限額の計算では所得税率0%として扱っています。',
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">設定</h2>

      {/* ── ふるさと納税とは？ explainer ── */}
      <FurusatoExplainer />

      {/* ── 控除上限額 シミュレーター ── */}
      <section className="bg-white rounded-xl border border-green-200">
        <div className="px-6 py-4 border-b border-green-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">控除上限額シミュレーター</h3>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors"
              aria-label="使い方を見る"
            >
              ?
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">2024年（令和6年）度 給与所得者向け</p>
        </div>

        {/* info modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowInfo(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-gray-900">シミュレーターの使い方</h4>
                <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
              </div>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>年収・扶養家族・申告方法を入力すると、ふるさと納税の<strong className="text-gray-900">控除上限額の目安</strong>を計算します。</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                  <strong>この計算はあくまで目安です。</strong><br />
                  社会保険料は年収15%で概算しており、医療費控除・配当控除・事業所得などは反映されません。正確な金額は税理士や各自治体の窓口へご確認ください。
                </div>
                <ul className="space-y-1.5 text-xs text-gray-500 list-disc list-inside">
                  <li>計算結果は自動でローカル保存され、記録ページの上限額表示に反映されます</li>
                  <li>ワンストップ特例は寄付先が5自治体以内の場合に利用できます</li>
                  <li>住宅ローン控除を受けている場合は必ずチェックを入れてください</li>
                </ul>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-5 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleCalc} className="p-6 space-y-5">
          {/* 年収 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              年収（税込）<span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                className="input pr-8"
                type="number"
                min={0}
                step={10000}
                placeholder="例: 5000000"
                value={form.income || ''}
                onChange={(e) => setForm({ ...form, income: Number(e.target.value) })}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                円
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              源泉徴収票の「<strong className="text-gray-500">支払金額</strong>」（税・社会保険料を引く前の額面年収）を入力してください。
              給与明細の月収 × 12ではなく、必ず源泉徴収票でご確認ください。
            </p>
          </div>

          {/* 扶養家族 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              扶養家族人数（配偶者含む）
            </label>
            <select
              className="input"
              value={form.dependents}
              onChange={(e) => setForm({ ...form, dependents: Number(e.target.value) })}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? '0人（単身・共働き）' : `${n}人`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              税法上の扶養控除の対象となる方の人数です。
              専業主婦・夫の配偶者（年収103万円以下）や
              <strong className="text-gray-500">16歳以上</strong>の子供が対象です。
              16歳未満の子供・共働きの配偶者は含みません。
            </p>
          </div>

          {/* 申告方法 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">申告方法</label>
            <div className="flex gap-4">
              {(
                [
                  { value: 'one-stop', label: 'ワンストップ特例' },
                  { value: 'tax-return', label: '確定申告' },
                ] as { value: FilingMethod; label: string }[]
              ).map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value={value}
                    checked={form.method === value}
                    onChange={() => setForm({ ...form, method: value })}
                    className="accent-green-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                <p className="font-semibold text-gray-700 mb-0.5">ワンストップ特例</p>
                寄付先が<strong>5自治体以内</strong>の給与所得者向け。各自治体に申請書を郵送するだけで確定申告不要。
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                <p className="font-semibold text-gray-700 mb-0.5">確定申告</p>
                <strong>6自治体以上</strong>または自営業・フリーランスの方。制限なく寄付できるが、確定申告での申告が必要。
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">※ 上限額の計算式はどちらも同じです。</p>
          </div>

          {/* 住宅ローン控除 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={form.hasMortgage}
                onChange={(e) => setForm({ ...form, hasMortgage: e.target.checked })}
                className="accent-green-600 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">住宅ローン控除を受けている</span>
            </label>
            {form.hasMortgage && (
              <div className="ml-6">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  住宅ローン控除額（年末調整・確定申告書の控除額）
                </label>
                <div className="relative">
                  <input
                    className="input pr-8"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="例: 200000"
                    value={form.mortgageDeduction || ''}
                    onChange={(e) =>
                      setForm({ ...form, mortgageDeduction: Number(e.target.value) })
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    円
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  源泉徴収票の「<strong className="text-gray-500">住宅借入金等特別控除の額</strong>」をご確認ください。
                  住宅ローン控除は所得税から優先適用されるため、控除額が大きいとふるさと納税の節税効果が住民税ルートのみとなり、上限額が下がる場合があります。
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            上限額を計算する
          </button>
        </form>

        {/* ── 計算結果 ── */}
        {result && (
          <div className="px-6 pb-6 space-y-4">
            {/* 上限額 大表示 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-xs text-green-700 font-medium mb-1">2024年の目安上限額</p>
              <p className="text-4xl font-bold text-green-700 tracking-tight">
                ¥{result.limit.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ※ 自己負担2,000円を含む寄付総額の目安
              </p>
            </div>

            {/* 計算内訳 */}
            <details className="group">
              <summary className="text-xs font-medium text-gray-500 cursor-pointer select-none list-none flex items-center gap-1">
                <span className="group-open:hidden">▶</span>
                <span className="hidden group-open:inline">▼</span>
                計算内訳を見る
              </summary>
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100 text-xs">
                <Row label="給与所得" value={result.employmentIncome} />
                <Row label="社会保険料控除（概算15%）" value={result.socialInsurance} />
                <Row label="所得税の課税所得" value={result.taxableIncomeIT} />
                <Row label="所得税率" value={`${(result.incomeTaxRate * 100).toFixed(0)}%`} plain />
                <Row label="所得税額（住宅ローン控除前）" value={result.incomeTax} />
                {form.hasMortgage && (
                  <>
                    <Row label="　うち住宅ローン控除（所得税から）" value={result.mortgageToIncomeTax} />
                    <Row label="　うち住宅ローン控除（住民税から）" value={result.mortgageToResidenceTax} />
                  </>
                )}
                <Row label="住民税の課税所得" value={result.taxableIncomeRT} />
                <Row label="住民税所得割（調整控除後）" value={result.residenceTax} />
                {form.hasMortgage && result.mortgageToResidenceTax > 0 && (
                  <Row label="住民税所得割（住宅ローン控除後）" value={result.adjustedResidenceTax} />
                )}
                <Row
                  label="ふるさと納税計算の所得税率"
                  value={`${(result.effectiveRate * 100).toFixed(0)}%`}
                  plain
                />
                <Row label="上限額" value={result.limit} highlight />
              </div>
            </details>

            {/* 注意書き */}
            {notes.length > 0 && (
              <div className="space-y-1.5">
                {notes.map((n, i) => (
                  <div key={i} className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="shrink-0">⚠</span>
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 免責 */}
            <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 leading-relaxed border border-gray-100">
              <strong className="text-gray-500">免責事項：</strong>
              この計算はあくまで目安であり、実際の控除額は個人の状況によって異なります。
              社会保険料は年収の15%で概算しており、実際の金額と差異が生じる場合があります。
              また、医療費控除・配当控除・事業所得等は考慮していません。
              正確な金額は税理士や各自治体の窓口にご確認ください。
            </div>
          </div>
        )}
      </section>

      {/* ── データ管理 ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">データのエクスポート</h3>
        <p className="text-xs text-gray-500 mb-4">寄付データをJSONファイルとしてダウンロードします。</p>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          エクスポート
        </button>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">データのインポート</h3>
        <p className="text-xs text-gray-500 mb-4">
          以前エクスポートしたJSONファイルをインポートします（既存データは上書きされます）。
        </p>
        <label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg cursor-pointer transition-colors">
          ファイルを選択
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        {imported && <span className="ml-3 text-sm text-green-600">インポートしました！</span>}
        {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}
      </section>

      <section className="bg-white rounded-xl border border-red-100 p-6">
        <h3 className="text-sm font-semibold text-red-700 mb-1">データの削除</h3>
        <p className="text-xs text-gray-500 mb-4">
          すべての寄付データを削除します。この操作は取り消せません。
        </p>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          すべて削除
        </button>
        {cleared && <span className="ml-3 text-sm text-green-600">削除しました。</span>}
      </section>
    </div>
  )
}

// ── beginner explainer ────────────────────────────────────────────────────────

function FurusatoExplainer() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl select-none">🗾</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">ふるさと納税とは？</p>
            <p className="text-xs text-gray-400 mt-0.5">仕組み・用語・手続きの基本を確認する</p>
          </div>
        </div>
        <span className={`text-gray-300 transition-transform duration-200 text-sm select-none ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">

          <ExplainerItem icon="💡" title="基本の仕組み">
            全国の自治体に寄付をすると、<strong className="text-gray-800">2,000円を超えた金額が翌年の所得税・住民税から控除（還付）</strong>されます。
            返礼品（お礼の品）ももらえるため、実質的に食費や日用品を節税しながら受け取れる制度です。
          </ExplainerItem>

          <ExplainerItem icon="💰" title="自己負担2,000円のルール">
            何か所に寄付しても、どれだけの金額を寄付しても、<strong className="text-gray-800">自己負担は一律2,000円だけ</strong>です。
            ただし、これは控除上限額の範囲内で寄付した場合のみ。上限を超えた分は全額自己負担になります。
          </ExplainerItem>

          <ExplainerItem icon="📊" title="控除上限額とは">
            「2,000円の自己負担で済む寄付額の上限」のことです。
            <strong className="text-gray-800">年収・家族構成によって異なり</strong>、年収300万円で約2万円、500万円で約6万円、700万円で約11万円が目安です。
            下のシミュレーターで正確な金額を計算できます。
          </ExplainerItem>

          <ExplainerItem icon="📋" title="ワンストップ特例 vs 確定申告">
            <strong className="text-gray-800">ワンストップ特例</strong>は寄付先が5自治体以内の給与所得者向け。
            寄付の都度、各自治体に申請書を郵送するだけで確定申告不要です（1月10日必着）。
            6自治体以上または自営業の方は<strong className="text-gray-800">確定申告</strong>で申告します。
          </ExplainerItem>

          <ExplainerItem icon="📄" title="寄附金受領証明書とは">
            寄付後に各自治体から送られてくる書類です。
            <strong className="text-gray-800">確定申告する方は必ず保管</strong>してください。
            ワンストップ特例を使う方は申請書を送れば不要ですが、念のため保管しておくと安心です。
            このアプリの寄付一覧で受取状況を管理できます。
          </ExplainerItem>

        </div>
      )}
    </div>
  )
}

function ExplainerItem({
  icon, title, children,
}: {
  icon: string; title: string; children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0 select-none mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  plain,
  highlight,
}: {
  label: string
  value: number | string
  plain?: boolean
  highlight?: boolean
}) {
  const formatted =
    plain
      ? value
      : typeof value === 'number'
      ? `¥${value.toLocaleString()}`
      : value

  return (
    <div
      className={`flex justify-between items-center px-4 py-2 ${
        highlight ? 'bg-green-50 font-semibold text-green-800' : 'text-gray-600'
      }`}
    >
      <span className={highlight ? 'text-green-700' : ''}>{label}</span>
      <span className={highlight ? 'text-green-700' : 'tabular-nums'}>{formatted}</span>
    </div>
  )
}
