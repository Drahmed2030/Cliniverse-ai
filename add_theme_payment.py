import os

# ══════════════════════════════════════════
# 1. UPDATE globals.css — CSS Variables theme system
# ══════════════════════════════════════════
css = """/* Cliniverse AI — Theme System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── DARK COSMIC (default) ── */
:root {
  --bg-primary: #0a0015;
  --bg-secondary: #12002a;
  --bg-card: rgba(255,255,255,0.04);
  --bg-card-border: rgba(255,255,255,0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.55);
  --text-muted: rgba(255,255,255,0.3);
  --accent: #8b5cf6;
  --accent-blue: #0a84ff;
  --accent-green: #30d158;
  --accent-red: #ff453a;
  --accent-orange: #ff9f0a;
  --accent-gold: #ffd60a;
  --nav-bg: rgba(10,0,21,0.95);
  --nav-border: rgba(139,92,246,0.2);
  --font: 'Inter', -apple-system, system-ui, sans-serif;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 28px;
}

/* ── CLINICAL WHITE ── */
[data-theme="light"] {
  --bg-primary: #F2F2F7;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-card-border: rgba(0,0,0,0.06);
  --text-primary: #1C1C1E;
  --text-secondary: #3C3C43;
  --text-muted: #8E8E93;
  --accent: #007AFF;
  --accent-blue: #007AFF;
  --accent-green: #34C759;
  --accent-red: #FF3B30;
  --accent-orange: #FF9500;
  --accent-gold: #FF9500;
  --nav-bg: rgba(255,255,255,0.95);
  --nav-border: rgba(0,0,0,0.1);
}

/* ── MIDNIGHT BLUE ── */
[data-theme="midnight"] {
  --bg-primary: #001433;
  --bg-secondary: #002055;
  --bg-card: rgba(255,255,255,0.06);
  --bg-card-border: rgba(10,132,255,0.2);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.65);
  --text-muted: rgba(255,255,255,0.35);
  --accent: #0a84ff;
  --accent-blue: #0a84ff;
  --accent-green: #30d158;
  --accent-red: #ff453a;
  --accent-orange: #ff9f0a;
  --accent-gold: #ffd60a;
  --nav-bg: rgba(0,20,51,0.97);
  --nav-border: rgba(10,132,255,0.3);
}

/* ── BASE STYLES ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  font-family: var(--font);
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
  min-height: 100vh;
}

/* ── TYPOGRAPHY — Medical Professional ── */
.heading-xl { font-size: clamp(24px,6vw,32px); font-weight: 900; letter-spacing: -0.8px; line-height: 1.1; }
.heading-lg { font-size: clamp(18px,5vw,24px); font-weight: 800; letter-spacing: -0.5px; }
.heading-md { font-size: clamp(15px,4vw,18px); font-weight: 700; }
.body-lg    { font-size: 16px; font-weight: 400; line-height: 1.7; }
.body-md    { font-size: 14px; font-weight: 400; line-height: 1.6; }
.body-sm    { font-size: 12px; font-weight: 400; line-height: 1.5; }
.label      { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.mono       { font-family: 'SF Mono', 'Fira Code', monospace; }

/* ── CARDS ── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--bg-card-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  transition: transform 0.15s ease;
}
.card:active { transform: scale(0.98); }

/* ── BUTTONS ── */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  font-family: var(--font);
}
.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--bg-card-border);
  border-radius: var(--radius-md);
  padding: 13px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font);
}

/* ── ANIMATIONS ── */
@keyframes rise { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.5; transform:scale(1.15) } }
@keyframes spin { from { transform:rotate(0) } to { transform:rotate(360deg) } }
@keyframes glow { 0%,100% { box-shadow: 0 0 20px var(--accent) } 50% { box-shadow: 0 0 40px var(--accent) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 0; }

/* ── SAFE AREAS ── */
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
.safe-top { padding-top: env(safe-area-inset-top, 44px); }

/* ── VITALS GLOW ── */
.vital-red   { color: var(--accent-red);    text-shadow: 0 0 10px var(--accent-red); }
.vital-green { color: var(--accent-green);  text-shadow: 0 0 10px var(--accent-green); }
.vital-blue  { color: var(--accent-blue);   text-shadow: 0 0 10px var(--accent-blue); }

/* ── THEME TRANSITION ── */
body { transition: background 0.3s ease, color 0.3s ease; }
"""

