'use client'

interface Props {
  xp: number
  casesCompleted: number
  mcqCorrect: number
}

export default function ActivityRings({ xp, casesCompleted, mcqCorrect }: Props) {
  const accuracy = Math.min(Math.round(xp / 2), 100)
  const speed = Math.min(mcqCorrect * 10, 100)
  const knowledge = Math.min(casesCompleted * 20, 100)

  const r1 = 38, r2 = 28, r3 = 18
  const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2, c3 = 2 * Math.PI * r3

  return (
    <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.97),rgba(25,8,55,0.95))',borderRadius:24,padding:18,marginBottom:14,border:'1px solid rgba(139,92,246,0.2)'}}>
      <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:2,marginBottom:12,fontWeight:700}}>DAILY PROGRESS</div>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <div style={{position:'relative',width:90,height:90,flexShrink:0}}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{transform:'rotate(-90deg)'}}>
            <circle cx="45" cy="45" r={r1} fill="none" stroke="rgba(10,132,255,0.15)" strokeWidth="7"/>
            <circle cx="45" cy="45" r={r1} fill="none" stroke="#0a84ff" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${(knowledge/100)*c1} ${c1}`} style={{filter:'drop-shadow(0 0 4px #0a84ff)',transition:'stroke-dasharray 1s ease'}}/>
            <circle cx="45" cy="45" r={r2} fill="none" stroke="rgba(48,209,88,0.15)" strokeWidth="7"/>
            <circle cx="45" cy="45" r={r2} fill="none" stroke="#30d158" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${(speed/100)*c2} ${c2}`} style={{filter:'drop-shadow(0 0 4px #30d158)',transition:'stroke-dasharray 1s ease'}}/>
            <circle cx="45" cy="45" r={r3} fill="none" stroke="rgba(255,69,58,0.15)" strokeWidth="7"/>
            <circle cx="45" cy="45" r={r3} fill="none" stroke="#ff453a" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${(accuracy/100)*c3} ${c3}`} style={{filter:'drop-shadow(0 0 4px #ff453a)',transition:'stroke-dasharray 1s ease'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <div style={{fontSize:15,fontWeight:900,color:'white'}}>{xp}</div>
            <div style={{fontSize:7,color:'rgba(255,255,255,0.4)'}}>XP</div>
          </div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
          {[
            {color:'#ff453a',label:'Accuracy',val:accuracy},
            {color:'#30d158',label:'Speed',val:speed},
            {color:'#0a84ff',label:'Knowledge',val:knowledge},
          ].map((r,i)=>(
            <div key={i}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <span style={{fontSize:10,color:'white',fontWeight:600}}>{r.label}</span>
                <span style={{fontSize:10,color:r.color,fontWeight:700}}>{r.val}%</span>
              </div>
              <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:r.val+'%',background:r.color,borderRadius:2,transition:'width 1s ease'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
