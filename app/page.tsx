'use client'
import STEMICase from './components/STEMICase'
import { useState, useEffect } from 'react'
export default function Home() {
  const [screen, setScreen] = useState('ob')
  const [obIndex, setObIndex] = useState(0)
  const [tab, setTab] = useState('home')
  const [activeCase, setActiveCase] = useState('')
  const [time, setTime] = useState('')
  const [hr, setHr] = useState(72)
  const [spo2, setSpo2] = useState(98)
  const [ecgTick, setEcgTick] = useState(0)
  useEffect(() => {
    const t = () => { const n = new Date(); setTime(n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0')) }
    t(); const id = setInterval(t,1000); return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const id = setInterval(() => {
      setHr(h => 70 + Math.floor(Math.random()*8))
      setSpo2(s => 97 + Math.floor(Math.random()*2))
      setEcgTick(e => e+1)
    }, 1200)
    return () => clearInterval(id)
  }, [])
  const titles = ['Welcome to Cliniverse AI','Real Cases. Real Decisions.','AI Consult On Demand','Compete and Level Up']
  const colors = ['#007AFF','#FF3B30','#34C759','#FF9500']
  const emojis = ['🏥','❤️','🤖','🏆']
  const subs = ['Built by a physician, for physicians.','ED, CCU, ICU, Cardiology and more.','Evidence-based answers instantly.','Earn XP and climb the leaderboard.']
  if (screen === 'ob') {
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#fff',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
          <div style={{width:120,height:120,borderRadius:30,background:colors[obIndex],display:'flex',alignItems:'center',justifyContent:'center',fontSize:52,marginBottom:32,boxShadow:'0 8px 32px '+colors[obIndex]+'60'}}>{emojis[obIndex]}</div>
          <div style={{fontSize:28,fontWeight:700,marginBottom:14,letterSpacing:-0.5}}>{titles[obIndex]}</div>
          <div style={{fontSize:16,color:'#888',lineHeight:1.6,maxWidth:300}}>{subs[obIndex]}</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',padding:'0 0 20px'}}>
          {titles.map((_,i) => <div key={i} style={{height:8,borderRadius:4,background:i===obIndex?'#007AFF':'#E5E5EA',width:i===obIndex?22:8,transition:'all 0.3s'}} />)}
        </div>
        <div style={{padding:'0 24px 48px',display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={() => obIndex < 3 ? setObIndex(i=>i+1) : setScreen('app')} style={{background:obIndex===3?'#34C759':'#007AFF',color:'#fff',border:'none',borderRadius:14,padding:17,fontSize:17,fontWeight:600,cursor:'pointer',boxShadow:obIndex===3?'0 4px 20px #34C75960':'0 4px 20px #007AFF60'}}>
            {obIndex===3?'Get Started':'Continue'}
          </button>
          <button onClick={() => setScreen('app')} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:12}}>Skip</button>
        </div>
      </div>
    )
  }
  const ecgPath = () => {
    let d = 'M 0 30'
    for (let i = 0; i < 20; i++) {
      const x = i * 16
      if (i % 5 === 2) { d += ' L '+(x+2)+' 30 L '+(x+3)+' 5 L '+(x+4)+' 50 L '+(x+5)+' 30' }
      else { d += ' L '+(x+16)+' 30' }
    }
    return d
  }
  return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:90}}>
      <div style={{background:'#fff',padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontWeight:600,fontSize:15}}>{time}</span>
        <span style={{fontSize:13,color:'#888'}}>Cliniverse AI</span>
      </div>
      {tab==='home' && (
        <div>
          <div style={{padding:'16px 20px 8px'}}>
            <div style={{fontSize:13,color:'#888',fontWeight:500}}>WEDNESDAY</div>
            <div style={{fontSize:28,fontWeight:700,letterSpacing:-0.5}}>Good morning, Dr. Ahmed 👋</div>
          </div>
          <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:22,margin:'12px 20px',padding:20,color:'#fff',boxShadow:'0 8px 32px #007AFF40'}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:1,opacity:0.8,marginBottom:4}}>YOUR CLINICAL RANK</div>
            <div style={{fontSize:26,fontWeight:700,marginBottom:12}}>Senior Resident</div>
            <div style={{background:'rgba(255,255,255,0.2)',height:6,borderRadius:3,marginBottom:6}}>
              <div style={{height:'100%',width:'67%',background:'#fff',borderRadius:3,boxShadow:'0 0 8px #fff'}} />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,opacity:0.8}}>
              <span>1340 XP</span>
              <span>2000 XP to Attending</span>
            </div>
          </div>
          <div style={{background:'#1C1C1E',borderRadius:20,margin:'0 20px 12px',padding:16,boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#34C759',letterSpacing:1,marginBottom:12}}>LIVE VITALS</div>
            <div style={{display:'flex',gap:12,marginBottom:12}}>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center',boxShadow:'0 0 16px #FF3B3030'}}>
                <div style={{fontSize:10,color:'#FF3B30',fontWeight:600,letterSpacing:0.5}}>HR</div>
                <div style={{fontSize:28,fontWeight:700,color:'#FF3B30',textShadow:'0 0 12px #FF3B30'}}>{hr}</div>
                <div style={{fontSize:10,color:'#666'}}>bpm</div>
              </div>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center',boxShadow:'0 0 16px #34C75930'}}>
                <div style={{fontSize:10,color:'#34C759',fontWeight:600,letterSpacing:0.5}}>SpO2</div>
                <div style={{fontSize:28,fontWeight:700,color:'#34C759',textShadow:'0 0 12px #34C759'}}>{spo2}</div>
                <div style={{fontSize:10,color:'#666'}}>%</div>
              </div>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center',boxShadow:'0 0 16px #007AFF30'}}>
                <div style={{fontSize:10,color:'#007AFF',fontWeight:600,letterSpacing:0.5}}>BP</div>
                <div style={{fontSize:22,fontWeight:700,color:'#007AFF',textShadow:'0 0 12px #007AFF'}}>120/80</div>
                <div style={{fontSize:10,color:'#666'}}>mmHg</div>
              </div>
            </div>
            <div style={{background:'#2C2C2E',borderRadius:12,padding:'10px 12px',overflow:'hidden'}}>
              <div style={{fontSize:10,color:'#34C759',fontWeight:600,letterSpacing:0.5,marginBottom:6}}>ECG</div>
              <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none">
                <path d={ecgPath()} fill="none" stroke="#34C759" strokeWidth="2" style={{filter:'drop-shadow(0 0 4px #34C759)'}} />
              </svg>
            </div>
          </div>
          <div style={{display:'flex',gap:10,margin:'0 20px 12px'}}>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:22,fontWeight:700,color:'#007AFF'}}>28</div>
              <div style={{fontSize:11,color:'#888'}}>Cases</div>
            </div>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:22,fontWeight:700,color:'#34C759'}}>87%</div>
              <div style={{fontSize:11,color:'#888'}}>Accuracy</div>
            </div>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:22,fontWeight:700,color:'#FF9500'}}>🔥 5</div>
              <div style={{fontSize:11,color:'#888'}}>Streak</div>
            </div>
          </div>
          <div style={{padding:'4px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:20,fontWeight:700}}>Departments</span>
            <span style={{color:'#007AFF',fontSize:14,cursor:'pointer'}} onClick={()=>setTab('departments')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 16px'}}>
            {[['🚨','Emergency','#FF3B30'],['❤️','CCU','#FF9500'],['💊','ICU','#007AFF'],['👶','Pediatrics','#34C759'],['⚽','Sports','#5AC8FA']].map(([icon,n,c])=>(
              <div key={String(n)} style={{minWidth:110,background:'#fff',borderRadius:16,padding:16,flexShrink:0,cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}} onClick={()=>setTab('departments')}>
                <div style={{width:44,height:44,borderRadius:12,background:String(c)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:8}}>{icon}</div>
                <div style={{fontSize:13,fontWeight:600}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='departments' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Departments</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['🚨','Emergency','6 cases','#FF3B30'],['❤️','CCU','4 cases','#FF9500'],['💊','ICU','3 cases','#007AFF'],['👶','Pediatrics','2 cases','#34C759'],['⚽','Sports Medicine','4 cases','#5AC8FA'],['🏥','OPD Clinic','2 cases','#AF52DE'],['🧪','Clinical Lab','Results','#5856D6']].map(([icon,n,sub,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:40,height:40,borderRadius:12,background:String(c)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{n}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{sub}</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='tools' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Clinical Tools</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['📋','SBAR Generator AI','Structured handover in seconds','#007AFF'],['💊','Renal Dosing Calculator','eGFR-based drug adjustment','#34C759'],['🤖','AI Clinical Consultant','Evidence-based answers','#AF52DE'],['📝','Discharge Summary Writer','Auto-generate summaries','#FF9500'],['💬','Difficult Conversations','Practice breaking bad news','#FF3B30']].map(([icon,n,sub,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:40,height:40,borderRadius:12,background:String(c)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{n}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{sub}</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='leaderboard' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Leaderboard</div></div>
          <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:16,margin:'0 20px 12px',padding:'16px 20px',color:'#fff',boxShadow:'0 8px 24px #007AFF40'}}>
            <div style={{fontSize:11,opacity:0.8,fontWeight:600,letterSpacing:1}}>YOUR RANK</div>
            <div style={{fontSize:32,fontWeight:800}}>#14</div>
            <div style={{fontSize:14,opacity:0.85}}>Dr. Ahmed Osman — 1340 XP</div>
          </div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['🥇','Dr. Sarah K.','4200 XP','#FFD700'],['🥈','Dr. Mohammed A.','3850 XP','#C0C0C0'],['🥉','Dr. Rania H.','3420 XP','#CD7F32'],['4','Dr. Khalid M.','2980 XP','#888'],['5','Dr. Layla S.','2750 XP','#888']].map(([rank,name,xp,c],i,arr)=>(
              <div key={String(name)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none'}}>
                <div style={{width:32,textAlign:'center',fontSize:18,fontWeight:700,color:String(c)}}>{rank}</div>
                <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16}}>{String(name)[4]}</div>
                <div style={{flex:1,fontSize:15,fontWeight:600}}>{name}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#FF9500'}}>{xp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='profile' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Profile</div></div>
          <div style={{background:'#fff',borderRadius:22,margin:'0 20px 12px',padding:24,display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'#fff',fontWeight:700,boxShadow:'0 0 0 3px #fff, 0 0 0 5px #007AFF, 0 0 25px #007AFF'}}>A</div>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>Dr. Ahmed Osman</div>
              <div style={{fontSize:13,color:'#007AFF',fontWeight:600,marginTop:2}}>⭐ Senior Resident</div>
              <div style={{fontSize:13,color:'#888',marginTop:2}}>Cardiac Specialist · KSA</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,margin:'0 20px 12px'}}>
            {[['28','Cases','#007AFF'],['1340','XP','#FF9500'],['5','Badges','#34C759']].map(([v,l,c])=>(
              <div key={String(l)} style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:22,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:11,color:'#888'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px'}}><div style={{fontSize:20,fontWeight:700}}>Badges</div></div>
          <div style={{display:'flex',gap:10,padding:'0 20px 16px',overflowX:'auto'}}>
            {[['❤️','Cardiologist','#FF3B30'],['🔥','5-Day Streak','#FF9500'],['⚡','Speed Demon','#5856D6'],['🏆','Top 20','#FFD700']].map(([icon,name,c])=>(
              <div key={String(name)} style={{minWidth:90,background:'#fff',borderRadius:16,padding:14,textAlign:'center',flexShrink:0,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:11,fontWeight:600,color:String(c)}}>{name}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['👤','Account','#007AFF'],['🔔','Notifications','#FF9500'],['🌙','Appearance','#5856D6'],['⭐','Upgrade to PRO','#FF9500']].map(([icon,n,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:36,height:36,borderRadius:10,background:String(c)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
                <div style={{flex:1,fontSize:15,fontWeight:500,color:i===3?String(c):'#000'}}>{n}</div>
                <span style={{color:'#C7C7CC',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',borderTop:'0.5px solid #E5E5EA',display:'flex',padding:'8px 0 24px',zIndex:200}}>
        {[['home','🏠','Home'],['departments','🏥','Depts'],['tools','🛠️','Tools'],['leaderboard','🏆','Ranks'],['profile','👤','Profile']].map(([id,icon,label])=>(
          <div key={String(id)} onClick={()=>setTab(String(id))} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',padding:'4px 0'}}>
            <span style={{fontSize:22}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:500,color:tab===id?'#007AFF':'#888'}}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
