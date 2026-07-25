'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Med {
  id: number
  name: string
  class: string
  indication: string
  approval_date: string
  notes: string
}

export default function Medications() {
  const [data, setData] = useState<Med[]>([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('medications').select('*').order('name').then(({data:d})=>{
      if(d) setData(d)
      setLoading(false)
    })
  },[])

  const filtered = data.filter(m=>
    !search||
    m.name.toLowerCase().includes(search.toLowerCase())||
    m.class?.toLowerCase().includes(search.toLowerCase())||
    m.indication?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{padding:'0 16px',paddingBottom:100}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:4}}>💊 New Medications</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Latest FDA & EMA approvals · 2024-2026</div>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search medications..."
        style={{width:'100%',padding:'12px 16px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:14,outline:'none',marginBottom:16,boxSizing:'border-box',fontFamily:'inherit'}}/>

      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)'}}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:40}}>
          <div style={{fontSize:32,marginBottom:12}}>💊</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',marginBottom:20}}>No medications yet</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>Add medications via Admin Dashboard</div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(m=>(
            <div key={m.id} onClick={()=>setExpanded(expanded===m.id?null:m.id)}
              style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:16,border:'1px solid rgba(48,209,88,0.15)',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:13,background:'rgba(48,209,88,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>💊</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:'white',marginBottom:4}}>{m.name}</div>
                  <div style={{display:'flex',gap:6}}>
                    {m.class&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'rgba(48,209,88,0.1)',color:'#30d158',fontWeight:700}}>{m.class}</span>}
                    {m.approval_date&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)'}}>{m.approval_date}</span>}
                  </div>
                </div>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:18,transition:'transform 0.2s',transform:expanded===m.id?'rotate(90deg)':'none'}}>›</span>
              </div>
              {expanded===m.id&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  {m.indication&&<div style={{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.7,marginBottom:8}}><span style={{color:'rgba(255,255,255,0.4)',fontWeight:600}}>Indication: </span>{m.indication}</div>}
                  {m.notes&&<div style={{fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>{m.notes}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
