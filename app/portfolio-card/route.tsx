import { ImageResponse } from 'next/og'
import { FULL_NAME } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '70px 82px',
        background: '#f4f3ef',
        color: '#171714',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #171714', paddingTop: 20, fontSize: 26 }}>
          <span>PORTFOLIO</span>
          <span>jadhavaditya.com</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 116, letterSpacing: -7 }}>{FULL_NAME}</span>
          <span style={{ fontSize: 43, marginTop: 8 }}>Software Developer</span>
        </div>
        <span style={{ fontSize: 27 }}>Backend engineering / Applied AI / Data pipelines</span>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
