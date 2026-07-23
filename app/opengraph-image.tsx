import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cliniverse AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div style={{
      background: 'linear-gradient(135deg, #0a0015, #1a0533)',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{fontSize: 80, marginBottom: 20}}>🏥</div>
      <div style={{fontSize: 64, fontWeight: 900, color: 'white', marginBottom: 16}}>
        Clini<span style={{color: '#8b5cf6'}}>verse</span> AI
      </div>
      <div style={{fontSize: 28, color: 'rgba(255,255,255,0.6)', textAlign: 'center'}}>
        Clinical Training Platform · Built by a Physician
      </div>
      <div style={{display: 'flex', gap: 20, marginTop: 40}}>
        {['25+ Cases', '1000+ Doctors', 'Surgical AI', 'Free to Start'].map(t => (
          <div key={t} style={{background: 'rgba(139,92,246,0.3)', borderRadius: 12, padding: '8px 20px', color: 'white', fontSize: 18}}>{t}</div>
        ))}
      </div>
    </div>
  )
}
