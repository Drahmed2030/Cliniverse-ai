'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

interface LiveCase {
  id: string
  title: string
  patient: string
  dept: string
  urgency: 'Stat' | 'Urgent' | 'Routine'
  color: string
  icon: string
  action: string
  details?: string
  is_active: boolean
  created_at: string
  expires_at: string
}

const DEPT_COLORS: Record<string, string> = {
  ED:'#ff453a', CCU:'#ff9f0a', ICU:'#8b5cf6',
  Ward:'#0a84ff', Peds:'#30d158', Neuro:'#64d2ff'
}

const C = {
  card: 'rgba(255,255,255,0.11)',
  border: 'rgba(139,92,246,0.25)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

// ── HOOK: useLiveCases ──
export function useLiveCases() {
  const [cases, setCases] = useState<LiveCase[]>([])
  const [loading, setLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)
  const [lastSeen, setLastSeen] = useState<string>(new Date().toISOString())

  const fetchCases = useCallback(async () => {
    const { data } = await supabase
      .from('live_cases')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      setCases(data)
      const newOnes = data.filter(c => c.created_at > lastSeen).length
      setNewCount(newOnes)
    }
    setLoading(false)
  }, [lastSeen])

  useEffect(() => {
    fetchCases()
    // Poll every 30 seconds instead of realtime
    const interval = setInterval(fetchCases, 30000)
    return () => clearInterval(interval)
  }, [fetchCases])

  const markSeen = () => {
    setLastSeen(new Date().toISOString())
    setNewCount(0)
  }

  return { cases, loading, newCount, markSeen, refetch: fetchCases }
}

