'use client'
import { useRef, useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

interface Props {
  doctorName: string
  casesCompleted: number
  mcqCorrect: number
  xp: number
  streak: number
  specialties?: string[]
  onClose?: () => void
}

// ── CERTIFICATE SVG ──
function CertificateSVG({ doctorName, casesCompleted, mcqCorrect, xp, streak, specialties = [] }: Props) {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const certId = 'CLN-' + Date.now().toString(36).toUpperCase().slice(-8)

  return (
    <svg
      width="900" height="636"
      viewBox="0 0 900 636"
      xmlns="http://www.w3.org/2000/svg"
      fontFamily="Georgia, 'Times New Roman', serif"
    >
      <defs>
        {/* Background gradient — deep navy */}
        <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0a1628"/>
          <stop offset="50%"  stopColor="#0d1f38"/>
          <stop offset="100%" stopColor="#081220"/>
        </linearGradient>

        {/* Gold gradient for borders & accents */}
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C8960C"/>
          <stop offset="30%"  stopColor="#FFD700"/>
          <stop offset="60%"  stopColor="#F0C040"/>
          <stop offset="100%" stopColor="#C8960C"/>
        </linearGradient>

        {/* Teal gradient for logo */}
        <linearGradient id="tealG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00E5D4"/>
          <stop offset="60%"  stopColor="#00C8B8"/>
          <stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>

        {/* ECG pulse gradient */}
        <linearGradient id="pulseG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00C8B8" stopOpacity="0"/>
          <stop offset="35%"  stopColor="#00C8B8"/>
          <stop offset="65%"  stopColor="#00E5D4"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0"/>
        </linearGradient>

        {/* Watermark gradient */}
        <linearGradient id="wmG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00E5D4" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#0096FF" stopOpacity="0.04"/>
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="1 0.8 0 0 0  0.8 0.6 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gold"/>
          <feMerge><feMergeNode in="gold"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="textShadow" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* ── BACKGROUND ── */}
      <rect width="900" height="636" fill="url(#bgG)"/>

      {/* ── WATERMARK LOGO — large, centered, very subtle ── */}
      <g transform="translate(450,318)" opacity="0.055">
        <g transform="translate(-110,-110) scale(1.83)">
          {/* C Arc watermark */}
          <path d="M 84 38 A 30 30 0 1 0 84 82"
            fill="none" stroke="url(#tealG)" strokeWidth="9" strokeLinecap="round"/>
          {/* ECG watermark */}
          <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
            fill="none" stroke="#00C8B8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Dots */}
          <circle cx="84" cy="38" r="6" fill="#00E5D4"/>
          <circle cx="84" cy="82" r="6" fill="#0096FF"/>
        </g>
      </g>

      {/* ── OUTER GOLD BORDER ── */}
      <rect x="18" y="18" width="864" height="600" rx="8" ry="8"
        fill="none" stroke="url(#goldG)" strokeWidth="1.8" opacity="0.85"/>

      {/* ── INNER GOLD BORDER ── */}
      <rect x="28" y="28" width="844" height="580" rx="5" ry="5"
        fill="none" stroke="url(#goldG)" strokeWidth="0.7" opacity="0.45"/>

      {/* ── CORNER ORNAMENTS ── */}
      {[
        [32, 32, 0],
        [868, 32, 90],
        [868, 604, 180],
        [32, 604, 270],
      ].map(([cx, cy, rot], i) => (
        <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          <path d="M 0 0 L 28 0 M 0 0 L 0 28" stroke="url(#goldG)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
          <circle cx="0" cy="0" r="3" fill="#FFD700" opacity="0.7"/>
        </g>
      ))}

      {/* ── TOP DECORATIVE LINE ── */}
      <line x1="80" y1="72" x2="820" y2="72" stroke="url(#goldG)" strokeWidth="0.6" opacity="0.35"/>

      {/* ── LOGO MARK — top center ── */}
      <g transform="translate(382, 62)">
        {/* Background circle */}
        <circle cx="68" cy="22" r="30" fill="rgba(0,200,184,0.06)" stroke="rgba(0,200,184,0.18)" strokeWidth="1"/>
        {/* C Arc */}
        <path d="M 84 10 A 16 16 0 1 0 84 34"
          fill="none" stroke="url(#tealG)" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"/>
        {/* ECG */}
        <polyline points="56,22 60,22 62,22 64,16 66,28 68,19 70,25 72,22 82,22"
          fill="none" stroke="url(#pulseG)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
        {/* End dots */}
        <circle cx="84" cy="10" r="2.5" fill="#00E5D4" filter="url(#softGlow)"/>
        <circle cx="84" cy="34" r="2.5" fill="#0096FF" filter="url(#softGlow)"/>
        {/* Ring */}
        <circle cx="68" cy="22" r="24" fill="none" stroke="#00C8B8" strokeWidth="0.6" opacity="0.20"/>
      </g>

      {/* ── APP NAME ── */}
      <text x="450" y="116" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="13" fontWeight="400"
        fill="#00C8B8" letterSpacing="5" opacity="0.90">
        CLINIVERSE AI
      </text>

      {/* ── DECORATIVE RULE ── */}
      <g transform="translate(450,130)">
        <line x1="-180" y1="0" x2="-20" y2="0" stroke="url(#goldG)" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="0" cy="0" r="3" fill="#FFD700" opacity="0.6"/>
        <line x1="20" y1="0" x2="180" y2="0" stroke="url(#goldG)" strokeWidth="0.8" opacity="0.5"/>
      </g>

      {/* ── CERTIFICATE OF ACHIEVEMENT ── */}
      <text x="450" y="170" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="11" fontWeight="400"
        fill="rgba(242,248,252,0.50)" letterSpacing="6">
        CERTIFICATE OF ACHIEVEMENT
      </text>

      {/* ── THIS IS TO CERTIFY THAT ── */}
      <text x="450" y="205" textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize="14"
        fill="rgba(242,248,252,0.55)" fontStyle="italic">
        This is to certify that
      </text>

      {/* ── DOCTOR NAME — star of the show ── */}
      <text x="450" y="262" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="42" fontWeight="700"
        fill="url(#goldG)" filter="url(#goldGlow)" letterSpacing="1">
        {doctorName}
      </text>

      {/* ── NAME UNDERLINE ── */}
      <line x1="200" y1="274" x2="700" y2="274" stroke="url(#goldG)" strokeWidth="1.2" opacity="0.50"/>

      {/* ── HAS SUCCESSFULLY COMPLETED ── */}
      <text x="450" y="308" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="14"
        fill="rgba(242,248,252,0.55)" fontStyle="italic">
        has successfully completed the Clinical Training Programme on
      </text>

      {/* ── CLINIVERSE AI PLATFORM ── */}
      <text x="450" y="338" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="20" fontWeight="600"
        fill="#00C8B8" letterSpacing="1" filter="url(#glow)">
        Cliniverse AI — Medical Intelligence Platform
      </text>

      {/* ── STATS ROW ── */}
      {[
        { label: 'Cases Completed', value: String(casesCompleted), x: 200 },
        { label: 'MCQ Correct',     value: String(mcqCorrect),     x: 380 },
        { label: 'Total XP',        value: String(xp),             x: 560 },
        { label: 'Day Streak',      value: `${streak}🔥`,          x: 740 },
      ].map(s => (
        <g key={s.label}>
          {/* Card bg */}
          <rect x={s.x - 70} y="360" width="140" height="54" rx="8"
            fill="rgba(0,200,184,0.06)" stroke="rgba(0,200,184,0.20)" strokeWidth="1"/>
          <text x={s.x} y="386" textAnchor="middle"
            fontFamily="Georgia, serif" fontSize="22" fontWeight="700"
            fill="#FFD700" filter="url(#goldGlow)">{s.value}</text>
          <text x={s.x} y="403" textAnchor="middle"
            fontFamily="-apple-system, sans-serif" fontSize="9" fontWeight="500"
            fill="rgba(242,248,252,0.50)" letterSpacing="1">{s.label.toUpperCase()}</text>
        </g>
      ))}

      {/* ── SPECIALTIES (if any) ── */}
      {specialties.length > 0 && (
        <text x="450" y="440" textAnchor="middle"
          fontFamily="Georgia, serif" fontSize="12"
          fill="rgba(242,248,252,0.45)" fontStyle="italic">
          Specialties: {specialties.slice(0, 4).join(' · ')}
        </text>
      )}

      {/* ── BOTTOM DECORATIVE LINE ── */}
      <line x1="80" y1="470" x2="820" y2="470" stroke="url(#goldG)" strokeWidth="0.6" opacity="0.30"/>

      {/* ── SIGNATURE LEFT — Dr. Ahmed Osman ── */}
      <g transform="translate(220, 490)">
        {/* Signature flourish SVG */}
        <path d="M -50 8 C -30 -12 -10 -18 10 -5 C 30 8 40 -8 60 -2 C 72 2 75 10 80 8"
          fill="none" stroke="#00C8B8" strokeWidth="1.8" strokeLinecap="round" opacity="0.70"/>
        <line x1="-55" y1="18" x2="85" y2="18" stroke="url(#goldG)" strokeWidth="0.7" opacity="0.40"/>
        <text x="15" y="32" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="10" fontWeight="600"
          fill="rgba(242,248,252,0.65)" letterSpacing="0.5">Dr. Ahmed Osman</text>
        <text x="15" y="45" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="9"
          fill="rgba(242,248,252,0.40)">Founder, Cliniverse AI</text>
      </g>

      {/* ── SEAL — center ── */}
      <g transform="translate(450, 510)">
        {/* Outer ring */}
        <circle cx="0" cy="0" r="38" fill="rgba(0,200,184,0.05)"
          stroke="url(#goldG)" strokeWidth="1.5" opacity="0.70"/>
        {/* Inner ring */}
        <circle cx="0" cy="0" r="30" fill="none"
          stroke="url(#goldG)" strokeWidth="0.6" opacity="0.40"/>
        {/* Star points */}
        {Array.from({length: 12}).map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180
          const r1 = 34, r2 = 38
          const x1 = Math.cos(angle) * r1, y1 = Math.sin(angle) * r1
          const x2 = Math.cos(angle) * r2, y2 = Math.sin(angle) * r2
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="1" opacity="0.50"/>
        })}
        {/* Mini logo in seal */}
        <path d="M 8 -8 A 10 10 0 1 0 8 8" fill="none" stroke="url(#tealG)" strokeWidth="3" strokeLinecap="round" filter="url(#glow)"/>
        <circle cx="8" cy="-8" r="2" fill="#00E5D4"/>
        <circle cx="8" cy="8"  r="2" fill="#0096FF"/>
        {/* OFFICIAL text around seal */}
        <text x="0" y="-16" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="5.5" fontWeight="700"
          fill="#FFD700" letterSpacing="2" opacity="0.70">OFFICIAL</text>
        <text x="0" y="23" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="5" fontWeight="600"
          fill="rgba(242,248,252,0.50)" letterSpacing="1.5">CLINIVERSE AI</text>
      </g>

      {/* ── SIGNATURE RIGHT — Vision 2030 ── */}
      <g transform="translate(680, 490)">
        <path d="M -50 8 C -30 -15 0 -20 20 -3 C 40 10 55 -5 75 5"
          fill="none" stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" opacity="0.60"/>
        <line x1="-55" y1="18" x2="85" y2="18" stroke="url(#goldG)" strokeWidth="0.7" opacity="0.40"/>
        <text x="15" y="32" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="10" fontWeight="600"
          fill="rgba(242,248,252,0.65)" letterSpacing="0.5">Cliniverse AI</text>
        <text x="15" y="45" textAnchor="middle"
          fontFamily="-apple-system, sans-serif" fontSize="9"
          fill="rgba(242,248,252,0.40)">🇸🇦 Vision 2030 Aligned</text>
      </g>

      {/* ── DATE & CERT ID ── */}
      <text x="450" y="580" textAnchor="middle"
        fontFamily="-apple-system, sans-serif" fontSize="10"
        fill="rgba(242,248,252,0.35)" letterSpacing="1">
        Issued: {date}  ·  Certificate ID: {certId}  ·  cliniverseai.com
      </text>

      {/* ── BOTTOM TEAL LINE ── */}
      <line x1="18" y1="600" x2="882" y2="600" stroke="url(#tealG)" strokeWidth="2.5" opacity="0.18"/>
    </svg>
  )
}

