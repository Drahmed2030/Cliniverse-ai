'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
}

export type FamilyMember = {
  id: string
  name: string
  relation: string
}

const STORAGE_KEY = 'cliniverse_family_members'
const ACTIVE_KEY = 'cliniverse_active_member'

export function loadFamilyMembers(): FamilyMember[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFamilyMembers(members: FamilyMember[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

export function getActiveMemberId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_KEY)
}

function setActiveMemberId(id: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_KEY, id)
}

const RELATIONS = ['Me', 'Spouse', 'Child', 'Parent', 'Other']

export default function FamilySwitcher({ onSelect }: { onSelect?: (member: FamilyMember) => void }) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('Me')

  useEffect(() => {
    const loaded = loadFamilyMembers()
    setMembers(loaded)
    let active = getActiveMemberId()
    if (!active && loaded.length > 0) {
      active = loaded[0].id
      setActiveMemberId(active)
    }
    setActiveId(active)
  }, [])

  const handleSelect = (member: FamilyMember) => {
    setActiveId(member.id)
    setActiveMemberId(member.id)
    onSelect?.(member)
  }

  const handleAdd = () => {
    if (!name.trim()) return
    const newMember: FamilyMember = {
      id: 'fam_' + Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(),
      relation,
    }
    const updated = [...members, newMember]
    setMembers(updated)
    saveFamilyMembers(updated)
    handleSelect(newMember)
    setName('')
    setRelation('Me')
    setShowForm(false)
  }

  const handleRemove = (id: string) => {
    const updated = members.filter(m => m.id !== id)
    setMembers(updated)
    saveFamilyMembers(updated)
    if (activeId === id) {
      const nextActive = updated[0]?.id || null
      setActiveId(nextActive)
      if (nextActive) setActiveMemberId(nextActive)
    }
  }

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            style={{
              flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center',
              gap:6, background:'none', border:'none', cursor:'pointer', padding:0,
            }}
          >
            <div style={{
              width:52, height:52, borderRadius:'50%',
              background: activeId === m.id ? L.gradient : L.canvas,
              border: activeId === m.id ? 'none' : `2px solid ${L.border}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, color: activeId === m.id ? '#fff' : L.textMuted,
              fontWeight:700,
            }}>
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div style={{
              fontSize:12, fontWeight: activeId === m.id ? 700 : 500,
              color: activeId === m.id ? L.textPrimary : L.textMuted,
              maxWidth:64, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {m.name}
            </div>
          </button>
        ))}

        <button
          onClick={() => setShowForm(true)}
          style={{
            flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center',
            gap:6, background:'none', border:'none', cursor:'pointer', padding:0,
          }}
        >
          <div style={{
            width:52, height:52, borderRadius:'50%', background:L.surface,
            border:`2px dashed ${L.border}`, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:22, color:L.textMuted,
          }}>
            +
          </div>
          <div style={{fontSize:12, color:L.textMuted}}>Add</div>
        </button>
      </div>

      {showForm && (
        <div style={{
          background:L.surface, borderRadius:16, padding:16,
          border:`1px solid ${L.border}`, marginTop:12,
        }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            style={{
              width:'100%', borderRadius:10, border:`1px solid ${L.border}`,
              padding:'10px 12px', fontSize:14, color:L.textPrimary,
              marginBottom:10, boxSizing:'border-box', fontFamily:'inherit',
            }}
          />
          <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap'}}>
            {RELATIONS.map(r => (
              <button
                key={r}
                onClick={() => setRelation(r)}
                style={{
                  background: relation === r ? L.gradient : L.canvas,
                  color: relation === r ? '#fff' : L.textSub,
                  border: relation === r ? 'none' : `1px solid ${L.border}`,
                  borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600,
                  cursor:'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex:1, background:L.canvas, color:L.textSub,
                border:`1px solid ${L.border}`, borderRadius:10, padding:'10px',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              style={{
                flex:2, background: name.trim() ? L.gradient : L.border,
                color:'#fff', border:'none', borderRadius:10, padding:'10px',
                fontSize:13, fontWeight:600, cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {members.length > 0 && activeId && (
        <button
          onClick={() => handleRemove(activeId)}
          style={{
            background:'none', border:'none', color:'#EF4444', fontSize:12,
            fontWeight:600, cursor:'pointer', marginTop:10, padding:0,
          }}
        >
          Remove {members.find(m => m.id === activeId)?.name}
        </button>
      )}
    </div>
  )
}
