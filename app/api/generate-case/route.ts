import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const userPrompt = body.userPrompt || ('Generate a ' + difficulty + ' level ' + specialty + ' case.')
    const systemPrompt = body.systemPrompt || 'You are an expert medical educator. Return ONLY a JSON object.'

    // Check cache first
    const cacheKey = specialty + '_' + difficulty + '_' + Math.floor(Date.now() / 3600000)
    const { data: cached } = await supabase
      .from('case_cache')
      .select('case_data')
      .eq('cache_key', cacheKey)
      .single()

    if (cached?.case_data) {
      return NextResponse.json({ success: true, case: cached.case_data, cached: true })
    }

    // Generate new case
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt + ' Return ONLY a JSON object.',
      messages: [{ role: 'user', content: userPrompt + ' JSON only, no markdown.' }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)

    let caseData = { management: [clean], keyLearning: [clean] }
    if (match) {
      try { caseData = JSON.parse(match[0]) } catch {}
    }

    // Save to cache
    await supabase.from('case_cache').upsert({
      cache_key: cacheKey,
      case_data: caseData,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, case: caseData })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
