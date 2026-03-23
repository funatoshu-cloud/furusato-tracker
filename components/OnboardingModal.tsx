'use client'

/**
 * First-run onboarding modal — shown once per browser via localStorage.
 * Mount it in the root layout so it fires regardless of which page the
 * user lands on.  Clicking the backdrop or ✕ skips straight to done.
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'furusato_onboarded_v1'

interface Step {
  icon: string
  title: string
  body: string
  bullets?: string[]
  cta?: { label: string; href: string }
  ctaSub?: string
}

const STEPS: Step[] = [
  {
    icon: '🗾',
    title: 'ふるさと納税トラッカーへようこそ',
    body: 'ふるさと納税の寄付を記録・管理し、マップで全国の人気返礼品を発見できるアプリです。',
    bullets: [
      '📊 年収を入力するだけで控除上限を自動計算',
      '🗺️ マップで人気の返礼品を発見・比較',
      '📋 寄付実績をグラフとマップで可視化',
    ],
  },
  {
    icon: '💰',
    title: 'まず年収を設定しましょう',
    body: '年収・家族構成を入力するだけで、今年のふるさと納税の控除上限額が自動計算されます。上限を把握しておくと、自己負担2,000円を守るのが簡単になります。',
    cta: { label: '設定画面を開く →', href: '/settings' },
    ctaSub: '後からでも変更できます',
  },
  {
    icon: '🔍',
    title: 'マップで返礼品を発見しよう',
    body: 'マップの「発見する」モードに切り替えると、全国49自治体の人気返礼品を地図上でブラウズできます。気に入った返礼品はそのまま楽天・さとふる・チョイスへ。',
    cta: { label: 'マップを見る →', href: '/map' },
  },
]

export function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
    } catch {
      // private browsing / storage blocked — skip silently
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setShow(false)
  }

  if (!show) return null

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  return (
    // backdrop
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
    >
      {/* card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* green top accent */}
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />

        <div className="p-8">
          {/* close */}
          <button
            onClick={dismiss}
            aria-label="スキップ"
            className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors text-xl leading-none"
          >
            ✕
          </button>

          {/* progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-green-500'
                    : i < step
                    ? 'w-3 bg-green-300'
                    : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* icon */}
          <div className="text-5xl text-center mb-4 select-none">{current.icon}</div>

          {/* title */}
          <h2 className="text-lg font-bold text-gray-900 text-center mb-3 leading-snug">
            {current.title}
          </h2>

          {/* body */}
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
            {current.body}
          </p>

          {/* bullets */}
          {current.bullets && (
            <ul className="space-y-2 mb-5">
              {current.bullets.map(b => (
                <li
                  key={b}
                  className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3.5 py-2.5 text-sm text-gray-700"
                >
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* step CTA */}
          {current.cta && (
            <div className="text-center mb-5">
              <Link
                href={current.cta.href}
                onClick={dismiss}
                className="inline-block px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                {current.cta.label}
              </Link>
              {current.ctaSub && (
                <p className="text-xs text-gray-400 mt-2">{current.ctaSub}</p>
              )}
            </div>
          )}

          {/* navigation */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setStep(s => s - 1)}
              className={`text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 ${
                isFirst ? 'invisible' : ''
              }`}
            >
              ← 戻る
            </button>

            {isLast ? (
              <button
                onClick={dismiss}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                さっそく始める
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                次へ →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
