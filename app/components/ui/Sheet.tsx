'use client'
import { useState, useEffect } from 'react'
import { L } from '../../lib/tokens'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Sheet({ open, onClose, title, children, size='md' }: SheetProps) {
  const heights = { sm:'40vh', md:'65vh', lg:'90vh', full:'100vh' }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, zIndex:900,
        background:'rgba(15,23,42,0.40)',
        backdropFilter:'blur(4px)',
        animation:'fadeIn 0.2s ease',
      }}/>

      {/* Sheet */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        zIndex:901,
        background: L.surface,
        borderRadius: `${L.rXl}px ${L.rXl}px 0 0`,
        boxShadow: L.shadowXl,
        height: heights[size],
        display:'flex', flexDirection:'column',
        animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Handle */}
        <div style={{
          width:40, height:4, borderRadius:2,
          background: L.border,
          margin:'12px auto 0',
          flexShrink:0,
        }}/>

        {/* Header */}
        {title && (
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 20px',
            borderBottom:`1px solid ${L.border}`,
            flexShrink:0,
          }}>
            <span style={{fontSize:17, fontWeight:700, color:L.text, fontFamily:L.font}}>{title}</span>
            <button onClick={onClose} style={{
              width:30, height:30, borderRadius:15,
              background:L.raised, border:`1px solid ${L.border}`,
              color:L.textMuted, fontSize:16, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>×</button>
          </div>
        )}

        {/* Content */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 20px 40px'}}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
    </>
  )
}
