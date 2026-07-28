'use client'
import { useState, useRef } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'
const T = {
  bg: '#1e2d40', card: 'rgba(36,63,82,0.60)', border: 'rgba(255,255,255,0.18)',
  text: '#ffffff', sub: 'rgba(148,163,184,0.8)', muted: 'rgba(148,163,184,0.4)',
  teal: '#38bdf8', amber: '#fbbf24', rose: '#f87171', green: '#4ade80', purple: '#00DFD0',
}

const QUICK = [
  'Warfarin dose adjustment in AF',
  'STEMI vs NSTEMI management',
  'Sepsis 3 criteria and bundle',
  'DKA insulin protocol',
  'Hypertensive emergency treatment',
  'PE risk stratification',
]

interface Msg { role: 'user' | 'ai', text: string }

export default function PocketConsultant({ onXP }: { onXP?: (n: number) => void }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)

    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: 'Clinical Consultation',
          difficulty: 'Advanced',
          userPrompt: q,
          systemPrompt: 'You are an expert clinical consultant. Answer medical questions concisely and accurately. Format: start with a direct answer, then key points as numbered list, end with a clinical pearl. Plain text only, no JSON, no markdown headers.',
          fullCase: false,
        }),
      })
      const data = await res.json()
      let answer = ''
      if (data.success && data.case) {
        if (typeof data.case === 'string') answer = data.case
        else if (data.case.management) answer = data.case.management.join('\n')
        else answer = JSON.stringify(data.case)
      } else {
        answer = data.error || 'Unable to respond. Check API key.'
      }
      setMessages(m => [...m, { role: 'ai', text: answer }])
      if (onXP) onXP(10)
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Network error. Please try again.' }])
    }
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', height: '75vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,223,208,0.1), rgba(56,189,248,0.06))',
        border: '1px solid rgba(0,223,208,0.2)', borderRadius: 20, padding: '14px 18px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 9, color: T.purple, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>AI Clinical Consultant</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Pocket Consultant 🧠</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Ask any clinical question — powered by Claude AI</div>
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 8 }}>Quick Questions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {QUICK.map((q, i) => (
              <button key={i} onClick={() => ask(q)} style={{
                background: T.card, border: '1px solid ' + T.border, borderRadius: 14,
                padding: '10px 14px', color: T.sub, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: F, textAlign: 'left' as const,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: T.purple, fontSize: 14 }}>→</span> {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {m.role === 'ai' && (
                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(0,223,208,0.15)', border: '1px solid rgba(0,223,208,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🧠</div>
              )}
              <div style={{
                maxWidth: '80%', padding: '12px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg, #a78bfa, #38bdf8)' : T.card,
                border: m.role === 'ai' ? '1px solid ' + T.border : 'none',
                fontSize: 13, color: T.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' as const,
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(0,223,208,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
              <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: T.purple, opacity: 0.6 }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, background: T.card, border: '1px solid rgba(0,223,208,0.2)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input) } }}
            placeholder="Ask a clinical question..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: T.text, fontSize: 14, fontFamily: F, resize: 'none', lineHeight: 1.5,
            }}
          />
        </div>
        <button onClick={() => ask(input)} disabled={loading || !input.trim()} style={{
          width: 46, height: 46, borderRadius: 14, border: 'none', flexShrink: 0,
          background: loading || !input.trim() ? 'rgba(36,63,82,0.65)' : 'linear-gradient(135deg, #a78bfa, #38bdf8)',
          cursor: loading || !input.trim() ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          boxShadow: loading || !input.trim() ? 'none' : '0 4px 16px rgba(0,223,208,0.3)',
        }}>↑</button>
      </div>
      <style>{`textarea::placeholder{color:rgba(148,163,184,0.4);}textarea{scrollbar-width:none;}`}</style>
    </div>
  )
}
