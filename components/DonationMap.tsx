'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Donation, DonationSite } from '@/lib/storage'
import { PREF_CODE } from '@/lib/prefectureCodes'

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

const JAPAN_BOUNDS     = L.latLngBounds([[24, 122], [46, 148]])
const MUNI_FILL        = '#bfdbfe'  // blue-200 (no donation)
const MUNI_FILL_DONE   = '#86efac'  // green-300 (has donation)
const MUNI_STROKE      = '#60a5fa'  // blue-400
const MUNI_HIGHLIGHT   = '#22c55e'  // green-500
const PREF_DIM         = 0.25       // fillOpacity for non-selected prefectures

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

// ── Legend overlay (React, not a Leaflet control) ────────────────────────────

function Legend() {
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
        寄付金額
      </div>
      {LEGEND_STEPS.map(({ label, color }) => (
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

// ── MapController — programmatic zoom inside MapContainer context ─────────────

function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] })
  }, [bounds, map])
  return null
}

// ── LogDonationModal ──────────────────────────────────────────────────────────

interface ModalState {
  prefecture: string
  municipality: string
}

interface ModalProps {
  modal: ModalState
  onClose: () => void
  onSave: (data: Omit<Donation, 'id'>) => void
}

function LogDonationModal({ modal, onClose, onSave }: ModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount]     = useState('')
  const [date, setDate]         = useState(today)
  const [giftItem, setGiftItem] = useState('')
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
      site,
      notes,
    })
    setSaved(true)
    setTimeout(onClose, 1500)
  }

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 14,
    padding: '22px 26px',
    width: 'min(460px, 92vw)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    fontFamily: 'system-ui,-apple-system,sans-serif',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    color: '#4b5563',
  }

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
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>寄付を記録</h2>
            <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
              <strong>{esc(modal.prefecture)}</strong>　{esc(modal.municipality)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: '2px 4px' }}
          >
            ✕
          </button>
        </div>

        {saved ? (
          <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600, padding: '28px 0', fontSize: 16 }}>
            保存しました！
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* amount */}
            <label style={labelStyle}>
              <span>寄付金額（円）<span style={{ color: '#f87171' }}>*</span></span>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type="number"
                  min={1}
                  placeholder="10000"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ paddingRight: '2rem' }}
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>円</span>
              </div>
            </label>

            {/* date */}
            <label style={labelStyle}>
              <span>寄付日<span style={{ color: '#f87171' }}>*</span></span>
              <input
                className="input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </label>

            {/* gift item */}
            <label style={labelStyle}>
              <span>返礼品名<span style={{ color: '#f87171' }}>*</span></span>
              <input
                className="input"
                placeholder="例: 余市産リンゴ 5kg"
                required
                value={giftItem}
                onChange={e => setGiftItem(e.target.value)}
              />
            </label>

            {/* site */}
            <label style={labelStyle}>
              <span>サイト</span>
              <select
                className="input"
                value={site}
                onChange={e => setSite(e.target.value as DonationSite)}
              >
                {SITES.map(s => (
                  <option key={s} value={s}>{SITE_LABELS[s]}</option>
                ))}
              </select>
            </label>

            {/* notes */}
            <label style={labelStyle}>
              <span>メモ</span>
              <textarea
                className="input"
                rows={2}
                placeholder="任意のメモ"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'none' }}
              />
            </label>

            <button
              type="submit"
              style={{
                marginTop: 4,
                padding: '10px 0',
                background: '#16a34a',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#15803d')}
              onMouseLeave={e => (e.currentTarget.style.background = '#16a34a')}
            >
              記録する
            </button>
          </form>
        )}
      </div>
    </div>
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

  // Log modal
  const [logModal, setLogModal] = useState<ModalState | null>(null)

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

  // ── group donations by prefecture ─────────────────────────────────
  const byPrefecture: Record<string, Donation[]> = {}
  for (const d of donations) {
    ;(byPrefecture[d.prefecture] ??= []).push(d)
  }

  const maxAmount = Math.max(
    1,
    ...Object.values(byPrefecture).map((ds) => ds.reduce((s, d) => s + d.amount, 0)),
  )

  // Key includes selectedPref so layer remounts (fresh closures) on every drill-down change
  const geoKey = `pref:${selectedPref ?? '_'}|` + Object.entries(byPrefecture)
    .map(([p, ds]) => `${p}:${ds.reduce((s, d) => s + d.amount, 0)}`)
    .join('|')

  // ── prefecture layer style ─────────────────────────────────────────
  function styleFeature(feature?: GeoFeature) {
    const name = feature?.properties?.nam_ja as string | undefined
    const ds = name ? (byPrefecture[name] ?? []) : []
    const total = ds.reduce((s, d) => s + d.amount, 0)
    const dimmed = selectedPref !== null && name !== selectedPref
    return {
      fillColor: amountToColor(total, maxAmount),
      fillOpacity: dimmed ? PREF_DIM : 0.75,
      color: '#9ca3af',
      weight: dimmed ? 0.5 : 0.8,
    }
  }

  // ── prefecture layer events ────────────────────────────────────────
  function onEachPrefFeature(feature: GeoFeature, layer: L.Layer) {
    const name = feature.properties?.nam_ja as string | undefined
    if (!name) return

    layer.bindTooltip(name, { sticky: true, direction: 'center' })

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
        const bounds = L.geoJSON(feature as unknown as GeoJSON.Feature).getBounds()
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
    const prefDons = selectedPref ? (byPrefecture[selectedPref] ?? []) : []
    const hasDonation = prefDons.some(d => d.municipality === muniName)
    return {
      fillColor:   hasDonation ? MUNI_FILL_DONE : MUNI_FILL,
      fillOpacity: hasDonation ? 0.65 : 0.3,
      color:       MUNI_STROKE,
      weight:      1,
    }
  }

  // ── municipality layer events ──────────────────────────────────────
  function onEachMuniFeature(feature: GeoFeature, layer: L.Layer) {
    const props = feature.properties ?? {}
    const muniName = ((props.N03_004 ?? props.N03_003) ?? '') as string
    if (!muniName) return

    const path = layer as L.Path
    const prefDons = selectedPref ? (byPrefecture[selectedPref] ?? []) : []
    const muniTotal = prefDons
      .filter(d => d.municipality === muniName)
      .reduce((s, d) => s + d.amount, 0)

    const tipHtml = muniTotal > 0
      ? `${esc(muniName)}<br><span style="color:#16a34a;font-weight:700;">¥${muniTotal.toLocaleString()}</span>`
      : esc(muniName)

    layer.bindTooltip(tipHtml, { sticky: true, direction: 'top' })

    layer.on({
      mouseover() {
        path.setStyle({ weight: 2.5, color: MUNI_HIGHLIGHT, fillOpacity: 0.8 })
        path.bringToFront()
      },
      mouseout() {
        path.setStyle({
          weight: 1,
          color: MUNI_STROKE,
          fillOpacity: muniTotal > 0 ? 0.65 : 0.3,
        })
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
            key={`muni-${selectedPref}`}
            data={currentMuniData as unknown as GeoJSON.GeoJsonObject}
            style={styleMuniFeature as unknown as L.StyleFunction}
            onEachFeature={onEachMuniFeature as unknown as (f: GeoJSON.Feature, l: L.Layer) => void}
          />
        )}
      </MapContainer>

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

      <Legend />

      {/* Log donation modal */}
      {logModal && (
        <LogDonationModal
          modal={logModal}
          onClose={() => setLogModal(null)}
          onSave={(data) => {
            onAddDonation(data)
            // modal auto-closes after 1.5s (handled inside LogDonationModal)
          }}
        />
      )}
    </div>
  )
}