export default function CertificateGenerator({ doctorName, casesCompleted, mcqCorrect, xp, streak, specialties = [], onClose }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [shared, setShared]           = useState(false)

  const downloadPNG = async () => {
    setDownloading(true)
    try {
      const svgEl = svgRef.current
      if (!svgEl) return
      const svgData = new XMLSerializer().serializeToString(svgEl)
      const canvas  = document.createElement('canvas')
      canvas.width  = 1800; canvas.height = 1272
      const ctx     = canvas.getContext('2d')!
      const img     = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1800, 1272)
        const link    = document.createElement('a')
        link.download = `Cliniverse-Certificate-${doctorName.replace(/\s/g,'-')}.png`
        link.href     = canvas.toDataURL('image/png', 1.0)
        link.click()
        setDownloading(false)
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    } catch { setDownloading(false) }
  }

  const shareLinkedIn = () => {
    const text = `🎓 I just earned my Clinical Training Certificate on Cliniverse AI!\n\n📊 ${casesCompleted} cases completed · ${mcqCorrect} MCQ correct · ${xp} XP\n\n🇸🇦 Proud to be part of the future of medical education.\n\n#CliniverseAI #MedEd #Vision2030 #MedicalAI`
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://cliniverseai.com') + '&summary=' + encodeURIComponent(text), '_blank')
    setShared(true)
  }

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        {onClose && (
          <button onClick={onClose} style={{ background:'var(--bg-card-2,rgba(255,255,255,0.07))', backdropFilter:'blur(16px)', border:'1px solid var(--border-card,rgba(255,255,255,0.12))', borderRadius:12, padding:'9px 16px', color:'var(--text-secondary,rgba(238,246,250,0.72))', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F }}>← Back</button>
        )}
        <div>
          <div style={{ fontSize:10, color:'#FFD700CC', fontWeight:700, letterSpacing:1.5, marginBottom:3 }}>CERTIFICATE GENERATOR</div>
          <div style={{ fontSize:18, fontWeight:900, color:'var(--text-primary, #F2F8FC)', letterSpacing:-0.4 }}>
            Your <span style={{ color:'#FFD700' }}>Achievement</span>
          </div>
        </div>
      </div>

      {/* Certificate preview */}
      <div style={{ borderRadius:16, overflow:'hidden', border:'1.5px solid rgba(255,214,10,0.25)', marginBottom:16, boxShadow:'0 8px 32px rgba(0,0,0,0.50)' }}>
        <div style={{ overflowX:'auto' }}>
          <svg ref={svgRef as any} width="900" height="636" viewBox="0 0 900 636"
            xmlns="http://www.w3.org/2000/svg" fontFamily="Georgia, 'Times New Roman', serif"
            style={{ display:'block', minWidth:320, width:'100%', height:'auto' }}>
            <CertificateSVG
              doctorName={doctorName} casesCompleted={casesCompleted}
              mcqCorrect={mcqCorrect} xp={xp} streak={streak} specialties={specialties}
              onClose={onClose}/>
          </svg>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={downloadPNG} disabled={downloading} style={{
          width:'100%', padding:'15px', borderRadius:18, border:'none',
          background: downloading ? 'rgba(255,214,10,0.15)' : 'linear-gradient(135deg,#FFD700,#B8860B)',
          color: downloading ? '#FFD700' : '#000',
          fontSize:15, fontWeight:900, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily:F,
          boxShadow:'0 6px 24px rgba(255,214,10,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          {downloading ? '⏳ Preparing...' : '⬇️ Download Certificate (PNG)'}
        </button>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={shareLinkedIn} style={{
            flex:1, padding:'13px', borderRadius:16,
            border:'1px solid rgba(10,102,194,0.35)',
            background: shared ? 'rgba(10,102,194,0.20)' : 'rgba(10,102,194,0.12)',
            color: shared ? '#1A8CFF' : 'rgba(242,248,252,0.72)',
            fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:F,
          }}>
            {shared ? '✓ Shared!' : '💼 Share on LinkedIn'}
          </button>

          <button onClick={() => {
            const text = `🎓 Earned my Clinical Training Certificate on Cliniverse AI!\n${casesCompleted} cases · ${xp} XP · ${streak} day streak\n#CliniverseAI #MedEd`
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank')
          }} style={{
            flex:1, padding:'13px', borderRadius:16,
            border:'1px solid rgba(29,161,242,0.25)',
            background:'rgba(29,161,242,0.10)',
            color:'var(--text-secondary,rgba(242,248,252,0.72))',
            fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:F,
          }}>
            𝕏 Share on X
          </button>
        </div>

        <button onClick={() => {
          const text = `🎓 Clinical Training Certificate\n\nDoctor: ${doctorName}\nCases: ${casesCompleted} · MCQ: ${mcqCorrect} · XP: ${xp}\n\nIssued by Cliniverse AI — cliniverseai.com`
          window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
        }} style={{
          width:'100%', padding:'13px', borderRadius:16,
          border:'1px solid rgba(37,211,102,0.25)',
          background:'rgba(37,211,102,0.08)',
          color:'var(--text-secondary,rgba(242,248,252,0.72))',
          fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:F,
        }}>
          💬 Share via WhatsApp
        </button>
      </div>

      <div style={{ marginTop:14, background:'rgba(212,168,71,0.06)', border:'1px solid rgba(212,168,71,0.15)', borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
        <div style={{ fontSize:10, color:'var(--text-muted,rgba(238,246,250,0.45))' }}>
          ⭐ Certificate issued by Cliniverse AI · 🇸🇦 Vision 2030 Aligned
        </div>
      </div>
    </div>
  )
}