css_path = os.path.expanduser('~/cliniverse-ai/app/globals.css')
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('✅ globals.css updated with theme system')

# ══════════════════════════════════════════
# 2. CREATE PaymentModal component
# ══════════════════════════════════════════
payment = r"""'use client'
import { useState } from 'react'

// 🔑 Replace with your actual Lemon Squeezy URLs
const PLANS = {
  monthly: {
    name: 'Pro Monthly',
    price: '$9.99',
    period: 'per month',
    url: 'https://cliniverse.lemonsqueezy.com/checkout/buy/MONTHLY_ID_HERE',
    features: ['Unlimited AI Case Generation','All Surgical Modules','Clinical Nexus Global Room','Rapid Fire Mode','Priority Support'],
  },
  yearly: {
    name: 'Pro Annual',
    price: '$79.99',
    period: 'per year',
    url: 'https://cliniverse.lemonsqueezy.com/checkout/buy/YEARLY_ID_HERE',
    save: 'Save 33%',
    features: ['Everything in Monthly','Early access to new modules','CME certificate (coming soon)','Team features (coming soon)','Lifetime price lock'],
  },
}

interface Props { onClose: () => void }

export default function PaymentModal({ onClose }: Props) {
  const [plan, setPlan] = useState<'monthly'|'yearly'>('yearly')
  const p = PLANS[plan]

  const handleCheckout = () => {
    window.open(p.url, '_blank')
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',justifyContent:'center'}}
      onClick={e => e.target===e.currentTarget && onClose()}>
      
      {/* Backdrop */}
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}} onClick={onClose}/>
      
      {/* Sheet */}
      <div style={{position:'relative',width:'100%',maxWidth:480,background:'linear-gradient(145deg,#12002a,#0a0015)',borderRadius:'28px 28px 0 0',padding:'8px 0 0',border:'1px solid rgba(139,92,246,0.3)',boxShadow:'0 -20px 60px rgba(139,92,246,0.3)',animation:'slideUp 0.3s ease'}}>
        
        {/* Handle */}
        <div style={{width:40,height:4,background:'rgba(255,255,255,0.2)',borderRadius:2,margin:'0 auto 20px'}}/>
        
        <div style={{padding:'0 24px 40px'}}>
          {/* Header */}
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{fontSize:40,marginBottom:8}}>🚀</div>
            <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:4,letterSpacing:-0.5}}>Upgrade to Pro</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.5)'}}>Join 10,000+ doctors worldwide</div>
          </div>

          {/* Plan toggle */}
          <div style={{display:'flex',background:'rgba(255,255,255,0.06)',borderRadius:16,padding:4,marginBottom:20,border:'1px solid rgba(255,255,255,0.08)'}}>
            {(['monthly','yearly'] as const).map(pl=>(
              <button key={pl} onClick={()=>setPlan(pl)}
                style={{flex:1,padding:'10px',borderRadius:13,border:'none',background:plan===pl?'rgba(139,92,246,0.3)':'transparent',color:plan===pl?'white':'rgba(255,255,255,0.4)',fontWeight:700,fontSize:14,cursor:'pointer',position:'relative',transition:'all 0.2s'}}>
                {pl==='yearly'?'Annual':'Monthly'}
                {pl==='yearly'&&<span style={{position:'absolute',top:-8,right:4,background:'#30d158',color:'white',fontSize:9,fontWeight:800,padding:'2px 6px',borderRadius:20}}>-33%</span>}
              </button>
            ))}
          </div>

          {/* Price */}
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:48,fontWeight:900,color:'white',letterSpacing:-2}}>{p.price}</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',marginTop:2}}>{p.period}</div>
            {plan==='yearly'&&<div style={{fontSize:12,color:'#30d158',fontWeight:700,marginTop:4}}>That's only $6.67/month</div>}
          </div>

          {/* Features */}
          <div style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:16,marginBottom:20,border:'1px solid rgba(255,255,255,0.07)'}}>
            {p.features.map(f=>(
              <div key={f} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(48,209,88,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#30d158',flexShrink:0}}>✓</div>
                <span style={{fontSize:14,color:'rgba(255,255,255,0.8)'}}>{f}</span>
              </div>
            ))}
          </div>

          {/* Apple Pay / Card button */}
          <button onClick={handleCheckout}
            style={{width:'100%',padding:'18px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',color:'white',fontSize:16,fontWeight:800,cursor:'pointer',marginBottom:12,boxShadow:'0 8px 32px rgba(139,92,246,0.4)',letterSpacing:-0.3,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            🍎 Continue with Apple Pay
          </button>
          
          <button onClick={handleCheckout}
            style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.7)',fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:16}}>
            Pay with Card →
          </button>

          {/* Trust badges */}
          <div style={{display:'flex',justifyContent:'center',gap:20,marginBottom:12}}>
            {['🔒 Secure','↩️ Cancel anytime','🌍 147 countries'].map(t=>(
              <span key={t} style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontWeight:600}}>{t}</span>
            ))}
          </div>
          
          <div style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.2)'}}>
            Processed securely by Lemon Squeezy · Apple Pay available on Safari
          </div>
        </div>
      </div>
    </div>
  )
}
"""

