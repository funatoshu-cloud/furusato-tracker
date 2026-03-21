/** Format a number as yen: ¥1,234,567 */
export function yen(n: number): string {
  return `¥${n.toLocaleString()}`
}
