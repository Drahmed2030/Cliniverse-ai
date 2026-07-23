import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cliniverse AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div style={{
      background: 'linear-gradient(135deg, #0a0015 0%, #1a0533 50%, #000d1f 100%)',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{fontSize: 80, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -3}}>
        Cliniverse AI
      </div>
      <div style={{fontSize: 30, color: 'rgba(255,255,255,0.55)', marginBottom: 48}}>
        Clinical Training Platform — Built by a Physician
      </div>
      <div style={{display: 'flex', gap: 20}}>
        {['25+ Cases', '1000+ Doctors', 'Surgical AI', 'Free'].map(t => (
          <div key={t} style={{background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: 16, padding: '12px 24px', color: 'white', fontSize: 22, fontWeight: 700}}>{t}</div>
        ))}
      </div>
      <div style={{marginTop: 48, fontSize: 20, color: 'rgba(255,255,255,0.25)'}}>
        cliniverse-ai-xmev.vercel.app
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