pay_path = os.path.expanduser('~/cliniverse-ai/app/components/PaymentModal.tsx')
with open(pay_path, 'w', encoding='utf-8') as f:
    f.write(payment)
print('✅ PaymentModal.tsx created')

# ══════════════════════════════════════════
# 3. CREATE ThemeProvider component
# ══════════════════════════════════════════
theme_provider = r"""'use client'
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('cliniverse-theme') || 'dark'
    const map: Record<string,string> = { light:'light', midnight:'midnight', dark:'' }
    const attr = map[theme] || ''
    if (attr) document.documentElement.setAttribute('data-theme', attr)
    else document.documentElement.removeAttribute('data-theme')
  }, [])
  return <>{children}</>
}
"""

tp_path = os.path.expanduser('~/cliniverse-ai/app/components/ThemeProvider.tsx')
with open(tp_path, 'w', encoding='utf-8') as f:
    f.write(theme_provider)
print('✅ ThemeProvider.tsx created')

# ══════════════════════════════════════════
# 4. UPDATE layout.tsx — add ThemeProvider + Inter font
# ══════════════════════════════════════════
layout_path = os.path.expanduser('~/cliniverse-ai/app/layout.tsx')
with open(layout_path, 'r', encoding='utf-8') as f:
    layout = f.read()

if 'ThemeProvider' not in layout:
    layout = """import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Cliniverse AI',
  description: 'The clinical companion built by a physician, for physicians worldwide.',
  manifest: '/manifest.json',
  themeColor: '#0a0015',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cliniverse AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
"""
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(layout)
    print('✅ layout.tsx updated with ThemeProvider')
else:
    print('✅ layout.tsx already has ThemeProvider')

print('\n' + '='*50)
print('✅ ALL DONE!')
print('- globals.css: CSS Variables theme system')
print('- PaymentModal: Apple Pay + Lemon Squeezy')
print('- ThemeProvider: reads localStorage theme')
print('- layout.tsx: updated')
print('\n🚀 Run: git add . && git commit -m "add theme system + payment modal" && git push')
