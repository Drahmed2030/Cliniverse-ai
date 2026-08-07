'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', textPrimary:'#0F172A',
  textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'

export default function AuthScreen({ onComplete }:{ onComplete:()=>void }) {
  const [mode, setMode]       = useState<'main'|'email'>('main')
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [step, setStep]       = useState<'email'|'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [pressed, setPressed] = useState<string|null>(null)
  const [error, setError]     = useState('')

  const sendOTP = async () => {
    if(!email.trim()) return
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
      if(error) setError(error.message)
      else setStep('otp')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  const verifyOTP = async () => {
    if(!otp.trim()) return
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type:'email' })
      if(error) setError(error.message)
      else onComplete()
    } catch { setError('Invalid code. Please try again.') }
    setLoading(false)
  }

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin } })
    } catch {}
  }

  const signInWithApple = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider:'apple', options:{ redirectTo: window.location.origin } })
    } catch {}
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9997, background:L.canvas,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      display:'flex', flexDirection:'column',
    }}>
      {/* Unsplash hero top */}
      <div style={{position:'relative',height:'42%',overflow:'hidden',flexShrink:0}}>
        <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(248,250,252,1))'}}/>
        <div style={{position:'absolute',bottom:24,left:24}}>
          <div style={{
            width:52,height:52,borderRadius:16,
            background:'linear-gradient(135deg,#0D9488,#1E40AF)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 4px 16px rgba(13,148,136,0.35)',marginBottom:12,
          }}>
            <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
              <polyline points="4,22 10,22 13,12 17,32 21,18 25,26 28,22 40,22"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{fontSize:24,fontWeight:900,color:L.textPrimary,letterSpacing:-0.6}}>Cliniverse AI</div>
          <div style={{fontSize:13,color:L.textMuted,marginTop:2}}>Your clinical companion</div>
        </div>
      </div>

      {/* Auth panel */}
      <div style={{flex:1,padding:'24px 24px 48px',overflowY:'auto'}}>
        {mode==='main' ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:22,fontWeight:800,color:L.textPrimary,letterSpacing:-0.4,marginBottom:8}}>
              Sign in to continue
            </div>

            {/* Apple */}
            <button onClick={signInWithApple}
              onMouseDown={()=>setPressed('apple')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%', padding:'16px', borderRadius:16, cursor:'pointer',
                background:'#000000', border:'none',
                color:'white', fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transform:pressed==='apple'?'scale(0.97)':'scale(1)', transition:spring,
                boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>

            {/* Google */}
            <button onClick={signInWithGoogle}
              onMouseDown={()=>setPressed('google')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%', padding:'16px', borderRadius:16, cursor:'pointer',
                background:L.surface, border:`1px solid ${L.border}`,
                color:L.textPrimary, fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transform:pressed==='google'?'scale(0.97)':'scale(1)', transition:spring,
                boxShadow:L.shadowSm,
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'4px 0'}}>
              <div style={{flex:1,height:1,background:L.border}}/>
              <span style={{fontSize:12,color:L.textMuted,fontWeight:500}}>or</span>
              <div style={{flex:1,height:1,background:L.border}}/>
            </div>

            {/* Email */}
            <button onClick={()=>setMode('email')}
              onMouseDown={()=>setPressed('email')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%', padding:'16px', borderRadius:16, cursor:'pointer',
                background:L.gradient, border:'none',
                color:'white', fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transform:pressed==='email'?'scale(0.97)':'scale(1)', transition:spring,
                boxShadow:L.shadowGlow,
              }}>
              ✉️ Continue with Email
            </button>

            {/* Skip */}
            <button onClick={onComplete} style={{
              background:'none', border:'none', cursor:'pointer',
              color:L.textMuted, fontSize:13, fontWeight:600,
              textAlign:'center', marginTop:4, padding:'8px',
            }}>
              Skip for now
            </button>

            <div style={{fontSize:11,color:L.textMuted,textAlign:'center',marginTop:8}}>
              By continuing, you agree to our Terms & Privacy Policy
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <button onClick={()=>setMode('main')} style={{
              background:'none',border:'none',cursor:'pointer',
              color:L.teal,fontSize:13,fontWeight:700,
              textAlign:'left',padding:0,marginBottom:8,
            }}>← Back</button>

            <div style={{fontSize:22,fontWeight:800,color:L.textPrimary,letterSpacing:-0.4,marginBottom:4}}>
              {step==='email' ? 'Enter your email' : 'Check your inbox'}
            </div>
            <div style={{fontSize:14,color:L.textMuted,marginBottom:16}}>
              {step==='email' ? "We'll send you a 6-digit code" : `Code sent to ${email}`}
            </div>

            {step==='email' ? (
              <>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  type="email" placeholder="your@email.com"
                  onKeyDown={e=>e.key==='Enter'&&sendOTP()}
                  style={{
                    width:'100%', padding:'16px', borderRadius:16, boxSizing:'border-box',
                    border:`1px solid ${L.border}`, background:L.surface,
                    color:L.textPrimary, fontSize:15, outline:'none',
                    fontFamily:'inherit',
                  }}/>
                {error && <div style={{fontSize:12,color:'#EF4444'}}>{error}</div>}
                <button onClick={sendOTP} disabled={!email.trim()||loading}
                  onMouseDown={()=>setPressed('send')} onMouseUp={()=>setPressed(null)}
                  style={{
                    width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                    background:!email.trim()?'#E2E8F0':L.gradient,
                    color:!email.trim()?L.textMuted:'white',
                    fontSize:15, fontWeight:700,
                    transform:pressed==='send'?'scale(0.97)':'scale(1)', transition:spring,
                    boxShadow:email.trim()?L.shadowGlow:'none',
                  }}>
                  {loading ? '⏳ Sending...' : 'Send Code →'}
                </button>
              </>
            ) : (
              <>
                <input value={otp} onChange={e=>setOtp(e.target.value)}
                  type="text" placeholder="000000" maxLength={6}
                  onKeyDown={e=>e.key==='Enter'&&verifyOTP()}
                  style={{
                    width:'100%', padding:'20px', borderRadius:16, boxSizing:'border-box',
                    border:`1px solid ${L.border}`, background:L.surface,
                    color:L.textPrimary, fontSize:28, fontWeight:800,
                    textAlign:'center', letterSpacing:8, outline:'none',
                    fontFamily:'inherit',
                  }}/>
                {error && <div style={{fontSize:12,color:'#EF4444',textAlign:'center'}}>{error}</div>}
                <button onClick={verifyOTP} disabled={otp.length<6||loading}
                  onMouseDown={()=>setPressed('verify')} onMouseUp={()=>setPressed(null)}
                  style={{
                    width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                    background:otp.length<6?'#E2E8F0':L.gradient,
                    color:otp.length<6?L.textMuted:'white',
                    fontSize:15, fontWeight:700,
                    transform:pressed==='verify'?'scale(0.97)':'scale(1)', transition:spring,
                    boxShadow:otp.length>=6?L.shadowGlow:'none',
                  }}>
                  {loading ? '⏳ Verifying...' : 'Verify & Continue →'}
                </button>
                <button onClick={()=>setStep('email')} style={{
                  background:'none',border:'none',cursor:'pointer',
                  color:L.textMuted,fontSize:13,textAlign:'center',padding:'8px',
                }}>Resend code</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
