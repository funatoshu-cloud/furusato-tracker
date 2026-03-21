@AGENTS.md

# App Architecture

## Pages

| Route | File | Description |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Year-filtered donation summary: stat cards, monthly bar chart, site pie chart, sortable table. Year selector (specific year or all-time). |
| `/plan` | `app/plan/page.tsx` | Furusato nozei planning: add/edit/delete plans by year, "Mark as Donated" modal that creates a real donation and marks the plan complete. |
| `/map` | `app/map/page.tsx` | Japan choropleth map. Click prefecture → zoom + municipality boundaries. Click municipality → log donation modal. Year selector. |
| `/log` | `app/log/page.tsx` | Three-tab donation entry: Manual (with optional plan link), Bulk table, CSV import. |
| `/settings` | `app/settings/page.tsx` | Tax settings for deduction limit calculation. |

## localStorage Keys

| Key | Type | Description |
|---|---|---|
| `furusato_donations` | `Donation[]` | All donation records. Managed via `lib/storage.ts`. |
| `furusato_tax_settings` | `TaxSettings` | Income / dependents / mortgage settings for limit calculation. Managed via `lib/calculator.ts`. |
| `furusato_plans` | `Plan[]` | Furusato nozei plans (intended donations). Managed via `lib/plans.ts`. |

## Key Data Types

```typescript
// lib/storage.ts
interface Donation {
  id: string; municipality: string; prefecture: string
  amount: number; date: string; giftItem: string
  site: 'Rakuten' | 'Satofull' | 'Choice' | 'Other'; notes: string
}

// lib/plans.ts
interface Plan {
  id: string; prefecture: string; municipality: string
  plannedAmount: number; targetGiftItem: string
  site: 'Rakuten' | 'Satofull' | 'Choice'
  year: number; notes: string
  status: 'planned' | 'completed' | 'cancelled'
}
```

## Cross-feature Integration

- **Dashboard → Plan**: Plans card shows active plan count + total for the selected year; links to `/plan`.
- **Map → Plans**: Prefecture popups show a 📋 "計画中" section listing planned municipalities.
- **Log → Plans**: Manual entry has an optional "Linked Plan" dropdown; selecting a plan auto-fills fields and marks the plan completed on save.
- **Plan → Log**: "Mark as Donated" button opens an inline modal that creates a `Donation` record and sets `plan.status = 'completed'`.
