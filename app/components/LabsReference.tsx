'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Lab {
  id: number
  name: string
  normal_range: string
  unit: string
  category: string
}

const CATS = ['All','Haematology','Biochemistry','Cardiac','Critical Care','ABG','Endocrine','Inflammatory']
const COLORS: Record<string,string> = {
  Haematology:'#ff453a',Biochemistry:'#00C4B4',Cardiac:'#ff453a',
  'Critical Care':'#ff9f0a',ABG:'#30d158',Endocrine:'#bf5af2',Inflammatory:'#ffd60a'
}

export default function LabsReference() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('lab_reference').select('*').order('category').then(({data})=>{
      if(data) setLabs(data)
      setLoading(false)
    })
  },[])

  const filtered = labs.filter(l=>(cat==='All'||l.category===cat)&&(!search||l.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div style={{padding:'0 16px',paddingBottom:100}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:4}}>🧪 Labs Reference</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Normal ranges · Updated 2026</div>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lab test..."
        style={{width:'100%',padding:'12px 16px',borderRadius:14,border:'1px solid rgba(0,196,180,0.20)',background:'rgba(36,63,82,0.65)',color:'white',fontSize:14,outline:'none',marginBottom:12,boxSizing:'border-box',fontFamily:'inherit'}}/>
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4,scrollbarWidth:'none'}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)}
            style={{flexShrink:0,padding:'6px 14px',borderRadius:20,border:cat===c?'1px solid rgba(139,92,246,0.5)':'1px solid rgba(255,255,255,0.18)',background:cat===c?'rgba(139,92,246,0.3)':'rgba(36,63,82,0.65)',color:cat===c?'white':'rgba(255,255,255,0.5)',fontSize:12,fontWeight:cat===c?700:400,cursor:'pointer',fontFamily:'inherit'}}>
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)'}}>Loading...</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(lab=>(
            <div key={lab.id} style={{background:'rgba(36,63,82,0.60)',borderRadius:16,padding:'12px 14px',border:'1px solid rgba(36,63,82,0.65)',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:(COLORS[lab.category]||'#00C4B4')+'15',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[lab.category]||'#00C4B4'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'white',marginBottom:2}}>{lab.name}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{lab.category}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:800,color:COLORS[lab.category]||'#00C4B4'}}>{lab.normal_range}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>{lab.unit}</div>
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)'}}>No results found</div>}
        </div>
      )}
    </div>
  )
}
