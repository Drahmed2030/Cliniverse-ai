'use client'
import { useState, useEffect } from 'react'
export default function Home() {
  const [screen, setScreen] = useState('ob')
  const [obIndex, setObIndex] = useState(0)
  const [tab, setTab] = useState('home')
  const [time, setTime] = useState('')
  useEffect(() => {
    const t = () => { const n = new Date(); setTime(n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0')) }
    t(); const id = setInterval(t,1000); return () => clearInterval(id)
  }, [])
  const slides = [
    {icon:'🏥',bg:'#007AFF',title:'Welcome to Cliniverse AI',sub:'Built by a physician, for physicians.'},
    {icon:'❤️',bg:'#FF3B30',title:'Real Cases. Real Decisions.',sub:'ED, CCU, ICU, Cardiology and more.'},
    {icon:'🤖',bg:'#34C759',title:'AI Consult On Demand',sub:'Evidence-based answers instantly.'},
    {icon:'🏆',bg:'#FF9500',title:'Compete and Level Up',sub:'Earn XP and climb the leaderboard.'},
  ]
  const w: any = (c: string) => ({width:36,height:36,borderRadius:10,background:c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0})
  if (screen === 'ob') {
    const sl = slides[obIndex]
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',background:'#fff',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
          <div style={{width:120,height:120,borderRadius:30,background:sl.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:52,marginBottom:32}}>{sl.icon}</div>
          <div style={{fontSize:28,fontWeight:700,marginBottom:14}}>{sl.title}</div>
          <div style={{fontSize:16,color:'rgba(60,60,67,0.7)',lineHeight:1.6,maxWidth:300}}>{sl.sub}</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',padding:'0 0 20px'}}>
          {slides.map((_,i) => <div key={i} style={{height:8,borderRadius:4,background:i===obIndex?'#007AFF':'#E5E5EA',width:i===obIndex?22:8,transition:'all 0.3s'}} />)}
        </div>
        <div style={{padding:'0 24px 48px',display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={() => obIndex < slides.length-1 ? setObIndex(i=>i+1) : setScreen('app')} style={{background:obIndex===slides.length-1?'#34C759':'#007AFF',color:'#fff',border:'none',borderRadius:14,padding:17,fontSize:17,fontWeight:600,cursor:'pointer'}}>
            {obIndex===slides.length-1?'Get Started':'Continue'}
          </button>
          <button onClick={() => setScreen('app')} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:12}}>Skip</button>
        </div>
      </div>
    )
  }
  return (
    <div style={{fontFamily:'-apple-system,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:90}}>
      <div style={{background:'#fff',padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid rgba(60,60,67,0.29)',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontWeight:600}}>{time}</span>
        <span>🔋</span>
      </div>
      {tab==='home' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}>
            <div style={{fontSize:34,fontWeight:700,letterSpacing:-0.5}}>Good morning, Dr. Ahmed</div>
            <div style={{fontSize:14,color:'rgba(60,60,67,0.6)',marginTop:2}}>28 cases completed</div>
          </div>
          <div style={{background:'#007AFF',borderRadius:22,margin:'0 20px 20px',padding:20,color:'#fff'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>YOUR CLINICAL RANK</div>
            <div style={{fontSize:28,fontWeight:700,marginBottom:12}}>Senior Resident</div>
            <div style={{background:'rgba(255,255,255,0.25)',height:6,borderRadius:3}}>
              <div style={{height:'100%',width:'65%',background:'#fff',borderRadius:3}} />
            </div>
            <div style={{fontSize:12,opacity:0.


75,marginTop:8}}>1340 of 2000 XP</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,margin:'0 20px 20px'}}>
            {[['28','Cases','#007AFF'],['87%','Accuracy','#34C759'],['5','Streak','#FF9500']].map(([v,l,c])=>(
              <div key={String(l)} style={{background:'#fff',borderRadius:16,padding:'16px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
                <div style={{fontSize:24,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:11,color:'rgba(60,60,67,0.6)'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'0 20px 10px',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:20,fontWeight:700}}>Departments</span>
            <span style={{color:'#007AFF',cursor:'pointer'}} onClick={()=>setTab('departments')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 16px'}}>
            {[['Emergency','#FF3B30'],['CCU','#FF9500'],['ICU','#007AFF'],['Pediatrics','#34C759'],['Sports','#5AC8FA']].map(([n,c])=>(
              <div key={String(n)} style={{minWidth:110,background:'#fff',borderRadius:16,padding:16,boxShadow:'0 2px 12px rgba(0,0,0,0.08)',flexShrink:0,cursor:'pointer'}} onClick={()=>setTab('departments')}>
                <div style={{width:44,height:44,borderRadius:12,background:String(c)+'20',marginBottom:8}} />
                <div style={{fontSize:13,fontWeight:600}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='departments' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Departments</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            {[['Emergency','#FF3B3015'],['CCU','#FF950015'],['ICU','#007AFF15'],['Pediatrics','#34C75915'],['Sports Medicine','#5AC8FA15'],['OPD Clinic','#AF52DE15'],['Clinical Lab','#5856D615']].map(([n,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid rgba(60,60,67,0.18)':'none',cursor:'pointer'}}>
                <div style={w(String(c))}></div>
                <div style={{flex:1,fontSize:15,fontWeight:500}}>{n}</div>
                <span style={{color:'rgba(60,60,67,0.3)'}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='tools' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Clinical Tools</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            {[['SBAR Generator AI','#007AFF15'],['Renal Dosing Calculator','#34C75915'],['AI Clinical Consultant','#AF52DE15'],['Discharge Summary Writer','#FF950015'],['Difficult Conversations','#FF3B3015']].map(([n,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid rgba(60,60,67,0.18)':'none',cursor:'pointer'}}>
                <div style={w(String(c))}></div>
                <div style={{flex:1,fontSize:15,fontWeight:500}}>{n}</div>
                <span style={{color:'rgba(60,60,67,0.3)'}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='profile' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Profile</div></div>
          <div style={{background:'#fff',borderRadius:22,margin:'0 20px 16px',padding:24,display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>


<div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#007AFF,#AF52DE)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:'#fff',fontWeight:700}}>A</div>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>Dr. Ahmed Osman</div>
              <div style={{fontSize:13,color:'#007AFF',fontWeight:600}}>Senior Resident</div>
              <div style={{fontSize:13,color:'rgba(60,60,67,0.6)'}}>Cardiac Specialist</div>
            </div>
          </div>
        </div>
      )}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',borderTop:'0.5px solid rgba(60,60,67,0.29)',display:'flex',padding:'8px 0 24px',zIndex:200}}>
        {[['home','Home'],['departments','Depts'],['tools','Tools'],['profile','Profile']].map(([id,label])=>(
          <div key={String(id)} onClick={()=>setTab(String(id))} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',padding:'6px 0'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:tab===id?'#007AFF':'transparent'}} />
            <span style={{fontSize:10,fontWeight:500,color:tab===id?'#007AFF':'rgba(60,60,67,0.6)'}}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
