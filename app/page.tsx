'use client'
import { useState, useEffect } from 'react'
export default function Home() {
  const [screen, setScreen] = useState('ob')
  const [obIndex, setObIndex] = useState(0)
  const [tab, setTab] = useState('home')
  const [time, setTime] = useState('')
  useEffect(() => {
    const t = () => {
      const n = new Date()
      setTime(n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0'))
    }
    t()
    const id = setInterval(t, 1000)
    return () => clearInterval(id)
  }, [])
  if (screen === 'ob') {
    const titles = ['Welcome to Cliniverse AI','Real Cases. Real Decisions.','AI Consult On Demand','Compete and Level Up']
    const colors = ['#007AFF','#FF3B30','#34C759','#FF9500']
    const icons = ['H','R','A','T']
    return (
      <div style={{fontFamily:'system-ui',background:'#fff',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
          <div style={{width:120,height:120,borderRadius:30,background:colors[obIndex],display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,marginBottom:32,color:'#fff',fontWeight:700}}>{icons[obIndex]}</div>
          <div style={{fontSize:28,fontWeight:700,marginBottom:14}}>{titles[obIndex]}</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',padding:'0 0 20px'}}>
          {titles.map((_,i) => <div key={i} style={{height:8,borderRadius:4,background:i===obIndex?'#007AFF':'#E5E5EA',width:i===obIndex?22:8}} />)}
        </div>
        <div style={{padding:'0 24px 48px',display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={() => obIndex < 3 ? setObIndex(i=>i+1) : setScreen('app')} style={{background:obIndex===3?'#34C759':'#007AFF',color:'#fff',border:'none',borderRadius:14,padding:17,fontSize:17,fontWeight:600,cursor:'pointer'}}>
            {obIndex===3?'Get Started':'Continue'}
          </button>
          <button onClick={() => setScreen('app')} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:12}}>Skip</button>
        </div>
      </div>
    )
  }
  return (
    <div style={{fontFamily:'system-ui',background:'#F2F2F7',minHeight:'100vh',paddingBottom:90}}>
      <div style={{background:'#fff',padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid #ccc',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontWeight:600}}>{time}</span>
        <span>OK</span>
      </div>
      {tab==='home' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}>
            <div style={{fontSize:34,fontWeight:700}}>Good morning, Dr. Ahmed</div>
            <div style={{fontSize:14,color:'#888',marginTop:2}}>28 cases completed</div>
          </div>
          <div style={{background:'#007AFF',borderRadius:22,margin:'0 20px 20px',padding:20,color:'#fff'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>YOUR CLINICAL RANK</div>
            <div style={{fontSize:28,fontWeight:700,marginBottom:12}}>Senior Resident</div>
            <div style={{background:'rgba(255,255,255,0.25)',height:6,borderRadius:3}}>
              <div style={{height:'100%',width:'65%',background:'#fff',borderRadius:3}} />
            </div>
            <div style={{fontSize:12,opacity:0.75,marginTop:8}}>1340 of 2000 XP</div>
          </div>
          <div style={{display:'flex',gap:10,margin:'0 20px 20px'}}>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'16px 12px',textAlign:'center'}}>
              <div style={{fontSize:24,fontWeight:700,color:'#007AFF'}}>28</div>
              <div style={{fontSize:11,color:'#888'}}>Cases</div>
            </div>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'16px 12px',textAlign:'center'}}>


<div style={{fontSize:24,fontWeight:700,color:'#34C759'}}>87%</div>
              <div style={{fontSize:11,color:'#888'}}>Accuracy</div>
            </div>
            <div style={{flex:1,background:'#fff',borderRadius:16,padding:'16px 12px',textAlign:'center'}}>
              <div style={{fontSize:24,fontWeight:700,color:'#FF9500'}}>5</div>
              <div style={{fontSize:11,color:'#888'}}>Streak</div>
            </div>
          </div>
          <div style={{padding:'0 20px 10px',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:20,fontWeight:700}}>Departments</span>
            <span style={{color:'#007AFF',cursor:'pointer'}} onClick={()=>setTab('departments')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 16px'}}>
            {['Emergency','CCU','ICU','Pediatrics','Sports'].map(n=>(
              <div key={n} style={{minWidth:110,background:'#fff',borderRadius:16,padding:16,flexShrink:0,cursor:'pointer'}} onClick={()=>setTab('departments')}>
                <div style={{width:44,height:44,borderRadius:12,background:'#007AFF20',marginBottom:8}} />
                <div style={{fontSize:13,fontWeight:600}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='departments' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Departments</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden'}}>
            {['Emergency','CCU','ICU','Pediatrics','Sports Medicine','OPD Clinic','Clinical Lab'].map((n,i,arr)=>(
              <div key={n} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #eee':'none',cursor:'pointer'}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#007AFF20'}} />
                <div style={{flex:1,fontSize:15,fontWeight:500}}>{n}</div>
                <span style={{color:'#ccc'}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='tools' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Clinical Tools</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden'}}>
            {['SBAR Generator AI','Renal Dosing Calculator','AI Clinical Consultant','Discharge Summary Writer','Difficult Conversations'].map((n,i,arr)=>(
              <div key={n} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #eee':'none',cursor:'pointer'}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#34C75920'}} />
                <div style={{flex:1,fontSize:15,fontWeight:500}}>{n}</div>
                <span style={{color:'#ccc'}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='profile' && (
        <div>
          <div style={{padding:'8px 20px 16px'}}><div style={{fontSize:34,fontWeight:700}}>Profile</div></div>
          <div style={{background:'#fff',borderRadius:22,margin:'0 20px 16px',padding:24,display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'#007AFF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:'#fff',fontWeight:700}}>A</div>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>Dr. Ahmed Osman</div>
              <div style={{fontSize:13,color:'#007AFF',fontWeight:600}}>Senior Resident</div>
              <div style={{fontSize:13,color:'#888'}}>Cardiac Specialist</div>
            </div>
          </div>
        </div>
      )}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',borderTop:'0.5px solid #eee',display:'flex',padding:'8px 0 24px',zIndex:200}}>
        {['home','departments','tools','profile'].map((id,i)=>(


<div key={id} onClick={()=>setTab(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',padding:'6px 0'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:tab===id?'#007AFF':'transparent'}} />
            <span style={{fontSize:10,fontWeight:500,color:tab===id?'#007AFF':'#888'}}>{['Home','Depts','Tools','Profile'][i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
