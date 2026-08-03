'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Guideline {
  id: number
  title: string
  specialty: string
  summary: string
  source: string
  year: number
}

const SPECS = ['All','Cardiology','Critical Care','Respiratory','Endocrine','Neurology','Emergency']
const COLORS: Record<string,string> = {
  Cardiology:'#ff453a','Critical Care':'#ff9f0a',Respiratory:'#00C4B4',
  Endocrine:'#bf5af2',Neurology:'#30d158',Emergency:'#ff453a'
}

export default function Guidelines() {
  const [data, setData] = useState<Guideline[]>([])
  const [spec, setSpec] = useState('All')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('guidelines').select('*').order('year', {ascending:false}).then(({data:d})=>{
      if(d) setData(d)
      setLoading(false)
    })
  },[])

  const filtered = data.filter(g=>
    (spec==='All'||g.specialty===spec)&&
    (!search||g.title.toLowerCase().includes(search.toLowerCase())||g.specialty.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{padding:'0 16px',paddingBottom:100}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:900,color:'#0A1628',marginBottom:4}}>📋 Clinical Guidelines</div>
        <div style={{fontSize:12,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>ESC · AHA · NICE · WHO · Updated 2026</div>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guidelines..."
        style={{width:'100%',padding:'12px 16px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(255,255,255,0.88)',color:'#0A1628',fontSize:14,outline:'none',marginBottom:12,boxSizing:'border-box',fontFamily:'inherit'}}/>

      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4,scrollbarWidth:'none'}}>
        {SPECS.map(s=>(
          <button key={s} onClick={()=>setSpec(s)}
            style={{flexShrink:0,padding:'6px 14px',borderRadius:20,border:spec===s?'1px solid rgba(139,92,246,0.5)':'1px solid rgba(255,255,255,0.18)',background:spec===s?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.12)',color:spec===s?'white':'rgba(255,255,255,0.5)',fontSize:12,fontWeight:spec===s?700:400,cursor:'pointer',fontFamily:'inherit'}}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>Loading guidelines...</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(g=>(
            <div key={g.id} onClick={()=>setExpanded(expanded===g.id?null:g.id)}
              style={{background:'rgba(255,255,255,0.88)',borderRadius:18,padding:16,border:'1px solid '+(COLORS[g.specialty]||'#00C4B4')+'20',cursor:'pointer',transition:'all 0.2s'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{width:44,height:44,borderRadius:13,background:(COLORS[g.specialty]||'#00C4B4')+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {g.specialty==='Cardiology'?'🫀':g.specialty==='Critical Care'?'🏥':g.specialty==='Respiratory'?'🫁':g.specialty==='Endocrine'?'💉':g.specialty==='Neurology'?'🧠':'⚕️'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#0A1628',marginBottom:4}}>{g.title}</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:(COLORS[g.specialty]||'#00C4B4')+'15',color:COLORS[g.specialty]||'#00C4B4',fontWeight:700}}>{g.specialty}</span>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'rgba(255,255,255,0.88)',color:'var(--text-secondary,rgba(10,22,40,0.55))',fontWeight:600}}>{g.source} {g.year}</span>
                  </div>
                </div>
                <span style={{color:'var(--text-secondary,rgba(10,22,40,0.55))',fontSize:18,transition:'transform 0.2s',transform:expanded===g.id?'rotate(90deg)':'none'}}>›</span>
              </div>
              {expanded===g.id&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid rgba(36,63,82,0.65)'}}>
                  <div style={{fontSize:13,color:'var(--text-secondary,rgba(10,22,40,0.55))',lineHeight:1.7}}>{g.summary}</div>
                  <div style={{marginTop:10,fontSize:11,color:'var(--text-secondary,rgba(10,22,40,0.55))',fontStyle:'italic'}}>Source: {g.source} {g.year}</div>
                </div>
              )}
            </div>
          ))}
          {filtered.length===0&&(
            <div style={{textAlign:'center',padding:40,color:'var(--text-secondary,rgba(10,22,40,0.55))'}}>No guidelines found</div>
          )}
        </div>
      )}
    </div>
  )
}
