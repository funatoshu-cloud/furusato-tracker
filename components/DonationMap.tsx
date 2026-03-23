'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DONATION_CATEGORIES, type Donation, type DonationSite, type DonationCategory } from '@/lib/storage'
import { getPlans, addPlan, type Plan, type PlanSite } from '@/lib/plans'
import { PREF_CODE } from '@/lib/prefectureCodes'
import { getMuniGifts, getPrefGiftMunis, ALL_GIFT_PREFS, type GiftItem } from '@/lib/giftCatalog'

// ── types ─────────────────────────────────────────────────────────────────────

interface GeoFeature {
  type: 'Feature'
  properties: Record<string, string | number | null>
  geometry: object
}

interface GeoData {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

// ── color scale (prefecture choropleth) ───────────────────────────────────────

const NO_DONATION_COLOR = '#e5e7eb'

// Light orange → deep red  [254,215,170] → [153,27,27]
function amountToColor(amount: number, maxAmount: number): string {
  if (amount <= 0 || maxAmount <= 0) return NO_DONATION_COLOR
  const ratio = Math.log1p(amount) / Math.log1p(maxAmount)
  const r = Math.round(254 + (153 - 254) * ratio)
  const g = Math.round(215 + (27  - 215) * ratio)
  const b = Math.round(170 + (27  - 170) * ratio)
  return `rgb(${r},${g},${b})`
}

const LEGEND_STEPS = [
  { label: '未寄付',      color: NO_DONATION_COLOR },
  { label: '〜¥10,000',  color: 'rgb(254,215,170)' },
  { label: '〜¥50,000',  color: 'rgb(235,150,110)' },
  { label: '〜¥100,000', color: 'rgb(204,80,60)'   },
  { label: '¥100,000〜', color: 'rgb(153,27,27)'   },
]

// ── municipality layer colors ──────────────────────────────────────────────────

const JAPAN_BOUNDS       = L.latLngBounds([[24, 122], [46, 148]])
const MUNI_FILL          = '#bfdbfe'  // blue-200   — no data
const MUNI_FILL_CATALOG  = '#fef3c7'  // amber-100  — has catalog data, no donation/plan
const MUNI_FILL_PLAN     = '#ddd6fe'  // violet-200 — has active plan, no donation
const MUNI_FILL_DONE     = '#86efac'  // green-300  — has donation
const MUNI_STROKE        = '#60a5fa'  // blue-400
const MUNI_HIGHLIGHT     = '#22c55e'  // green-500
const PREF_DIM           = 0.25       // fillOpacity for non-selected prefectures
const PREF_PLAN_COLOR    = '#93c5fd'  // blue-300   — prefecture with plans, no donation
const PREF_CATALOG_COLOR = '#fde68a'  // amber-200  — prefecture with catalog, no donation/plan

const PLAN_SITES: PlanSite[] = ['Rakuten', 'Satofull', 'Choice']
const CURRENT_YEAR = new Date().getFullYear()

// ── site config for modal ─────────────────────────────────────────────────────

const SITES: DonationSite[] = ['Rakuten', 'Satofull', 'Choice', 'Other']
const SITE_LABELS: Record<DonationSite, string> = {
  Rakuten:  '楽天ふるさと納税',
  Satofull: 'さとふる',
  Choice:   'ふるさとチョイス',
  Other:    'その他',
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const AFFILIATE_LINKS_HTML = `
  <div style="padding-top:8px;border-top:1px solid #e5e7eb;">
    <p style="font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:.06em;text-transform:uppercase;margin:0 0 6px;">
      返礼品を探す
      <span style="font-size:9px;font-weight:400;color:#d1d5db;margin-left:4px;">※広告リンク</span>
    </p>
    <div style="display:flex;flex-direction:column;gap:5px;">
      <a href="https://item.rakuten.co.jp/furusato/" target="_blank" rel="noopener noreferrer"
         style="display:flex;align-items:center;gap:6px;font-size:12px;color:#bf0000;text-decoration:none;padding:5px 8px;background:#fff5f5;border-radius:6px;border:1px solid #fecaca;">
        <span>🛒</span><span>楽天ふるさと納税</span>
      </a>
      <a href="https://www.satofull.jp/" target="_blank" rel="noopener noreferrer"
         style="display:flex;align-items:center;gap:6px;font-size:12px;color:#1d4ed8;text-decoration:none;padding:5px 8px;background:#eff6ff;border-radius:6px;border:1px solid #bfdbfe;">
        <span>🛒</span><span>さとふる</span>
      </a>
      <a href="https://www.furusato-tax.jp/" target="_blank" rel="noopener noreferrer"
         style="display:flex;align-items:center;gap:6px;font-size:12px;color:#065f46;text-decoration:none;padding:5px 8px;background:#ecfdf5;border-radius:6px;border:1px solid #a7f3d0;">
        <span>🛒</span><span>ふるさとチョイス</span>
      </a>
    </div>
  </div>`

// ── Prefecture popup helpers ──────────────────────────────────────────────────

/** Top summary bar: donated X件 ¥X  |  planned X件 ¥X */
function buildSummaryHtml(
  donCount: number, donTotal: number,
  planCount: number, planTotal: number,
): string {
  const col = (label: string, color: string, total: number, count: number) => `
    <div style="flex:1;min-width:0;">
      <div style="font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:.05em;text-transform:uppercase;margin-bottom:2px;">${label}</div>
      <div style="font-size:15px;font-weight:700;color:${color};white-space:nowrap;">¥${total.toLocaleString()}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:1px;">${count}件</div>
    </div>`
  const divider = `<div style="width:1px;background:#e5e7eb;flex-shrink:0;margin:2px 0;"></div>`
  return `
    <div style="display:flex;gap:10px;align-items:stretch;padding:8px 10px;background:#f9fafb;border:1px solid #f0f0f0;border-radius:8px;margin-bottom:10px;">
      ${col('寄付済み', donCount > 0 ? '#16a34a' : '#d1d5db', donTotal, donCount)}
      ${planCount > 0 ? divider + col('計画中', '#7c3aed', planTotal, planCount) : ''}
    </div>`
}

/** Municipality list for active plans */
function buildPlansDetailHtml(plans: Plan[]): string {
  if (plans.length === 0) return ''
  const rows = plans.slice(0, 4).map(p => `
    <div style="font-size:12px;padding:2px 0;display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid #f3f4f6;">
      <span style="color:#6b7280;">${esc(p.municipality)}</span>
      <span style="font-weight:600;white-space:nowrap;color:#7c3aed;">¥${p.plannedAmount.toLocaleString()}</span>
    </div>`).join('')
  const more = plans.length > 4
    ? `<p style="font-size:11px;color:#9ca3af;margin:3px 0 0;">他${plans.length - 4}件…</p>` : ''
  return `
    <div style="padding-top:8px;border-top:1px solid #e5e7eb;margin-top:6px;">
      <p style="font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:.06em;text-transform:uppercase;margin:0 0 5px;">📋 計画中の自治体</p>
      ${rows}${more}
    </div>`
}

function buildPrefPopupHtml(
  prefName: string,
  allDs: Donation[],
  year: number | 'all',
  activePlans: Plan[],
): string {
  const W = 'min-width:240px;font-family:system-ui,-apple-system,sans-serif;'
  const header = `<h3 style="font-size:15px;font-weight:700;margin:0 0 10px;color:#111827;">${esc(prefName)}</h3>`

  // Slice both datasets to the selected year
  const yearDs    = year === 'all' ? allDs    : allDs.filter(d => d.date.startsWith(String(year)))
  const yearPlans = year === 'all' ? activePlans : activePlans.filter(p => p.year === year)

  const donCount  = yearDs.length
  const donTotal  = yearDs.reduce((s, d) => s + d.amount, 0)
  const planCount = yearPlans.length
  const planTotal = yearPlans.reduce((s, p) => s + p.plannedAmount, 0)

  const hasAny = donCount > 0 || planCount > 0
  const summary = hasAny ? buildSummaryHtml(donCount, donTotal, planCount, planTotal) : ''

  // Plans detail section (all active plans, regardless of year — they're future-facing)
  const plansDetail = buildPlansDetailHtml(activePlans)

  // Gift catalog section — shown when any municipalities in this prefecture have catalog entries
  const catalogMunis = getPrefGiftMunis(prefName)
  const catalogSection = catalogMunis.size > 0 ? `
    <div style="padding:7px 10px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;margin-bottom:8px;">
      <p style="font-size:11px;font-weight:700;color:#b45309;margin:0 0 2px;">🎁 返礼品情報あり</p>
      <p style="font-size:11px;color:#78350f;margin:0;">${catalogMunis.size}自治体の返礼品データがあります。クリックして探しましょう。</p>
    </div>` : ''

  // ── No data at all ───────────────────────────────────────────────────────────
  if (!hasAny && activePlans.length === 0) {
    return `<div style="${W}">${header}
      ${catalogSection}
      <p style="font-size:13px;color:#d1d5db;margin:0 0 10px;">まだ寄付・プランがありません</p>
      ${AFFILIATE_LINKS_HTML}
    </div>`
  }

  // ── Only plans, no donations ─────────────────────────────────────────────────
  if (donCount === 0) {
    return `<div style="${W}">${header}
      ${catalogSection}
      ${summary}
      ${plansDetail}
      ${AFFILIATE_LINKS_HTML}
    </div>`
  }

  // ── All years: year-breakdown table ─────────────────────────────────────────
  if (year === 'all') {
    const byYear: Record<string, number> = {}
    for (const d of allDs) {
      const y = d.date.slice(0, 4)
      byYear[y] = (byYear[y] ?? 0) + d.amount
    }
    const yearRows = Object.keys(byYear)
      .sort((a, b) => Number(b) - Number(a))
      .map(y => `<tr>
        <td style="padding:2px 10px 2px 0;color:#6b7280;">${y}年</td>
        <td style="padding:2px 0;font-weight:600;color:#111827;white-space:nowrap;">¥${byYear[y].toLocaleString()}</td>
      </tr>`).join('')
    return `<div style="${W}">${header}
      ${catalogSection}
      ${summary}
      <table style="font-size:12px;margin-bottom:10px;width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:left;font-size:10px;font-weight:600;color:#9ca3af;padding-bottom:3px;">年度</th>
          <th style="text-align:left;font-size:10px;font-weight:600;color:#9ca3af;padding-bottom:3px;">寄付合計</th>
        </tr></thead>
        <tbody>${yearRows}</tbody>
      </table>
      ${plansDetail}
      ${AFFILIATE_LINKS_HTML}
    </div>`
  }

  // ── Specific year: gift item list ────────────────────────────────────────────
  const items = yearDs.map(d => `
    <div style="font-size:12px;color:#374151;padding:3px 0;border-bottom:1px solid #f3f4f6;">
      <span style="color:#9ca3af;">${esc(d.municipality)}</span> — ${esc(d.giftItem)}
    </div>`).join('')
  return `<div style="${W}">${header}
    ${catalogSection}
    ${summary}
    <div style="margin-bottom:10px;">
      <p style="font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:.06em;text-transform:uppercase;margin:0 0 4px;">返礼品</p>
      ${items}
    </div>
    ${plansDetail}
    ${AFFILIATE_LINKS_HTML}
  </div>`
}

// ── Legend overlay (React, not a Leaflet control) ────────────────────────────

function Legend({ year, inMuniMode }: { year: number | 'all'; inMuniMode: boolean }) {
  const yearLabel = year === 'all' ? '全年度' : `${year}年`

  const muniSteps = [
    { label: '未寄付',      color: MUNI_FILL },
    { label: '返礼品あり',  color: MUNI_FILL_CATALOG },
    { label: '計画中',      color: MUNI_FILL_PLAN },
    { label: '寄付済み',    color: MUNI_FILL_DONE },
  ]

  const prefSteps = [
    { label: '未寄付',      color: NO_DONATION_COLOR },
    { label: '返礼品情報',  color: PREF_CATALOG_COLOR },
    { label: '計画中',      color: PREF_PLAN_COLOR },
    ...LEGEND_STEPS.slice(1),   // skip the existing 未寄付 entry
  ]

  const steps    = inMuniMode ? muniSteps : prefSteps
  const heading  = inMuniMode ? '市区町村' : `寄付金額（${yearLabel}）`

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 10,
        zIndex: 1000,
        background: 'white',
        padding: '10px 12px',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,.18)',
        fontFamily: 'system-ui,-apple-system,sans-serif',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
        {heading}
      </div>
      {steps.map(({ label, color }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <div
            style={{
              width: 14, height: 14, borderRadius: 3,
              background: color, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── geometry helpers ──────────────────────────────────────────────────────────

/**
 * For a Polygon/MultiPolygon feature, return the bounds of the single largest
 * connected land polygon (by bounding-box area). This avoids zooming to a bbox
 * that spans distant islands and instead centres on the main landmass.
 */
function mainLandBounds(feature: GeoFeature): L.LatLngBounds {
  const geom = feature.geometry as {
    type: string
    coordinates: number[][][] | number[][][][]
  }

  // Collect all outer rings regardless of geometry type
  const outerRings: number[][][] = []
  if (geom.type === 'Polygon') {
    outerRings.push((geom.coordinates as number[][][])[0])
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates as number[][][][]) {
      outerRings.push(poly[0])
    }
  }

  if (outerRings.length === 0) {
    return L.geoJSON(feature as unknown as GeoJSON.Feature).getBounds()
  }

  let bestBounds: L.LatLngBounds | null = null
  let bestArea = -1

  for (const ring of outerRings) {
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    for (const [lng, lat] of ring) {
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
    }
    const area = (maxLat - minLat) * (maxLng - minLng)
    if (area > bestArea) {
      bestArea = area
      bestBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng])
    }
  }

  return bestBounds ?? L.geoJSON(feature as unknown as GeoJSON.Feature).getBounds()
}

// ── MapController — programmatic zoom inside MapContainer context ─────────────

function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] })
  }, [bounds, map])
  return null
}