// ── MAIN COMPONENT ──
export default function LiveCasesSystem({ onXP }: { onXP?: (n:number)=>void }) {
  const { cases, loading, newCount, markSeen, refetch } = useLiveCases()
  const [handled, setHandled] = useState<string[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [selectedCase, setSelectedCase] = useState<LiveCase|null>(null)

  useEffect(() => { markSeen() }, [])

  const depts = ['All', 'ED', 'CCU', 'ICU', 'Ward', 'Peds', 'Neuro']
  const filtered = filter === 'All' ? cases : cases.filter(c => c.dept === filter)
  const statCount = cases.filter(c => c.urgency === 'Stat' && !handled.includes(c.id)).length

  const handleCase = async (c: LiveCase) => {
    setHandled(h => [...h, c.id])
    onXP && onXP(30)
  }

  // ── CASE DETAIL VIEW ──
  if (selectedCase) {
    const c = selectedCase
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <button onClick={()=>setSelectedCase(null)} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text}}>{c.icon} {c.title}</div>
            <div style={{fontSize:11,color:C.sub}}>{c.dept} · {c.urgency}</div>
          </div>
          <span style={{fontSize:10,padding:'4px 12px',borderRadius:10,background:c.urgency==='Stat'?'rgba(255,69,58,0.2)':'rgba(255,159,10,0.15)',color:c.urgency==='Stat'?'#ff453a':'#ff9f0a',fontWeight:800,border:`1px solid ${c.urgency==='Stat'?'rgba(255,69,58,0.3)':'rgba(255,159,10,0.3)'}`}}>{c.urgency}</span>
        </div>

        {/* Patient card */}
        <div style={{background:`${c.color}12`,borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${c.color}30`,boxShadow:`0 6px 24px ${c.color}15`}}>
          <div style={{fontSize:48,textAlign:'center',marginBottom:10,filter:`drop-shadow(0 0 16px ${c.color}88)`}}>{c.icon}</div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,textAlign:'center',marginBottom:4}}>{c.title}</div>
          <div style={{fontSize:13,color:C.sub,textAlign:'center',marginBottom:14}}>{c.patient}</div>
          {c.details&&(
            <div style={{background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(255,255,255,0.18)'}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:6,letterSpacing:0.5}}>📋 CLINICAL NOTE</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.7}}>{c.details}</div>
            </div>
          )}
        </div>

        {/* Action */}
        <div style={{background:'rgba(255,255,255,0.11)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${c.color}25`}}>
          <div style={{fontSize:10,color:c.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>⚡ IMMEDIATE ACTION</div>
          <div style={{fontSize:16,fontWeight:800,color:C.text,lineHeight:1.5}}>{c.action}</div>
        </div>

        {/* Dept info */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <div style={{background:C.card,borderRadius:14,padding:'12px',border:`1px solid ${C.border}`,textAlign:'center'}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>DEPARTMENT</div>
            <div style={{fontSize:16,fontWeight:800,color:DEPT_COLORS[c.dept]||'white'}}>{c.dept}</div>
          </div>
          <div style={{background:C.card,borderRadius:14,padding:'12px',border:`1px solid ${C.border}`,textAlign:'center'}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>REPORTED</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{new Date(c.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</div>
          </div>
        </div>

        {!handled.includes(c.id) ? (
          <button onClick={()=>{handleCase(c);setSelectedCase(null)}} style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${c.color},${c.color}bb)`,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 6px 24px ${c.color}44`}}>
            ✅ Mark as Handled · +30 XP
          </button>
        ) : (
          <div style={{background:'rgba(48,209,88,0.1)',borderRadius:18,padding:'16px',border:'1px solid rgba(48,209,88,0.3)',textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#86efac'}}>✅ Case Handled</div>
          </div>
        )}
      </div>
    )
  }

  // ── MAIN LIST VIEW ──
  return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(139,92,246,0.08))',borderRadius:22,padding:'16px 18px',marginBottom:14,border:'1px solid rgba(255,69,58,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,69,58,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>🔴 LIVE</div>
            <div style={{fontSize:20,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Active Cases</div>
            <div style={{fontSize:12,color:C.sub,marginTop:2}}>Real-time · Updates automatically</div>
          </div>
          <div style={{textAlign:'center'}}>
            {statCount>0&&(
              <div style={{background:'rgba(255,69,58,0.2)',border:'1px solid rgba(255,69,58,0.4)',borderRadius:14,padding:'8px 14px',marginBottom:6,animation:'pulse 2s infinite'}}>
                <div style={{fontSize:26,fontWeight:900,color:'#ff453a',lineHeight:1}}>{statCount}</div>
                <div style={{fontSize:9,color:'rgba(255,69,58,0.7)',fontWeight:800}}>STAT</div>
              </div>
            )}
            <button onClick={refetch} style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:C.sub,padding:'6px 12px',fontSize:11,cursor:'pointer',fontWeight:600}}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Dept filter */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:14,scrollbarWidth:'none'}}>
        {depts.map(d=>(
          <button key={d} onClick={()=>setFilter(d)} style={{flexShrink:0,padding:'7px 14px',borderRadius:12,border:filter===d?`2px solid ${DEPT_COLORS[d]||'#8b5cf6'}`:'1px solid rgba(139,92,246,0.25)',background:filter===d?`${DEPT_COLORS[d]||'#8b5cf6'}18`:C.card,color:filter===d?DEPT_COLORS[d]||'#c4b5fd':C.sub,fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>
            {d}
            {d!=='All'&&cases.filter(c=>c.dept===d&&!handled.includes(c.id)).length>0&&(
              <span style={{marginLeft:6,background:'rgba(255,69,58,0.3)',borderRadius:6,padding:'1px 5px',fontSize:9,color:'#ff453a',fontWeight:900}}>
                {cases.filter(c=>c.dept===d&&!handled.includes(c.id)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cases list */}
      {loading ? (
        <div style={{textAlign:'center',padding:'40px 0'}}>
          <div style={{width:32,height:32,borderRadius:'50%',border:'3px solid rgba(139,92,246,0.3)',borderTop:'3px solid #8b5cf6',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
          <div style={{fontSize:13,color:C.sub}}>Loading live cases...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{background:C.card,borderRadius:20,padding:'32px 20px',border:`1px solid ${C.border}`,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>All Clear</div>
          <div style={{fontSize:13,color:C.sub}}>No active cases in {filter==='All'?'any department':filter}</div>
        </div>
      ) : filtered.map(c => {
        const isHandled = handled.includes(c.id)
        const isNew = new Date(c.created_at) > new Date(Date.now() - 5*60*1000)
        return (
          <div key={c.id} onClick={()=>setSelectedCase(c)}
            style={{background:isHandled?'rgba(48,209,88,0.05)':c.urgency==='Stat'?`${c.color}10`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:isHandled?'1px solid rgba(48,209,88,0.15)':c.urgency==='Stat'?`1.5px solid ${c.color}40`:`1px solid ${C.border}`,cursor:'pointer',opacity:isHandled?0.55:1,transition:'all 0.2s',boxShadow:!isHandled&&c.urgency==='Stat'?`0 4px 20px ${c.color}20`:'none',position:'relative',overflow:'hidden'}}>
            {isNew&&!isHandled&&<div style={{position:'absolute',top:10,right:10,width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px rgba(255,69,58,0.8)',animation:'pulse 1.5s infinite'}}/>}
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                {isHandled?'✅':c.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:800,color:isHandled?'rgba(255,255,255,0.4)':C.text}}>{c.title}</span>
                  {!isHandled&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:6,background:c.urgency==='Stat'?'rgba(255,69,58,0.2)':'rgba(255,159,10,0.15)',color:c.urgency==='Stat'?'#ff453a':'#ff9f0a',fontWeight:800,border:`1px solid ${c.urgency==='Stat'?'rgba(255,69,58,0.3)':'rgba(255,159,10,0.3)'}`}}>{c.urgency}</span>}
                  {isNew&&!isHandled&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:6,background:'rgba(139,92,246,0.3)',color:'#c4b5fd',fontWeight:800}}>NEW</span>}
                </div>
                <div style={{fontSize:11,color:C.sub,marginBottom:2}}>{c.patient}</div>
                <div style={{fontSize:11,color:isHandled?'rgba(255,255,255,0.3)':c.color,fontWeight:600}}>→ {c.action}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:10,padding:'3px 8px',borderRadius:8,background:`${DEPT_COLORS[c.dept]||'#8b5cf6'}18`,color:DEPT_COLORS[c.dept]||'#8b5cf6',fontWeight:700,marginBottom:4}}>{c.dept}</div>
                <div style={{fontSize:10,color:C.muted}}>{new Date(c.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</div>
              </div>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.1)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
