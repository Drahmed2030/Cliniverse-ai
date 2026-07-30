'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

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

const SPECIALTIES = ['Cardiology','Critical Care','Nephrology','Neurology','Emergency','Respiratory','Pediatrics','Endocrinology','Infectious Disease','Surgery']

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Published'
  const days = Math.floor(diff / 86400000)
  const hrs  = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `In ${days}d ${hrs}h`
  return `In ${hrs}h`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
}

// ── LECTURE DETAIL ──
function LectureDetail({ lecture, onBack }: { lecture: any, onBack: () => void }) {
  const [lang, setLang]           = useState<'en'|'ar'>('en')
  const [audioUrl, setAudioUrl]   = useState('')
  const [generating, setGenerating] = useState(false)
  const [playing, setPlaying]     = useState(false)
  const [question, setQuestion]   = useState('')
  const [questions, setQuestions] = useState<any[]>([])
  const [answering, setAnswering] = useState(false)
  const [mcq, setMcq]             = useState<any>(null)
  const [mcqLoading, setMcqLoading] = useState(false)
  const [voted, setVoted]         = useState(false)
  const [votes, setVotes]         = useState(lecture.votes || 0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const content = lang === 'en' ? lecture.content_en : lecture.content_ar
  const isPublished = lecture.status === 'published'

  useEffect(() => {
    supabase.from('lecture_questions').select('*').eq('lecture_id', lecture.id).order('created_at', { ascending: true }).then(({ data }) => { if (data) setQuestions(data) })
  }, [lecture.id])

  // Generate TTS audio
  const generateAudio = async () => {
    if (!content) return
    setGenerating(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, lang }),
      })
      const data = await res.json()
      if (data.url) {
        setAudioUrl(data.url)
        const col = lang === 'en' ? 'audio_url_en' : 'audio_url_ar'
        await supabase.from('lectures').update({ [col]: data.url }).eq('id', lecture.id)
      }
    } catch {}
    setGenerating(false)
  }

  // Ask AI question
  const askQuestion = async () => {
    if (!question.trim()) return
    setAnswering(true)
    const q = question.trim()
    setQuestion('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `You are a clinical expert presenting a lecture on: "${lecture.title}"\n\nLecture content: ${content?.substring(0, 500)}\n\nDoctor's question: ${q}\n\nAnswer concisely and clinically. ${lang === 'ar' ? 'Reply in Arabic.' : 'Reply in English.'}`
          }]
        })
      })
      const data = await res.json()
      const answer = data.content?.[0]?.text || 'Could not generate answer.'
      const newQ = { id: `local_${Date.now()}`, lecture_id: lecture.id, question: q, answer, created_at: new Date().toISOString() }
      setQuestions(prev => [...prev, newQ])
      try { await supabase.from('lecture_questions').insert([{ lecture_id: lecture.id, question: q, answer }]) } catch {}
    } catch {}
    setAnswering(false)
  }

  // Generate MCQ
  const generateMCQ = async () => {
    setMcqLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Based on this lecture: "${lecture.title}"\n${content?.substring(0, 600)}\n\nGenerate 1 MCQ. Return ONLY JSON:\n{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."}`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      setMcq(JSON.parse(clean))
    } catch {}
    setMcqLoading(false)
  }

  const vote = async () => {
    if (voted) return
    setVoted(true)
    setVotes((v: number) => v + 1)
    try {
      await supabase.from('lectures').update({ votes: votes + 1 }).eq('id', lecture.id)
      await supabase.from('lecture_votes').insert([{ lecture_id: lecture.id }])
    } catch {}
  }

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.text, lineHeight: 1.3 }}>{lang === 'en' ? lecture.title : (lecture.title_ar || lecture.title)}</div>
          <div style={{ fontSize: 10, color: T.teal, fontWeight: 600, marginTop: 2 }}>{lecture.specialty} · {lecture.duration_mins} min</div>
        </div>
      </div>

      {/* Status + vote */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: isPublished ? T.green + '12' : T.orange + '12', border: '1px solid ' + (isPublished ? T.green : T.orange) + '30', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isPublished ? T.green : T.orange, boxShadow: '0 0 6px ' + (isPublished ? T.green : T.orange) }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: isPublished ? T.green : T.orange }}>{isPublished ? 'AVAILABLE NOW' : timeUntil(lecture.scheduled_at)}</span>
        </div>
        <button onClick={vote} style={{ background: voted ? T.red + '15' : T.glass, border: '1px solid ' + (voted ? T.red : T.border), borderRadius: 14, padding: '10px 14px', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{voted ? '❤️' : '🤍'}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: voted ? T.red : T.muted }}>{votes}</span>
        </button>
      </div>

      {/* Language toggle */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([['en', '🇬🇧 English'], ['ar', '🇸🇦 العربية']] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setLang(id as any); setAudioUrl('') }} style={{ flex: 1, padding: '9px', cursor: 'pointer', borderRadius: 10, fontFamily: F, fontWeight: 700, fontSize: 12, border: lang === id ? '1px solid ' + T.teal + '25' : '1px solid transparent', background: lang === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: lang === id ? T.teal : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Audio Player */}
      {isPublished && (
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.purple + '25', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.purple, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>🎙️ AI AUDIO LECTURE</div>

          {!audioUrl ? (
            <button onClick={generateAudio} disabled={generating} style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: generating ? 'rgba(175,82,222,0.2)' : 'linear-gradient(135deg,' + T.purple + ',' + T.blue + ')', color: '#fff', fontSize: 14, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {generating
                ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Generating audio...</>
                : '🎙️ Generate Audio Lecture'}
            </button>
          ) : (
            <div>
              <audio ref={audioRef} src={audioUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { playing ? audioRef.current?.pause() : audioRef.current?.play() }} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,' + T.purple + ',' + T.blue + ')', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px ' + T.purple + '35', flexShrink: 0 }}>
                  {playing ? '⏸' : '▶️'}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{playing ? 'Now playing...' : 'Tap to listen'}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{lecture.duration_mins} min · AI Voice · {lang === 'en' ? 'English' : 'Arabic'}</div>
                </div>
                <button onClick={generateAudio} disabled={generating} style={{ background: T.glass2, border: '1px solid ' + T.border, borderRadius: 10, padding: '6px 10px', color: T.muted, fontSize: 10, cursor: 'pointer', fontFamily: F }}>🔄</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lecture content */}
      {content && (
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 18, padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.teal, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>📋 LECTURE NOTES</div>
          <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.9, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>{content}</div>
        </div>
      )}

      {/* MCQ */}
      {isPublished && (
        <div style={{ marginBottom: 16 }}>
          {!mcq ? (
            <button onClick={generateMCQ} disabled={mcqLoading} style={{ width: '100%', padding: '13px', borderRadius: 16, border: '1px solid ' + T.gold + '30', background: T.gold + '10', color: T.gold, fontSize: 13, fontWeight: 700, cursor: mcqLoading ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {mcqLoading ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(212,168,71,0.3)', borderTop: '2px solid ' + T.gold, animation: 'spin 0.8s linear infinite' }} />Generating MCQ...</> : '🧠 Test Your Knowledge'}
            </button>
          ) : (
            <MCQCard mcq={mcq} onReset={() => setMcq(null)} />
          )}
        </div>
      )}

      {/* Q&A */}
      {isPublished && (
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.blue + '22', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>💬 ASK THE LECTURER</div>

          {questions.map((q, i) => (
            <div key={q.id || i} style={{ marginBottom: 12 }}>
              <div style={{ background: T.blue + '12', border: '1px solid ' + T.blue + '20', borderRadius: 12, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: T.blue, fontWeight: 700, marginBottom: 3 }}>❓ Question</div>
                <div style={{ fontSize: 12, color: T.text }}>{q.question}</div>
              </div>
              {q.answer && (
                <div style={{ background: T.teal + '08', border: '1px solid ' + T.teal + '18', borderRadius: 12, padding: '10px 12px', marginLeft: 12 }}>
                  <div style={{ fontSize: 10, color: T.teal, fontWeight: 700, marginBottom: 3 }}>🤖 AI Answer</div>
                  <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{q.answer}</div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askQuestion()} placeholder={lang === 'ar' ? 'اكتب سؤالك...' : 'Ask a question...'} style={{ flex: 1, padding: '11px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F }} />
            <button onClick={askQuestion} disabled={answering || !question.trim()} style={{ padding: '11px 18px', borderRadius: 14, border: 'none', background: !question.trim() ? 'rgba(0,122,255,0.15)' : 'linear-gradient(135deg,' + T.blue + ',' + T.teal + ')', color: '#fff', fontSize: 13, fontWeight: 700, cursor: !question.trim() ? 'not-allowed' : 'pointer', fontFamily: F }}>
              {answering ? '...' : '→'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ PulseAcademy — Educational content for medical professionals</div>
      </div>

      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── MCQ CARD ──
function MCQCard({ mcq, onReset }: { mcq: any, onReset: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const isCorrect = selected === mcq.correct

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.gold + '22', borderRadius: 18, padding: '16px' }}>
      <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>🧠 KNOWLEDGE CHECK</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.5, marginBottom: 14 }}>{mcq.question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {mcq.options.map((opt: string, i: number) => {
          const isThis = selected === i
          const showCorrect = selected !== null && i === mcq.correct
          const bg = showCorrect ? T.green + '18' : isThis && !isCorrect ? T.red + '18' : isThis ? T.green + '18' : T.glass2
          const border = showCorrect ? T.green : isThis && !isCorrect ? T.red : T.border
          return (
            <div key={i} onClick={() => !selected && setSelected(i)} style={{ background: bg, border: '1px solid ' + border, borderRadius: 12, padding: '11px 14px', cursor: selected === null ? 'pointer' : 'default', fontSize: 13, color: T.text, fontWeight: isThis || showCorrect ? 700 : 400, transition: 'all 0.2s' }}>{opt}</div>
          )
        })}
      </div>
      {selected !== null && (
        <div>
          <div style={{ background: isCorrect ? T.green + '12' : T.red + '12', border: '1px solid ' + (isCorrect ? T.green : T.red) + '25', borderRadius: 12, padding: '10px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: isCorrect ? T.green : T.red, marginBottom: 4 }}>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</div>
            <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{mcq.explanation}</div>
          </div>
          <button onClick={onReset} style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass, color: T.sub, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>🔄 New Question</button>
        </div>
      )}
    </div>
  )
}

// ── MAIN ──
export default function PulseAcademy({ onXP }: { onXP?: (n: number) => void }) {
  const [lectures, setLectures]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<any>(null)
  const [filter, setFilter]         = useState('All')
  const [tab, setTab]               = useState<'upcoming'|'published'>('upcoming')

  useEffect(() => {
    supabase.from('lectures').select('*').order('scheduled_at', { ascending: true }).then(({ data }) => {
      if (data) setLectures(data)
      setLoading(false)
    })
  }, [])

  if (selected) return <LectureDetail lecture={selected} onBack={() => setSelected(null)} />

  const upcoming  = lectures.filter(l => l.status === 'upcoming')
  const published = lectures.filter(l => l.status === 'published')
  const shown     = (tab === 'upcoming' ? upcoming : published).filter(l => filter === 'All' || l.specialty === filter)

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.purple + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>PULSE ACADEMY</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Pulse<span style={{ color: T.purple }}>Academy</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>AI-powered medical lectures · Vote for topics</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Upcoming',  v: upcoming.length,  c: T.orange },
          { l: 'Published', v: published.length, c: T.green  },
          { l: 'Languages', v: '2',              c: T.teal   },
          { l: 'AI Voice',  v: 'Live',           c: T.purple },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 4, marginBottom: 14, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([['upcoming', '📅 Upcoming'], ['published', '🎙️ Listen Now']] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)} style={{ flex: 1, padding: '10px 8px', cursor: 'pointer', borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 12, border: tab === id ? '1px solid ' + T.purple + '25' : '1px solid transparent', background: tab === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: tab === id ? T.purple : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Specialty filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {['All', ...SPECIALTIES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, background: filter === s ? T.purple + '18' : T.glass2, border: '1px solid ' + (filter === s ? T.purple : T.border), borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: F, color: filter === s ? T.purple : T.muted, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</button>
        ))}
      </div>

      {/* Lectures list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid ' + T.purple, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: T.sub }}>Loading PulseAcademy...</div>
        </div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: '1px solid ' + T.border }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
          <div style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>No lectures yet</div>
          <div style={{ fontSize: 12, color: T.muted }}>Check back soon</div>
        </div>
      ) : shown.map(lecture => (
        <div key={lecture.id} onClick={() => { setSelected(lecture); onXP?.(5) }} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + (lecture.status === 'published' ? T.green : T.orange) + '22', borderRadius: 20, padding: '16px', marginBottom: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,' + (lecture.status === 'published' ? T.green : T.orange) + '10,transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: lecture.status === 'published' ? T.green : T.orange, boxShadow: '0 0 6px ' + (lecture.status === 'published' ? T.green : T.orange) }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: lecture.status === 'published' ? T.green : T.orange, letterSpacing: 1 }}>
                {lecture.status === 'published' ? '🎙️ AVAILABLE' : '📅 ' + timeUntil(lecture.scheduled_at)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, color: T.muted }}>🤍 {lecture.votes}</span>
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 900, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>{lecture.title}</div>
          {lecture.title_ar && <div style={{ fontSize: 12, color: T.sub, marginBottom: 6, direction: 'rtl' }}>{lecture.title_ar}</div>}
          <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.5, marginBottom: 10 }}>{lecture.description?.substring(0, 100)}...</div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, color: T.purple, background: T.purple + '12', border: '1px solid ' + T.purple + '20', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>{lecture.specialty}</span>
            <span style={{ fontSize: 9, color: T.teal, background: T.teal + '12', border: '1px solid ' + T.teal + '20', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>⏱ {lecture.duration_mins} min</span>
            <span style={{ fontSize: 9, color: T.blue, background: T.blue + '12', border: '1px solid ' + T.blue + '20', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>🌐 EN + AR</span>
            {lecture.scheduled_at && <span style={{ fontSize: 9, color: T.muted, padding: '2px 4px' }}>{formatDate(lecture.scheduled_at)}</span>}
          </div>
        </div>
      ))}

      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
