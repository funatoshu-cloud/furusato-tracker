import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ふるさと納税トラッカー'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #16a34a, #059669)',
          }}
        />

        {/* icon */}
        <div style={{ fontSize: 100, marginBottom: 28, lineHeight: 1 }}>🗾</div>

        {/* title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#14532d',
            letterSpacing: '-1px',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          ふるさと納税トラッカー
        </div>

        {/* tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#166534',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 800,
            opacity: 0.85,
          }}
        >
          寄付を記録・管理して、全国の人気返礼品をマップで発見
        </div>

        {/* feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 44,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            '📊 控除上限の自動計算',
            '🗺️ 47都道府県マップ',
            '🎁 返礼品の発見',
            '📋 申請書管理',
          ].map(label => (
            <div
              key={label}
              style={{
                background: 'white',
                border: '2px solid #bbf7d0',
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 22,
                color: '#15803d',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #059669, #16a34a)',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