// ── GiftCatalogTab — tab 0: discover popular gift items ──────────────────────

const CAT_EMOJI: Record<string, string> = {
  '肉類': '🥩', '魚介類': '🐟', '野菜・果物': '🍎', '米・穀物': '🌾',
  '乳製品・加工食品': '🧀', '飲料・お酒': '🍶', '日用品・雑貨': '🧴',
  '工芸品・アート': '🎨', '体験・旅行': '✈️', 'その他': '📦',
}

function GiftCatalogTab({
  gifts,
  onSelectGift,
}: {
  gifts: GiftItem[]
  onSelectGift: (gift: GiftItem) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {gifts.map(gift => (
        <div
          key={gift.id}
          style={{
            border: `1px solid ${gift.popular ? '#fde68a' : '#f0f0f0'}`,
            borderRadius: 10,
            padding: '11px 13px',
            background: gift.popular ? '#fffbeb' : '#fafafa',
          }}
        >
          {/* name */}
          <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: '0 0 3px', lineHeight: 1.35 }}>
            {gift.popular && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#b45309',
                background: '#fef3c7', borderRadius: 4,
                padding: '1px 5px', marginRight: 6,
              }}>
                人気
              </span>
            )}
            {gift.name}
          </p>

          {/* category + min amount */}
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 5px' }}>
            {CAT_EMOJI[gift.category] ?? '📦'} {gift.category}
            <span style={{ fontWeight: 600, color: '#374151', marginLeft: 8 }}>
              ¥{gift.minAmount.toLocaleString()}〜
            </span>
          </p>

          {/* description */}
          {gift.description && (
            <p style={{ fontSize: 12, color: '#4b5563', margin: '0 0 9px', lineHeight: 1.45 }}>
              {gift.description}
            </p>
          )}

          {/* affiliate links + pre-fill shortcut */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {gift.rakutenUrl && (
              <a href={gift.rakutenUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, padding: '4px 9px', borderRadius: 5, background: '#bf0000', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                楽天
              </a>
            )}
            {gift.satofullUrl && (
              <a href={gift.satofullUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, padding: '4px 9px', borderRadius: 5, background: '#1d4ed8', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                さとふる
              </a>
            )}
            {gift.choiceUrl && (
              <a href={gift.choiceUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, padding: '4px 9px', borderRadius: 5, background: '#065f46', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                チョイス
              </a>
            )}
            <button
              onClick={() => onSelectGift(gift)}
              style={{
                marginLeft: 'auto',
                fontSize: 11, padding: '4px 9px', borderRadius: 5,
                background: '#f0fdf4', color: '#15803d',
                border: '1px solid #bbf7d0', cursor: 'pointer', fontWeight: 600,
              }}
            >
              📝 この返礼品で記録
            </button>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '2px 0 0' }}>
        ※ 上記リンクは広告リンクを含む場合があります
      </p>
    </div>
  )
}

