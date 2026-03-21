import { PREFECTURES } from './prefectures'

/**
 * Maps Japanese prefecture name → zero-padded 2-digit JIS X 0401 code string.
 * e.g. '北海道' → '01', '東京都' → '13', '沖縄県' → '47'
 */
export const PREF_CODE: Record<string, string> = Object.fromEntries(
  PREFECTURES.map((p, i) => [p, String(i + 1).padStart(2, '0')])
)
