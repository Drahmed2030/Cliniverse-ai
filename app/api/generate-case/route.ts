import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../../supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FULL_CASE_PROMPT = `You are an expert medical educator creating realistic clinical cases.
Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation.

The JSON must follow this EXACT structure:
{
  "title": "Age, Sex — Chief Complaint",
  "specialty": "specialty name",
  "difficulty": "Beginner|Intermediate|Advanced",
  "brief": "2-3 sentence clinical presentation including PMH, medications",
  "vitals": {
    "BP": "xxx/xx mmHg",
    "HR": "xx bpm",
    "RR": "xx/min",
    "SpO2": "xx% RA",
    "Temp": "xx.x°C",
    "GCS": "xx/15"
  },
  "labs": [
    {"name": "test name", "value": "result with units", "status": "normal|low|high|critical", "ref": "reference range"}
  ],
  "ecg": "Detailed ECG findings as a string",
  "echo": "Detailed Echo findings including EF as a string",
  "xray": "Detailed X-Ray/CT findings as a string",
  "options": [
    {"id": "a", "text": "option text", "correct": false, "explanation": "why this is wrong or right"},
    {"id": "b", "text": "option text", "correct": true, "explanation": "why this is correct"},
    {"id": "c", "text": "option text", "correct": false, "explanation": "why this is wrong"},
    {"id": "d", "text": "option text", "correct": false, "explanation": "why this is wrong"}
  ],
  "question": "What is your FIRST priority management step?",
  "keyLearning": ["point 1", "point 2", "point 3"],
  "management": ["step 1", "step 2", "step 3"]
}

Make labs realistic — include 6-10 relevant tests. Include abnormal values appropriate to the case.
ECG, Echo, and X-Ray findings must be clinically consistent with the diagnosis.
Only ONE option should have correct: true.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const fullCase = body.fullCase || false

    // For daily case — use date as cache key
    const isDaily = body.daily === true
    const cacheKey = isDaily
      ? 'daily_' + new Date().toISOString().split('T')[0]
      : specialty + '_' + difficulty + '_' + Math.floor(Date.now() / 3600000)

    // Check cache
    const { data: cached } = await supabase
      .from('case_cache')
      .select('case_data')
      .eq('cache_key', cacheKey)
      .single()

    if (cached?.case_data) {
      return NextResponse.json({ success: true, case: cached.case_data, cached: true })
    }

    // Build prompt
    const systemPrompt = fullCase || isDaily
      ? FULL_CASE_PROMPT
      : 'You are an expert medical educator. Return ONLY a JSON object.'

    const userPrompt = fullCase || isDaily
      ? `Generate a ${difficulty} level ${specialty} case with complete Labs, ECG, Echo, and X-Ray findings. JSON only.`
      : (body.userPrompt || `Generate a ${difficulty} level ${specialty} case. JSON only.`)

    // Generate
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)

    let caseData: any = { management: [clean], keyLearning: [clean] }
    if (match) {
      try { caseData = JSON.parse(match[0]) } catch {}
    }

    // Save to cache
    await supabase.from('case_cache').upsert({
      cache_key: cacheKey,
      case_data: caseData,
      created_at: new Date().toISOString()
    })

    // Save daily case to separate table
    if (isDaily) {
      await supabase.from('daily_cases').upsert({
        date: new Date().toISOString().split('T')[0],
        case_data: caseData,
        specialty,
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.json({ success: true, case: caseData })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
