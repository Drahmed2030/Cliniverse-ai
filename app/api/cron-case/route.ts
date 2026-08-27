import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: 'Generate a clinical case for medical education. Return ONLY valid JSON: {"title":"case title","specialty":"Cardiology","difficulty":"Intermediate","patient":"58M","presentation":"chest pain for 2 hours","diagnosis":"STEMI","teaching_points":"key learning points"}' }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text ?? '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const caseData = JSON.parse(clean)
    await supabase.from('daily_cases').insert([{ ...caseData, source: 'ai' }])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
