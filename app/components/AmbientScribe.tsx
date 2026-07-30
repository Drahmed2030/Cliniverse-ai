'use client'
import { useState, useRef, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

// Bioluminescence glow animation styles
const BIO_GLOW = `
  @keyframes bioGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0,196,180,0.4), 0 0 40px rgba(0,196,180,0.2), 0 0 80px rgba(0,196,180,0.1); }
    50% { box-shadow: 0 0 30px rgba(0,196,180,0.7), 0 0 60px rgba(0,196,180,0.4), 0 0 100px rgba(0,196,180,0.2); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  @keyframes waveform {
    0% { height: 4px; }
    50% { height: 24px; }
    100% { height: 4px; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scaleX(1); }
    10% { transform: scaleX(1.05); }
    20% { transform: scaleX(0.98); }
    30% { transform: scaleX(1.02); }
  }
`

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: active ? T.teal : 'rgba(255,255,255,0.20)',
          height: active ? undefined : 4,
          animation: active ? `waveform ${0.4 + i * 0.08}s ease-in-out infinite` : 'none',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )
}

export default function AmbientScribe({ onXP }: { onXP?: (n: number) => void }) {
  const [phase, setPhase]           = useState<'idle'|'recording'|'processing'|'result'>('idle')
  const [transcript, setTranscript] = useState('')
  const [soapNote, setSoapNote]     = useState('')
  const [duration, setDuration]     = useState(0)
  const [lang, setLang]             = useState<'en'|'ar'>('en')
  const [copied, setCopied]         = useState(false)
  const [patientName, setPatientName] = useState('')
  const [error, setError]           = useState('')

  const recognitionRef = useRef<any>(null)
  const timerRef       = useRef<any>(null)
  const fullTranscript = useRef('')

  useEffect(() => {
    return () => {
      stopRecording()
      clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = () => {
    setError('')
    fullTranscript.current = ''
    setTranscript('')
    setDuration(0)

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Safari.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      fullTranscript.current += final
      setTranscript(fullTranscript.current + interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError('Microphone error: ' + event.error)
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setPhase('recording')

    timerRef.current = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    clearInterval(timerRef.current)
  }

  const finishAndGenerate = async () => {
    stopRecording()
    if (!fullTranscript.current.trim() && !transcript.trim()) {
      setError('No speech detected. Please try again.')
      setPhase('idle')
      return
    }
    setPhase('processing')
    const text = fullTranscript.current || transcript

    try {
      const prompt = lang === 'en'
        ? `You are an expert medical scribe. Convert this consultation transcript into a professional SOAP note.

Patient: ${patientName || 'Patient'}
Transcript: "${text}"

Generate a complete SOAP note:

SUBJECTIVE:
[Chief complaint, HPI, symptoms, duration, associated symptoms]

OBJECTIVE:
[Vital signs if mentioned, examination findings, investigations]

ASSESSMENT:
[Primary diagnosis, differential diagnoses]

PLAN:
[Medications with doses, investigations ordered, referrals, follow-up, patient education]

Be clinically precise. If information is missing, note "Not documented".`
        : `أنت كاتب طبي خبير. حول نص هذه الاستشارة إلى ملاحظة SOAP احترافية.

المريض: ${patientName || 'المريض'}
النص: "${text}"

أنشئ ملاحظة SOAP كاملة:

ذاتي (Subjective):
[الشكوى الرئيسية، التاريخ المرضي، الأعراض، المدة]

موضوعي (Objective):
[العلامات الحيوية إن ذكرت، نتائج الفحص، الفحوصات]

التقييم (Assessment):
[التشخيص الأولي، التشخيصات التفريقية]

الخطة (Plan):
[الأدوية مع الجرعات، الفحوصات المطلوبة، الإحالات، المتابعة]

كن دقيقاً سريرياً. إذا كانت المعلومات مفقودة، اكتب "لم يُوثَّق".`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      setSoapNote(data.content?.[0]?.text || 'Could not generate note.')
      setPhase('result')
      onXP?.(25)
    } catch {
      setError('Connection error. Please try again.')
      setPhase('idle')
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const copy = () => {
    navigator.clipboard.writeText(soapNote)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setPhase('idle')
    setTranscript('')
    setSoapNote('')
    setDuration(0)
    setError('')
    fullTranscript.current = ''
  }

  // ── RESULT VIEW ──
  if (phase === 'result') {
    return (
      <div style={{ fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={reset} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← New</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>🎙️ SOAP Note Generated</div>
            <div style={{ fontSize: 11, color: T.teal }}>{patientName || 'Patient'} · {formatTime(duration)}</div>
          </div>
          <button onClick={copy} style={{ background: copied ? T.green + '20' : T.glass, border: '1px solid ' + (copied ? T.green : T.border), borderRadius: 12, padding: '8px 14px', color: copied ? T.green : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
            {copied ? '✓ Copied' : '📋'}
          </button>
        </div>

        {/* Transcript */}
        <div style={{ background: T.glass2, border: '1px solid ' + T.border, borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>🎤 TRANSCRIPT</div>
          <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.7, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>{transcript.substring(0, 200)}{transcript.length > 200 ? '...' : ''}</div>
        </div>

        {/* SOAP Note */}
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.teal + '25', borderRadius: 20, padding: '18px', marginBottom: 16, animation: 'bioGlow 3s ease-in-out infinite' }}>
          <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>📋 AI SOAP NOTE</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 2, whiteSpace: 'pre-line', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>{soapNote}</div>
        </div>

        {/* Share buttons */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>SHARE</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { icon: '💬', label: 'WhatsApp', color: '#25D366', action: () => window.open('https://wa.me/?text=' + encodeURIComponent('📋 SOAP Note\n\n' + soapNote.substring(0, 500)), '_blank') },
            { icon: '🔗', label: 'LinkedIn', color: '#0A66C2', action: () => window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://cliniverseai.com'), '_blank') },
            { icon: '𝕏', label: 'X/Twitter', color: '#0a1628', action: () => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Generated a SOAP note with @CliniverseAI 🎙️ #MedicalAI #Healthcare'), '_blank') },
          ].map(s => (
            <button key={s.label} onClick={s.action} style={{ flex: 1, padding: '10px 8px', borderRadius: 14, border: '1px solid ' + s.color + '30', background: s.color + '12', color: s.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div style={{ background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: T.muted }}>⭐ Always review AI-generated notes before filing</div>
        </div>
        <style>{BIO_GLOW}</style>
      </div>
    )
  }

  // ── PROCESSING VIEW ──
  if (phase === 'processing') {
    return (
      <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,' + T.teal + '30,transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'bioGlow 2s ease-in-out infinite' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid ' + T.teal, animation: 'spin 0.8s linear infinite' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 8 }}>Generating SOAP Note...</div>
        <div style={{ fontSize: 13, color: T.sub }}>AI is processing your consultation</div>
        <style>{BIO_GLOW}</style>
      </div>
    )
  }

  // ── RECORDING VIEW ──
  if (phase === 'recording') {
    return (
      <div style={{ fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>🎙️ Recording Consultation</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,59,48,0.12)', border: '1px solid ' + T.red + '30', borderRadius: 20, padding: '4px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.red, animation: 'pulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: T.red }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bioluminescence recording visualizer */}
        <div style={{ background: 'radial-gradient(ellipse at center, rgba(0,196,180,0.08) 0%, rgba(0,122,255,0.04) 50%, transparent 70%)', border: '1.5px solid ' + T.teal + '30', borderRadius: 24, padding: '32px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'bioGlow 2s ease-in-out infinite', position: 'relative', overflow: 'hidden' }}>
          {/* Neural network background dots */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%', background: T.teal, opacity: 0.2 + i * 0.05, left: (i * 13) + '%', top: (i * 11 + 10) + '%', animation: `pulse ${1 + i * 0.2}s ease-in-out infinite` }} />
          ))}

          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,' + T.teal + '20,transparent 70%)', border: '2px solid ' + T.teal + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'bioGlow 1.5s ease-in-out infinite' }}>
            🎙️
          </div>

          <WaveformBars active={true} />

          <div style={{ fontSize: 14, fontWeight: 700, color: T.teal }}>Listening to consultation...</div>
          <div style={{ fontSize: 12, color: T.sub }}>Speak naturally — AI will transcribe</div>
        </div>

        {/* Live transcript */}
        {transcript && (
          <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 16, padding: '14px', marginBottom: 16, maxHeight: 150, overflowY: 'auto' }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LIVE TRANSCRIPT</div>
            <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.7, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>{transcript}</div>
          </div>
        )}

        {/* Stop button */}
        <button onClick={finishAndGenerate} style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg,' + T.red + ',#CC1000)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 8px 28px rgba(255,59,48,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          ⏹ Stop & Generate SOAP Note
        </button>
        <style>{BIO_GLOW}</style>
      </div>
    )
  }

  // ── IDLE VIEW ──
  return (
    <div style={{ fontFamily: F }}>

      {/* Header with bioluminescence */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: T.teal + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>AMBIENT AI SCRIBE</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          <span style={{ color: T.teal }}>Ambient</span> Scribe
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Record consultation → AI generates SOAP note</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { l: 'Time saved', v: '2h/day', c: T.teal   },
          { l: 'Accuracy',  v: '94%',    c: T.green   },
          { l: 'Languages', v: 'EN+AR',  c: T.blue    },
          { l: 'Format',    v: 'SOAP',   c: T.purple  },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Patient name */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>PATIENT NAME (optional)</div>
        <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter patient name..." style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
      </div>

      {/* Language toggle */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([['en', '🇬🇧 English'], ['ar', '🇸🇦 العربية']] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setLang(id as any)} style={{ flex: 1, padding: '10px', cursor: 'pointer', borderRadius: 10, fontFamily: F, fontWeight: 700, fontSize: 12, border: lang === id ? '1px solid ' + T.teal + '25' : '1px solid transparent', background: lang === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: lang === id ? T.teal : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Main start button — Bioluminescence */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', inset: -2, borderRadius: 22, background: 'radial-gradient(ellipse at center,' + T.teal + '20,transparent 70%)', animation: 'bioGlow 3s ease-in-out infinite', pointerEvents: 'none' }} />
        <button onClick={startRecording} style={{ width: '100%', padding: '20px', borderRadius: 20, border: '1.5px solid ' + T.teal + '40', background: 'linear-gradient(135deg,rgba(0,196,180,0.15),rgba(0,122,255,0.10))', color: T.text, fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle,' + T.teal + '25,transparent 70%)', border: '2px solid ' + T.teal + '50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, animation: 'bioGlow 2s ease-in-out infinite' }}>
            🎙️
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 4 }}>Start Consultation</div>
            <div style={{ fontSize: 11, color: T.sub }}>Tap to begin recording · Speak naturally</div>
          </div>
          <WaveformBars active={false} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid ' + T.red + '25', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.red, fontWeight: 600 }}>⚠️ {error}</div>
        </div>
      )}

      {/* How it works */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 18, padding: '16px' }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>HOW IT WORKS</div>
        {[
          { icon: '🎙️', step: '1', text: 'Tap Start — speak naturally with your patient' },
          { icon: '📝', step: '2', text: 'AI transcribes in real-time (EN or AR)' },
          { icon: '🤖', step: '3', text: 'Tap Stop — Claude generates full SOAP note' },
          { icon: '📋', step: '4', text: 'Review, copy, or share — done in seconds' },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: T.teal + '15', border: '1px solid ' + T.teal + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.5 }}>{s.text}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Saves 2 hours of documentation per day · HIPAA-aware design</div>
      </div>

      <style>{BIO_GLOW + ' input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}
