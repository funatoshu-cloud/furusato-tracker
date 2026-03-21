'use client'

/**
 * Cascading prefecture → municipality dropdown.
 *
 * Normal mode (default): prefecture select + search filter input + municipality select,
 * rendered in a responsive 2-column grid — for full forms.
 *
 * Compact mode: a single <input list> / datalist pair that fits inside a table cell —
 * for the bulk-entry table. Only the municipality input is rendered; the prefecture
 * select must be handled by the parent.
 */

import { useEffect, useMemo, useState, useId } from 'react'
import { PREFECTURES } from '@/lib/prefectures'
import { MUNICIPALITIES } from '@/lib/municipalities'

// ── shared ────────────────────────────────────────────────────────────────────

export { MUNICIPALITIES }

// ── full cascading select ─────────────────────────────────────────────────────

interface MunicipalitySelectProps {
  prefecture: string
  municipality: string
  onPrefectureChange: (pref: string) => void
  onMunicipalityChange: (muni: string) => void
  required?: boolean
  prefLabel?: string
  muniLabel?: string
}

export function MunicipalitySelect({
  prefecture,
  municipality,
  onPrefectureChange,
  onMunicipalityChange,
  required = false,
  prefLabel = '都道府県',
  muniLabel = '市区町村',
}: MunicipalitySelectProps) {
  const [filter, setFilter] = useState('')

  const allMunis: string[] = prefecture ? (MUNICIPALITIES[prefecture] ?? []) : []

  const filtered = useMemo(
    () => (filter.trim() ? allMunis.filter(m => m.includes(filter.trim())) : allMunis),
    [allMunis, filter],
  )

  // Stable options: always include the current value even if filtered out
  const options = useMemo(() => {
    if (municipality && !filtered.includes(municipality) && allMunis.includes(municipality)) {
      return [municipality, ...filtered]
    }
    return filtered
  }, [filtered, municipality, allMunis])

  // Reset filter when prefecture changes
  useEffect(() => {
    setFilter('')
  }, [prefecture])

  const req = required

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Prefecture */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {prefLabel}{req && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <select
          value={prefecture}
          onChange={e => {
            onPrefectureChange(e.target.value)
            onMunicipalityChange('')
          }}
          className="input"
          required={req}
        >
          <option value="">都道府県を選択</option>
          {PREFECTURES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Municipality */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {muniLabel}{req && <span className="text-red-400 ml-0.5">*</span>}
        </label>

        {/* Search filter — visible only when prefecture is chosen */}
        {prefecture ? (
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="絞り込み…"
            aria-label="市区町村を絞り込み"
            className="input mb-1.5 py-1.5 text-sm"
          />
        ) : null}

        <select
          value={municipality}
          onChange={e => onMunicipalityChange(e.target.value)}
          disabled={!prefecture}
          className="input disabled:bg-gray-50 disabled:text-gray-400"
          required={req}
        >
          <option value="">
            {prefecture ? '市区町村を選択' : '先に都道府県を選択'}
          </option>
          {options.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
          {/* Preserve any existing value that isn't in the official list */}
          {municipality && !allMunis.includes(municipality) && (
            <option value={municipality}>{municipality}</option>
          )}
        </select>

        {prefecture && filter && filtered.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">該当なし</p>
        )}
      </div>
    </div>
  )
}

// ── compact municipality-only combobox (for bulk table cells) ─────────────────

interface MunicipalityComboboxProps {
  prefecture: string
  municipality: string
  onChange: (muni: string) => void
  className?: string
}

/**
 * A compact `<input list>` + `<datalist>` that provides real-time search
 * filtering within the table cell.  Only renders the municipality field;
 * the prefecture select is handled by the parent table column.
 */
export function MunicipalityCombobox({
  prefecture,
  municipality,
  onChange,
  className = '',
}: MunicipalityComboboxProps) {
  const id = useId()
  const listId = `muni-list-${id.replace(/:/g, '')}`
  const munis = prefecture ? (MUNICIPALITIES[prefecture] ?? []) : []

  return (
    <>
      <input
        type="text"
        list={prefecture ? listId : undefined}
        value={municipality}
        onChange={e => onChange(e.target.value)}
        disabled={!prefecture}
        placeholder={prefecture ? '市区町村を選択' : '—'}
        className={`input disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
        autoComplete="off"
      />
      {prefecture && (
        <datalist id={listId}>
          {munis.map(m => (
            <option key={m} value={m} />
          ))}
        </datalist>
      )}
    </>
  )
}
