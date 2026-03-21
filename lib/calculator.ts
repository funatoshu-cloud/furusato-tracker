/**
 * ふるさと納税 控除上限額計算ロジック（2024年度）
 *
 * 計算式：
 *   上限額 = 住民税所得割額 × 20% ÷ (90% − 所得税率 × 1.021) + 2,000
 *
 * 参考: 総務省「ふるさと納税ポータルサイト」
 */

export type FilingMethod = 'one-stop' | 'tax-return'

export interface TaxSettings {
  income: number          // 年収（円）
  dependents: number      // 扶養家族人数（配偶者含む）
  method: FilingMethod    // ワンストップ特例 or 確定申告
  hasMortgage: boolean    // 住宅ローン控除あり
  mortgageDeduction: number // 住宅ローン控除額（円）
}

export interface CalcBreakdown {
  employmentIncome: number        // 給与所得
  socialInsurance: number         // 社会保険料控除（概算）
  taxableIncomeIT: number         // 所得税の課税所得
  taxableIncomeRT: number         // 住民税の課税所得
  incomeTaxRate: number           // 所得税率
  incomeTax: number               // 所得税額（住宅ローン控除前）
  residenceTax: number            // 住民税所得割（住宅ローン控除前）
  mortgageToIncomeTax: number     // 住宅ローン控除のうち所得税から控除
  mortgageToResidenceTax: number  // 住宅ローン控除のうち住民税から控除
  adjustedResidenceTax: number    // 住民税所得割（住宅ローン控除後）
  effectiveRate: number           // フルさと納税計算に使う実効所得税率
  limit: number                   // 寄付上限額（円）
}

/** 給与所得控除 */
function employmentDeduction(income: number): number {
  if (income <= 1_625_000) return 550_000
  if (income <= 1_800_000) return Math.floor(income * 0.4) - 100_000
  if (income <= 3_600_000) return Math.floor(income * 0.3) + 80_000
  if (income <= 6_600_000) return Math.floor(income * 0.2) + 440_000
  if (income <= 8_500_000) return Math.floor(income * 0.1) + 1_100_000
  return 1_950_000
}

/** 所得税率と控除額 (千円未満切捨て後の課税所得に適用) */
function incomeTaxBracket(taxable: number): { rate: number; offset: number } {
  if (taxable <= 1_949_000) return { rate: 0.05, offset: 0 }
  if (taxable <= 3_299_000) return { rate: 0.10, offset: 97_500 }
  if (taxable <= 6_949_000) return { rate: 0.20, offset: 427_500 }
  if (taxable <= 8_999_000) return { rate: 0.23, offset: 636_000 }
  if (taxable <= 17_999_000) return { rate: 0.33, offset: 1_536_000 }
  if (taxable <= 39_999_000) return { rate: 0.40, offset: 2_796_000 }
  return { rate: 0.45, offset: 4_796_000 }
}

/** 千円未満切捨て */
function truncK(n: number): number {
  return Math.floor(n / 1_000) * 1_000
}

export function calculate(s: TaxSettings): CalcBreakdown {
  // ① 給与所得
  const employmentIncome = s.income - employmentDeduction(s.income)

  // ② 社会保険料控除（概算 15%）
  const socialInsurance = Math.floor(s.income * 0.15)

  // ③ 所得税の課税所得
  //    基礎控除 48万 + 扶養控除 38万/人
  const taxableIncomeIT = Math.max(
    0,
    truncK(employmentIncome - socialInsurance - 480_000 - s.dependents * 380_000),
  )

  // ④ 住民税の課税所得
  //    基礎控除 43万 + 扶養控除 33万/人
  const taxableIncomeRT = Math.max(
    0,
    truncK(employmentIncome - socialInsurance - 430_000 - s.dependents * 330_000),
  )

  // ⑤ 所得税額（住宅ローン控除前）
  const { rate, offset } = incomeTaxBracket(taxableIncomeIT)
  const incomeTax = Math.max(0, Math.floor(taxableIncomeIT * rate) - offset)

  // ⑥ 住民税所得割（調整控除後）
  //    調整控除 = min(人的控除差合計, 課税標準×5%)
  //    人的控除差 = 基礎控除差5万 + 扶養控除差5万/人
  const personDiff = 50_000 + s.dependents * 50_000
  const adjustmentDeduction = Math.min(personDiff, Math.floor(taxableIncomeRT * 0.05))
  const residenceTax = Math.max(0, Math.floor(taxableIncomeRT * 0.10) - adjustmentDeduction)

  // ⑦ 住宅ローン控除の適用
  let mortgageToIncomeTax = 0
  let mortgageToResidenceTax = 0
  let effectiveRate = rate

  if (s.hasMortgage && s.mortgageDeduction > 0) {
    // 所得税から控除
    mortgageToIncomeTax = Math.min(s.mortgageDeduction, incomeTax)

    // 余剰分を住民税から控除（上限: 住民税所得割×5% かつ 97,500円）
    const remainder = s.mortgageDeduction - mortgageToIncomeTax
    const rtMortgageCap = Math.min(Math.floor(residenceTax * 0.05), 97_500)
    mortgageToResidenceTax = Math.min(remainder, rtMortgageCap)

    // 住宅ローン控除で所得税が0になった場合、
    // ふるさと納税計算上の所得税率も0として扱う
    if (mortgageToIncomeTax >= incomeTax) {
      effectiveRate = 0
    }
  }

  // ⑧ 住民税所得割（住宅ローン控除後）
  const adjustedResidenceTax = Math.max(0, residenceTax - mortgageToResidenceTax)

  // ⑨ ふるさと納税上限額
  //    上限 = 住民税所得割 × 20% ÷ (90% − 所得税率 × 1.021) + 2,000
  const denominator = 0.9 - effectiveRate * 1.021
  const limit = denominator > 0
    ? Math.floor((adjustedResidenceTax * 0.2) / denominator) + 2_000
    : 2_000

  return {
    employmentIncome,
    socialInsurance,
    taxableIncomeIT,
    taxableIncomeRT,
    incomeTaxRate: rate,
    incomeTax,
    residenceTax,
    mortgageToIncomeTax,
    mortgageToResidenceTax,
    adjustedResidenceTax,
    effectiveRate,
    limit: Math.max(2_000, limit),
  }
}

const SETTINGS_KEY = 'furusato_tax_settings'

export function loadTaxSettings(): TaxSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveTaxSettings(s: TaxSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}
