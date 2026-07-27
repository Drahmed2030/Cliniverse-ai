'use client'
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
          <div style={{display:'flex',background:'rgba(255,255,255,0.15)',borderRadius:16,padding:4,marginBottom:20,border:'1px solid rgba(255,255,255,0.18)'}}>
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
          <div style={{background:'rgba(255,255,255,0.11)',borderRadius:18,padding:16,marginBottom:20,border:'1px solid rgba(255,255,255,0.11)'}}>
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
            style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.7)',fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:16}}>
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
