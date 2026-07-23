import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export async function GET() {
  return new ImageResponse(
    <div style={{background:'linear-gradient(135deg,#0a0015,#1a0533)',width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{fontSize:80,marginBottom:16}}>🏥</div>
      <div style={{fontSize:64,fontWeight:900,color:'white',marginBottom:12,letterSpacing:-2}}>Cliniverse AI</div>
      <div style={{fontSize:26,color:'rgba(255,255,255,0.55)',marginBottom:40,textAlign:'center'}}>Clinical Training · Built by a Physician</div>
      <div style={{display:'flex',gap:16}}>
        {['⚡ Rapid Fire','🌍 1000+ Doctors','🫀 Surgical AI','🤖 AI Cases'].map(t=>(
          <div key={t} style={{background:'rgba(255,255,255,0.1)',borderRadius:16,padding:'10px 22px',color:'white',fontSize:18,fontWeight:700}}>{t}</div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
