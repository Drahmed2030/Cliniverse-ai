import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function isAuthorizedCron(req: Request) {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  return req.headers.get('authorization') === `Bearer ${expected}`
}

async function supabaseFetch(path: string, options: any = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers,
    }
  })
  return res.json()
}

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await supabaseFetch('pulse_questions?active=eq.true', {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      prefer: 'return=minimal',
    })

    const unused = await supabaseFetch('pulse_questions?active=eq.false&activated_at=is.null&limit=1')

    if(unused?.length > 0) {
      await supabaseFetch(`pulse_questions?id=eq.${unused[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: true,
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString()
        }),
        prefer: 'return=minimal',
      })
      return NextResponse.json({ success: true, source: 'existing', id: unused[0].id })
    }

    const specialties = ['Cardiology','Emergency','Critical Care','Neurology','Internal Medicine']
    const specialty = specialties[Math.floor(Math.random() * specialties.length)]

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Generate a clinical MCQ for ${specialty}. Return ONLY valid JSON with no markdown:\n{"question":"...","options":[{"key":"a","label":"...","emoji":"💊"},{"key":"b","label":"...","emoji":"💉"},{"key":"c","label":"...","emoji":"🩺"},{"key":"d","label":"...","emoji":"🔬"}],"correct_key":"a","explanation":"...","specialty":"${specialty}","difficulty":"Intermediate","pearl":"..."}`
        }]
      })
    })

    const aiData = await aiRes.json()
    const text = aiData.content?.[0]?.text || '{}'
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
    const q = JSON.parse(clean)

    await supabaseFetch('pulse_questions', {
      method: 'POST',
      body: JSON.stringify({
        ...q,
        active: true,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString()
      }),
    })

    return NextResponse.json({ success: true, source: 'ai_generated', specialty })
  } catch {
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
