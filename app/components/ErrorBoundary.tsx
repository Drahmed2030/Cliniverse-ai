'use client'
import React from 'react'

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Cliniverse Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100vh',background:'var(--bg-card,#2a4a60)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'-apple-system,sans-serif'}}>
          <div style={{fontSize:60,marginBottom:16}}>🏥</div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--text-primary, white)',marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:32,textAlign:'center'}}>Please refresh the page to continue training</div>
          <button onClick={()=>window.location.reload()} style={{background:'linear-gradient(135deg,#00C4B4,#0a84ff)',border:'none',borderRadius:16,padding:'14px 32px',fontSize:16,fontWeight:700,color:'var(--text-primary, white)',cursor:'pointer'}}>
            Refresh App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
