export type PlanSite   = 'Rakuten' | 'Satofull' | 'Choice'
export type PlanStatus = 'planned' | 'completed' | 'cancelled'

export interface Plan {
  id: string
  prefecture: string
  municipality: string
  plannedAmount: number
  targetGiftItem: string
  site: PlanSite
  year: number
  notes: string
  status: PlanStatus
}

const STORAGE_KEY = 'furusato_plans'

export function getPlans(): Plan[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Plan[]) : []
  } catch {
    return []
  }
}

export function savePlans(plans: Plan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function addPlan(plan: Omit<Plan, 'id'>): Plan {
  const plans = getPlans()
  const newPlan: Plan = { ...plan, id: crypto.randomUUID() }
  savePlans([...plans, newPlan])
  return newPlan
}

export function updatePlan(updated: Plan): void {
  const plans = getPlans()
  savePlans(plans.map(p => (p.id === updated.id ? updated : p)))
}

export function deletePlan(id: string): void {
  savePlans(getPlans().filter(p => p.id !== id))
}
