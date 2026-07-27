'use client'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent|null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) return

    // Android/Desktop install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 3000) // Show after 3s
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS — show after 3s if not installed
    if (ios) {
      setTimeout(() => setShowBanner(true), 4000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowBanner(false)
    }
    setInstallPrompt(null)
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (installed || !showBanner) return null

  // iOS Guide Modal
  if (showIOSGuide) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'flex-end',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{width:'100%',background:'linear-gradient(135deg,rgba(28,8,58,0.99),rgba(12,4,32,0.99))',borderRadius:'24px 24px 0 0',padding:'24px 20px 40px',border:'1px solid rgba(139,92,246,0.3)'}}>
        <div style={{width:40,height:4,borderRadius:2,background:'rgba(255,255,255,0.2)',margin:'0 auto 20px'}}/>
        <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:6,textAlign:'center'}}>📲 Install Cliniverse AI</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:24,textAlign:'center'}}>Add to your Home Screen for the best experience</div>
        {[
          {step:'1', icon:'⬆️', text:'Tap the Share button at the bottom of Safari'},
          {step:'2', icon:'➕', text:'Scroll down and tap "Add to Home Screen"'},
          {step:'3', icon:'✅', text:'Tap "Add" — Cliniverse AI will appear like an app'},
        ].map(s=>(
          <div key={s.step} style={{display:'flex',gap:14,marginBottom:16,alignItems:'center'}}>
            <div style={{width:36,height:36,borderRadius:11,background:'rgba(139,92,246,0.3)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>{s.text}</div>
          </div>
        ))}
        <button onClick={()=>{setShowIOSGuide(false);dismiss()}}
          style={{width:'100%',padding:'16px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 32px rgba(139,92,246,0.5)',marginTop:8}}>
          Got it!
        </button>
      </div>
    </div>
  )

  // Install Banner
  return (
    <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:1000,width:'calc(100% - 32px)',maxWidth:420,fontFamily:'-apple-system,sans-serif',animation:'slideUp 0.4s cubic-bezier(.34,1.56,.64,1)'}}>
      <div style={{background:'linear-gradient(135deg,rgba(28,8,58,0.97),rgba(12,4,32,0.99))',borderRadius:22,padding:'16px 18px',border:'1.5px solid rgba(139,92,246,0.4)',boxShadow:'0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.3)',position:'relative',overflow:'hidden'}}>
        {/* Glow */}
        <div style={{position:'absolute',top:-20,left:'20%',width:200,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',filter:'blur(20px)',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1}}>
          {/* App icon */}
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,boxShadow:'0 6px 24px rgba(139,92,246,0.5)'}}>⚕️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:'white',marginBottom:2}}>Cliniverse AI</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Install for instant access — works offline</div>
          </div>
          <button onClick={dismiss} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',fontSize:20,cursor:'pointer',padding:4,flexShrink:0}}>×</button>
        </div>
        <div style={{display:'flex',gap:10,marginTop:14,position:'relative',zIndex:1}}>
          <button onClick={dismiss} style={{flex:1,padding:'12px',borderRadius:14,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Not now
          </button>
          <button onClick={handleInstall}
            style={{flex:2,padding:'12px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:13,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.5)'}}>
            📲 {isIOS ? 'Add to Home Screen' : 'Install App'}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(100px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
    </div>
  )
}
