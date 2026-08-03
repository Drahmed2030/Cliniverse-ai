'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'var(--bg-card,rgba(255,255,255,0.88))',
  glass2: 'var(--bg-card,rgba(255,255,255,0.88))',
  border: 'var(--border-card,rgba(10,132,255,0.10))',
  text:   'var(--text-primary,#EEF6FA)',
  sub:    'var(--text-secondary,rgba(238,246,250,0.72))',
  muted:  'var(--text-muted,rgba(238,246,250,0.50))',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

interface ShareProps {
  title?: string
  content: string
  type?: 'case' | 'prescription' | 'soap' | 'pearl' | 'mcq' | 'report' | 'general'
  hashtags?: string[]
  compact?: boolean
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    build: (content: string, title: string) =>
      'https://wa.me/?text=' + encodeURIComponent(`🏥 *${title}*\n\n${content.substring(0, 800)}\n\n_Shared via Cliniverse AI_`),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    build: (content: string, title: string) =>
      'https://www.linkedin.com/sharing/share-offsite/?url=' +
      encodeURIComponent('https://cliniverseai.com') +
      '&title=' + encodeURIComponent(title) +
      '&summary=' + encodeURIComponent(content.substring(0, 300)),
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: '𝕏',
    color: '#0a1628',
    build: (content: string, title: string, hashtags: string[]) => {
      const tags = hashtags.map(h => '#' + h).join(' ')
      const text = `${content.substring(0, 200)}...\n\n${tags}\n\n#CliniverseAI #MedEd`
      return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text)
    },
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: '✈️',
    color: '#229ED9',
    build: (content: string, title: string) =>
      'https://t.me/share/url?url=' +
      encodeURIComponent('https://cliniverseai.com') +
      '&text=' + encodeURIComponent(`🏥 ${title}\n\n${content.substring(0, 500)}`),
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: '📋',
    color: T.teal,
    build: () => '',
  },
]

const TYPE_CONFIG = {
  case:         { label: 'Clinical Case',    hashtags: ['MedEd','ClinicalCase','Medicine'] },
  prescription: { label: 'Prescription',     hashtags: ['MedEd','Pharmacology','ClinicalPractice'] },
  soap:         { label: 'SOAP Note',        hashtags: ['MedEd','ClinicalDocumentation','AIinMedicine'] },
  pearl:        { label: 'Clinical Pearl',   hashtags: ['ClinicalPearl','MedEd','MedTwitter'] },
  mcq:          { label: 'MCQ Question',     hashtags: ['MedEd','BoardPrep','USMLE'] },
  report:       { label: 'Medical Report',   hashtags: ['MedEd','ClinicalReporting','Healthcare'] },
  general:      { label: 'Medical Content',  hashtags: ['MedEd','Medicine','Healthcare'] },
}

export function SocialShareBar({ title, content, type = 'general', hashtags, compact = false }: ShareProps) {
  const [copied, setCopied] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const cfg = TYPE_CONFIG[type]
  const finalTitle = title || cfg.label
  const finalHashtags = hashtags || cfg.hashtags

  const share = (platform: typeof PLATFORMS[0]) => {
    if (platform.id === 'copy') {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }
    const url = platform.build(content, finalTitle, finalHashtags)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const platforms = compact ? PLATFORMS.slice(0, 3) : PLATFORMS

  return (
    <div>
      {!compact && (
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
          SHARE WITH COLLEAGUES
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => share(p)}
            style={{
              flex: 1,
              padding: compact ? '8px 4px' : '10px 8px',
              borderRadius: 14,
              border: `1px solid ${p.id === 'copy' && copied ? T.green : p.color}30`,
              background: p.id === 'copy' && copied ? T.green + '15' : p.color + '12',
              color: p.id === 'copy' && copied ? T.green : p.color,
              fontSize: compact ? 10 : 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: F,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: compact ? 14 : 18 }}>{p.id === 'copy' && copied ? '✓' : p.icon}</span>
            {!compact && <span style={{ fontSize: 9 }}>{p.id === 'copy' && copied ? 'Copied!' : p.label}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── FULL SHARE MODAL ──
export function ShareModal({ title, content, type = 'general', hashtags, onClose }: ShareProps & { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [edited, setEdited] = useState(content.substring(0, 500))

  const cfg = TYPE_CONFIG[type]
  const finalTitle = title || cfg.label
  const finalHashtags = hashtags || cfg.hashtags

  const share = (platform: typeof PLATFORMS[0]) => {
    if (platform.id === 'copy') {
      navigator.clipboard.writeText(edited)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }
    const url = platform.build(edited, finalTitle, finalHashtags)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: F }}>
      <div style={{ background: 'linear-gradient(180deg,#1e3d52,#162e3e)', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${T.border}` }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.20)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Share {finalTitle}</div>
            <div style={{ fontSize: 11, color: T.sub }}>Choose platform · Edit before sharing</div>
          </div>
          <button onClick={onClose} style={{ background: T.glass2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '6px 12px', color: T.muted, fontSize: 13, cursor: 'pointer', fontFamily: F }}>✕</button>
        </div>

        {/* Edit content */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>CONTENT TO SHARE</div>
        <textarea
          value={edited}
          onChange={e => setEdited(e.target.value)}
          rows={5}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: `1px solid ${T.border}`, background: T.glass, color: T.text, fontSize: 12, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.7, boxSizing: 'border-box', marginBottom: 4 }}
        />
        <div style={{ fontSize: 10, color: T.muted, textAlign: 'right', marginBottom: 16 }}>{edited.length} chars</div>

        {/* Hashtags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {finalHashtags.map(tag => (
            <span key={tag} style={{ fontSize: 10, color: T.blue, background: T.blue + '12', border: `1px solid ${T.blue}20`, borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>#{tag}</span>
          ))}
          <span style={{ fontSize: 10, color: T.teal, background: T.teal + '12', border: `1px solid ${T.teal}20`, borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>#CliniverseAI</span>
        </div>

        {/* Platforms */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>SHARE TO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => share(p)} style={{
              padding: '14px 12px',
              borderRadius: 16,
              border: `1px solid ${p.id === 'copy' && copied ? T.green : p.color}30`,
              background: p.id === 'copy' && copied ? T.green + '15' : p.color + '12',
              color: p.id === 'copy' && copied ? T.green : p.color,
              fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 22 }}>{p.id === 'copy' && copied ? '✓' : p.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{p.id === 'copy' && copied ? 'Copied!' : p.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7, fontWeight: 500 }}>
                  {p.id === 'whatsapp' ? 'Send to colleagues' :
                   p.id === 'linkedin' ? 'Professional network' :
                   p.id === 'twitter'  ? '87% of MDs use X' :
                   p.id === 'telegram' ? 'Medical groups' :
                   'Copy to clipboard'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
          ⭐ Share responsibly — ensure no patient-identifiable information is included
        </div>
      </div>
      <style>{'textarea::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── DEFAULT EXPORT — standalone share button ──
export default function SocialShare({ title, content, type = 'general', hashtags }: ShareProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.glass, backdropFilter: 'blur(16px)',
          border: `1px solid ${T.border}`,
          borderRadius: 14, padding: '10px 16px',
          color: T.sub, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: F,
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: 16 }}>🔗</span>
        Share
      </button>
      {showModal && (
        <ShareModal
          title={title}
          content={content}
          type={type}
          hashtags={hashtags}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