// ── MuniActionModal — tabbed: log donation OR add plan ────────────────────────

interface ModalState {
  prefecture: string
  municipality: string
}

interface ModalProps {
  modal: ModalState
  onClose: () => void
  onSaveDonation: (data: Omit<Donation, 'id'>) => void
  onSavePlan: (data: Omit<Plan, 'id'>) => void
}

// Shared inline styles
const CARD_STYLE: React.CSSProperties = {
  background: 'white',
  borderRadius: 14,
  padding: '22px 26px',
  width: 'min(480px, 92vw)',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
  fontFamily: 'system-ui,-apple-system,sans-serif',
}
const LABEL_STYLE: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
  fontSize: 12, fontWeight: 500, color: '#4b5563',
}

type ModalTab = 'gifts' | 'donation' | 'plan'

interface GiftPrefill {
  giftItem?: string
  category?: DonationCategory
  minAmount?: number
}

const TAB_COLOR: Record<ModalTab, string> = {
  gifts:    '#f59e0b',
  donation: '#16a34a',
  plan:     '#7c3aed',
}

function MuniActionModal({ modal, onClose, onSaveDonation, onSavePlan }: ModalProps) {
  const gifts    = getMuniGifts(modal.prefecture, modal.municipality)
  const hasGifts = gifts.length > 0

  const [tab, setTab]         = useState<ModalTab>(hasGifts ? 'gifts' : 'donation')
  const [prefill, setPrefill] = useState<GiftPrefill>({})

  function handleSelectGift(gift: GiftItem) {
    setPrefill({ giftItem: gift.name, category: gift.category, minAmount: gift.minAmount })
    setTab('donation')
  }

  const tabs: { id: ModalTab; label: string }[] = [
    ...(hasGifts ? [{ id: 'gifts' as const, label: '🎁 返礼品を見る' }] : []),
    { id: 'donation', label: '📝 寄付を記録' },
    { id: 'plan',     label: '📋 プランを追加' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div style={CARD_STYLE} onClick={e => e.stopPropagation()}>
        {/* ── header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
            <strong>{esc(modal.prefecture)}</strong>　{esc(modal.municipality)}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: '2px 4px' }}>
            ✕
          </button>
        </div>

        {/* ── tab bar ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '2px solid #f3f4f6' }}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: tab === id ? 700 : 500,
                color: tab === id ? TAB_COLOR[id] : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: tab === id ? `2px solid ${TAB_COLOR[id]}` : '2px solid transparent',
                marginBottom: -2,
                cursor: 'pointer',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {tab === 'gifts' && (
          <GiftCatalogTab gifts={gifts} onSelectGift={handleSelectGift} />
        )}
        {tab === 'donation' && (
          <DonationForm
            key={`${prefill.giftItem ?? ''}-${prefill.minAmount ?? 0}`}
            modal={modal} onClose={onClose} onSave={onSaveDonation} prefill={prefill}
          />
        )}
        {tab === 'plan' && (
          <PlanForm modal={modal} onClose={onClose} onSave={onSavePlan} />
        )}
      </div>
    </div>
  )
}

// ── DonationForm (tab 1) ──────────────────────────────────────────────────────

function DonationForm({ modal, onClose, onSave, prefill = {} }: {
  modal: ModalState
  onClose: () => void
  onSave: (data: Omit<Donation, 'id'>) => void
  prefill?: GiftPrefill
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount]     = useState(prefill.minAmount ? String(prefill.minAmount) : '')
  const [date, setDate]         = useState(today)
  const [giftItem, setGiftItem] = useState(prefill.giftItem ?? '')
  const [category, setCategory] = useState<DonationCategory | ''>(prefill.category ?? '')
  const [site, setSite]         = useState<DonationSite>('Rakuten')
  const [notes, setNotes]       = useState('')
  const [saved, setSaved]       = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      prefecture:   modal.prefecture,
      municipality: modal.municipality,
      amount:       Number(amount),
      date,
      giftItem,
      category:     category || undefined,
      site,
      notes,
    })
    setSaved(true)
    setTimeout(onClose, 1500)
  }

  if (saved) {
    return <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600, padding: '28px 0', fontSize: 16 }}>保存しました！</div>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <label style={LABEL_STYLE}>
        <span>寄付金額（円）<span style={{ color: '#f87171' }}>*</span></span>
        <div style={{ position: 'relative' }}>
          <input className="input" type="number" min={1} placeholder="10000" required
            value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingRight: '2rem' }} />
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>円</span>
        </div>
      </label>
      <label style={LABEL_STYLE}>
        <span>寄付日<span style={{ color: '#f87171' }}>*</span></span>
        <input className="input" type="date" required value={date} onChange={e => setDate(e.target.value)} />
      </label>
      <label style={LABEL_STYLE}>
        <span>返礼品名<span style={{ color: '#f87171' }}>*</span></span>
        <input className="input" placeholder="例: 余市産リンゴ 5kg" required
          value={giftItem} onChange={e => setGiftItem(e.target.value)} />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={LABEL_STYLE}>
          <span>カテゴリ</span>
          <select className="input" value={category} onChange={e => setCategory(e.target.value as DonationCategory | '')}>
            <option value="">選択（任意）</option>
            {DONATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={LABEL_STYLE}>
          <span>サイト</span>
          <select className="input" value={site} onChange={e => setSite(e.target.value as DonationSite)}>
            {SITES.map(s => <option key={s} value={s}>{SITE_LABELS[s]}</option>)}
          </select>
        </label>
      </div>
      <label style={LABEL_STYLE}>
        <span>メモ</span>
        <textarea className="input" rows={2} placeholder="任意のメモ"
          value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
      </label>
      <button type="submit" style={{ marginTop: 4, padding: '10px 0', background: '#16a34a', color: 'white', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#15803d')}
        onMouseLeave={e => (e.currentTarget.style.background = '#16a34a')}>
        記録する
      </button>
    </form>
  )
}

// ── PlanForm (tab 2) ──────────────────────────────────────────────────────────

function PlanForm({ modal, onClose, onSave }: {
  modal: ModalState
  onClose: () => void
  onSave: (data: Omit<Plan, 'id'>) => void
}) {
  const [amount, setAmount]     = useState('')
  const [year, setYear]         = useState(CURRENT_YEAR)
  const [giftItem, setGiftItem] = useState('')
  const [site, setSite]         = useState<PlanSite>('Rakuten')
  const [notes, setNotes]       = useState('')
  const [saved, setSaved]       = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      prefecture:      modal.prefecture,
      municipality:    modal.municipality,
      plannedAmount:   Number(amount),
      year,
      targetGiftItem:  giftItem,
      site,
      notes,
      status:          'planned',
    })
    setSaved(true)
    setTimeout(onClose, 1500)
  }

  if (saved) {
    return <div style={{ textAlign: 'center', color: '#7c3aed', fontWeight: 600, padding: '28px 0', fontSize: 16 }}>プランを追加しました！</div>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={LABEL_STYLE}>
          <span>予定金額（円）<span style={{ color: '#f87171' }}>*</span></span>
          <input className="input" type="number" min={1} placeholder="10000" required
            value={amount} onChange={e => setAmount(e.target.value)} />
        </label>
        <label style={LABEL_STYLE}>
          <span>年度</span>
          <input className="input" type="number" min={2020} max={2099}
            value={year} onChange={e => setYear(Number(e.target.value) || CURRENT_YEAR)} />
        </label>
      </div>
      <label style={LABEL_STYLE}>
        <span>希望返礼品</span>
        <input className="input" placeholder="例: 余市産リンゴ 5kg（任意）"
          value={giftItem} onChange={e => setGiftItem(e.target.value)} />
      </label>
      <label style={LABEL_STYLE}>
        <span>サイト</span>
        <select className="input" value={site} onChange={e => setSite(e.target.value as PlanSite)}>
          {PLAN_SITES.map(s => <option key={s} value={s}>{SITE_LABELS[s]}</option>)}
        </select>
      </label>
      <label style={LABEL_STYLE}>
        <span>メモ</span>
        <textarea className="input" rows={2} placeholder="任意のメモ"
          value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
      </label>
      <button type="submit" style={{ marginTop: 4, padding: '10px 0', background: '#7c3aed', color: 'white', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#6d28d9')}
        onMouseLeave={e => (e.currentTarget.style.background = '#7c3aed')}>
        プランを追加
      </button>
    </form>
  )
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  donations: Donation[]
  onAddDonation: (data: Omit<Donation, 'id'>) => void
}

export default function DonationMap({ donations, onAddDonation }: Props) {
  // Prefecture GeoJSON
  const [geoData, setGeoData]       = useState<GeoData | null>(null)
  const [loadState, setLoadState]   = useState<'loading' | 'ok' | 'error'>('loading')
  const fetchedRef                  = useRef(false)

  // Drill-down state
  const [selectedPref, setSelectedPref]     = useState<string | null>(null)
  const [prefBounds, setPrefBounds]         = useState<L.LatLngBounds | null>(null)
  const muniCacheRef                        = useRef<Record<string, GeoData>>({})
  const [muniGeoReady, setMuniGeoReady]     = useState<string | null>(null)
  const [muniLoadState, setMuniLoadState]   = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  // Year filter
  const CURRENT_YEAR = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(CURRENT_YEAR)

  // Plans
  const [plans, setPlans] = useState<Plan[]>([])
  useEffect(() => { setPlans(getPlans()) }, [])

  // Action modal (donation or plan)
  const [logModal, setLogModal] = useState<ModalState | null>(null)

  function handleAddPlan(data: Omit<Plan, 'id'>) {
    const newPlan = addPlan(data)
    setPlans(prev => [...prev, newPlan])
  }

  // ── fetch prefecture GeoJSON once ─────────────────────────────────
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<GeoData>
      })
      .then((data) => { setGeoData(data); setLoadState('ok') })
      .catch(() => setLoadState('error'))
  }, [])

  // ── fetch municipality GeoJSON on demand ───────────────────────────
  async function loadMuniGeo(prefName: string) {
    const code = PREF_CODE[prefName]
    if (!code) return
    // Already cached — just make it visible
    if (muniCacheRef.current[code]) {
      setMuniGeoReady(code)
      setMuniLoadState('ok')
      return
    }
    setMuniLoadState('loading')
    try {
      const res = await fetch(`https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/geojson/s0010/N03-21_${code}_210101.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      muniCacheRef.current[code] = await res.json() as GeoData
      setMuniGeoReady(code)
      setMuniLoadState('ok')
    } catch {
      setMuniLoadState('error')
    }
  }

  // ── derive available years + filter donations ─────────────────────
  const availableYears = [...new Set(donations.map(d => Number(d.date.slice(0, 4))))].sort((a, b) => b - a)

  const visibleDonations = selectedYear === 'all'
    ? donations
    : donations.filter(d => d.date.startsWith(String(selectedYear)))

  // ── group donations by prefecture ─────────────────────────────────
  // visibleDonations: used for coloring + municipality highlights
  const byPrefecture: Record<string, Donation[]> = {}
  for (const d of visibleDonations) {
    ;(byPrefecture[d.prefecture] ??= []).push(d)
  }

  // allDonations by prefecture: used for popup year-breakdown
  const byPrefectureAll: Record<string, Donation[]> = {}
  for (const d of donations) {
    ;(byPrefectureAll[d.prefecture] ??= []).push(d)
  }

  // Active (planned) plans by prefecture: used for popup plans section
  const activePlansByPref: Record<string, Plan[]> = {}
  for (const p of plans) {
    if (p.status === 'planned') {
      ;(activePlansByPref[p.prefecture] ??= []).push(p)
    }
  }

  // Gift catalog municipalities for the selected prefecture (static lookup, fast)
  const prefGiftMunis: Set<string> = selectedPref ? getPrefGiftMunis(selectedPref) : new Set()

  const maxAmount = Math.max(
    1,
    ...Object.values(byPrefecture).map((ds) => ds.reduce((s, d) => s + d.amount, 0)),
  )

  // Key includes selectedPref + selectedYear + plan count so layer remounts with fresh closures on change
  const activePlanCount = plans.filter(p => p.status === 'planned').length
  const geoKey = `pref:${selectedPref ?? '_'}:year:${selectedYear}:ap:${activePlanCount}|` + Object.entries(byPrefecture)
    .map(([p, ds]) => `${p}:${ds.reduce((s, d) => s + d.amount, 0)}`)
    .join('|')

  // ── prefecture layer style ─────────────────────────────────────────
  function styleFeature(feature?: GeoFeature) {
    const name = feature?.properties?.nam_ja as string | undefined
    const dimmed = selectedPref !== null && name !== selectedPref

    // When drilled into a prefecture, drop the choropleth colour entirely so
    // the municipality layer (blue / violet / green) reads without red competition.
    if (selectedPref !== null) {
      return {
        fillColor: NO_DONATION_COLOR,
        fillOpacity: name === selectedPref ? 0.05 : PREF_DIM,
        color: '#9ca3af',
        weight: dimmed ? 0.5 : 0.8,
      }
    }

    const ds = name ? (byPrefecture[name] ?? []) : []
    const total = ds.reduce((s, d) => s + d.amount, 0)
    const hasPlans   = name ? (activePlansByPref[name] ?? []).length > 0 : false
    const hasCatalog = name ? ALL_GIFT_PREFS.has(name) : false
    const fillColor = total > 0
      ? amountToColor(total, maxAmount)
      : hasPlans   ? PREF_PLAN_COLOR
      : hasCatalog ? PREF_CATALOG_COLOR
      : NO_DONATION_COLOR
    return {
      fillColor,
      fillOpacity: 0.75,
      color: '#9ca3af',
      weight: 0.8,
    }
  }

  // ── prefecture layer events ────────────────────────────────────────
  function onEachPrefFeature(feature: GeoFeature, layer: L.Layer) {
    const name = feature.properties?.nam_ja as string | undefined
    if (!name) return

    // Tooltip: prefecture name + donation count/total + plan count/total
    const tipDs    = byPrefecture[name] ?? []
    const tipPlans = (activePlansByPref[name] ?? []).filter(p => selectedYear === 'all' || p.year === selectedYear)
    const tipDonCount  = tipDs.length
    const tipDonTotal  = tipDs.reduce((s, d) => s + d.amount, 0)
    const tipPlanCount = tipPlans.length
    const tipPlanTotal = tipPlans.reduce((s, p) => s + p.plannedAmount, 0)
    const tipCatalogCount = getPrefGiftMunis(name).size
    let tipHtml = `<strong>${esc(name)}</strong>`
    if (tipDonCount     > 0) tipHtml += `<br><span style="color:#16a34a;font-size:12px;">寄付 ${tipDonCount}件 ¥${tipDonTotal.toLocaleString()}</span>`
    if (tipPlanCount    > 0) tipHtml += `<br><span style="color:#7c3aed;font-size:12px;">📋 計画 ${tipPlanCount}件 ¥${tipPlanTotal.toLocaleString()}</span>`
    if (tipCatalogCount > 0) tipHtml += `<br><span style="color:#b45309;font-size:12px;">🎁 返礼品情報 ${tipCatalogCount}自治体</span>`
    layer.bindTooltip(tipHtml, { sticky: true, direction: 'center' })
    layer.bindPopup(buildPrefPopupHtml(name, byPrefectureAll[name] ?? [], selectedYear, activePlansByPref[name] ?? []), { maxWidth: 300 })

    const path = layer as L.Path
    const ds = byPrefecture[name] ?? []
    const total = ds.reduce((s, d) => s + d.amount, 0)
    const dimmed = selectedPref !== null && name !== selectedPref

    layer.on({
      mouseover() {
        if (!selectedPref) {
          path.setStyle({ weight: 2, color: '#374151', fillOpacity: 0.9 })
          path.bringToFront()
        }
      },
      mouseout() {
        path.setStyle({
          weight: dimmed ? 0.5 : 0.8,
          color: '#9ca3af',
          fillOpacity: dimmed ? PREF_DIM : total > 0 ? 0.8 : 0.75,
        })
      },
      click() {
        const bounds = mainLandBounds(feature)
        setSelectedPref(name)
        setPrefBounds(bounds)
        setMuniLoadState('idle')
        void loadMuniGeo(name)
      },
    })
  }

  // ── municipality layer style ───────────────────────────────────────
  function styleMuniFeature(feature?: GeoFeature): L.PathOptions {
    const props = feature?.properties ?? {}
    const muniName = ((props.N03_004 ?? props.N03_003) ?? '') as string
    const prefDons  = selectedPref ? (byPrefecture[selectedPref] ?? []) : []
    const prefPlans = selectedPref ? (activePlansByPref[selectedPref] ?? []) : []
    const hasDonation = prefDons.some(d => d.municipality === muniName)
    const hasPlan     = prefPlans.some(p => p.municipality === muniName)
    const hasCatalog  = prefGiftMunis.has(muniName)
    const fillColor   = hasDonation ? MUNI_FILL_DONE
                      : hasPlan     ? MUNI_FILL_PLAN
                      : hasCatalog  ? MUNI_FILL_CATALOG
                      : MUNI_FILL
    const fillOpacity = hasDonation ? 0.65 : hasPlan ? 0.55 : hasCatalog ? 0.5 : 0.3
    return { fillColor, fillOpacity, color: MUNI_STROKE, weight: 1 }
  }

  // ── municipality layer events ──────────────────────────────────────
  function onEachMuniFeature(feature: GeoFeature, layer: L.Layer) {
    const props = feature.properties ?? {}
    const muniName = ((props.N03_004 ?? props.N03_003) ?? '') as string
    if (!muniName) return

    const path      = layer as L.Path
    const prefDons  = selectedPref ? (byPrefecture[selectedPref] ?? []) : []
    const prefPlans = selectedPref ? (activePlansByPref[selectedPref] ?? []) : []

    const muniTotal = prefDons
      .filter(d => d.municipality === muniName)
      .reduce((s, d) => s + d.amount, 0)
    const muniPlan = prefPlans.find(p => p.municipality === muniName)

    const hasDonation = muniTotal > 0
    const hasPlan     = !!muniPlan
    const catalogGifts = selectedPref ? getMuniGifts(selectedPref, muniName) : []
    const hasCatalog  = catalogGifts.length > 0

    // Tooltip
    let tipHtml = esc(muniName)
    if (hasDonation)  tipHtml += `<br><span style="color:#16a34a;font-weight:700;">寄付 ¥${muniTotal.toLocaleString()}</span>`
    if (hasPlan)      tipHtml += `<br><span style="color:#7c3aed;font-weight:600;">📋 計画 ¥${muniPlan!.plannedAmount.toLocaleString()}</span>`
    if (hasCatalog)   tipHtml += `<br><span style="color:#b45309;font-size:12px;">🎁 返礼品 ${catalogGifts.length}件あり</span>`
    layer.bindTooltip(tipHtml, { sticky: true, direction: 'top' })

    const restoreOpacity = hasDonation ? 0.65 : hasPlan ? 0.55 : hasCatalog ? 0.5 : 0.3
    const hoverColor     = hasDonation ? MUNI_HIGHLIGHT : hasPlan ? '#7c3aed' : hasCatalog ? '#d97706' : MUNI_HIGHLIGHT

    layer.on({
      mouseover() {
        path.setStyle({ weight: 2.5, color: hoverColor, fillOpacity: 0.85 })
        path.bringToFront()
      },
      mouseout() {
        path.setStyle({ weight: 1, color: MUNI_STROKE, fillOpacity: restoreOpacity })
      },
      click() {
        if (selectedPref) {
          setLogModal({ prefecture: selectedPref, municipality: muniName })
        }
      },
    })
  }

  // ── current municipality data ──────────────────────────────────────
  const currentMuniData = selectedPref
    ? muniCacheRef.current[PREF_CODE[selectedPref] ?? ''] ?? null
    : null

  // ── render ────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>

      {/* prefecture GeoJSON loading / error overlay */}
      {loadState !== 'ok' && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(249,250,251,0.85)', pointerEvents: 'none',
          }}
        >
          {loadState === 'loading' ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'system-ui,sans-serif' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🗾</div>
              <div style={{ fontSize: 14 }}>地図データを読み込んでいます…</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui,sans-serif' }}>
              <div style={{ fontSize: 14 }}>地図データの読み込みに失敗しました。</div>
              <div style={{ fontSize: 12, marginTop: 4, color: '#9ca3af' }}>
                ネットワーク接続をご確認ください。
              </div>
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={[36.5, 136.0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <MapController bounds={prefBounds} />

        {/* Minimal basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Prefecture choropleth */}
        {geoData && (
          <GeoJSON
            key={geoKey}
            data={geoData as unknown as GeoJSON.GeoJsonObject}
            style={styleFeature as unknown as L.StyleFunction}
            onEachFeature={onEachPrefFeature as unknown as (f: GeoJSON.Feature, l: L.Layer) => void}
          />
        )}

        {/* Municipality layer — shown when a prefecture is selected and data is loaded */}
        {selectedPref && currentMuniData && (
          <GeoJSON
            key={`muni-${selectedPref}-${(activePlansByPref[selectedPref] ?? []).length}`}
            data={currentMuniData as unknown as GeoJSON.GeoJsonObject}
            style={styleMuniFeature as unknown as L.StyleFunction}
            onEachFeature={onEachMuniFeature as unknown as (f: GeoJSON.Feature, l: L.Layer) => void}
          />
        )}
      </MapContainer>

      {/* Year selector */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 999,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '5px 10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        fontFamily: 'system-ui,-apple-system,sans-serif',
      }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, userSelect: 'none' }}>年度</span>
        <select
          value={selectedYear === 'all' ? 'all' : String(selectedYear)}
          onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{
            fontSize: 13, fontWeight: 600, color: '#111827',
            border: 'none', outline: 'none', background: 'transparent',
            cursor: 'pointer', appearance: 'auto',
          }}
        >
          <option value="all">全年度</option>
          {availableYears.map(y => (
            <option key={y} value={String(y)}>{y}年</option>
          ))}
        </select>
      </div>

      {/* Back button */}
      {selectedPref && (
        <button
          onClick={() => {
            setSelectedPref(null)
            setPrefBounds(JAPAN_BOUNDS)
            setMuniLoadState('idle')
          }}
          style={{
            position: 'absolute', top: 10, left: 10, zIndex: 999,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            fontFamily: 'system-ui,-apple-system,sans-serif',
            color: '#374151',
          }}
        >
          ← 都道府県を表示
        </button>
      )}

      {/* Municipality loading / error banner */}
      {muniLoadState === 'loading' && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '6px 16px',
          fontSize: 13,
          color: '#6b7280',
          fontFamily: 'system-ui,-apple-system,sans-serif',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>
          市区町村データを読み込んでいます…
        </div>
      )}
      {muniLoadState === 'error' && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '6px 16px',
          fontSize: 13,
          color: '#dc2626',
          fontFamily: 'system-ui,-apple-system,sans-serif',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>
          市区町村データの読み込みに失敗しました
        </div>
      )}

      <Legend year={selectedYear} inMuniMode={!!selectedPref} />

      {/* Municipality action modal (donation or plan) */}
      {logModal && (
        <MuniActionModal
          modal={logModal}
          onClose={() => setLogModal(null)}
          onSaveDonation={(data) => { onAddDonation(data) }}
          onSavePlan={(data) => { handleAddPlan(data) }}
        />
      )}
    </div>
  )
}
