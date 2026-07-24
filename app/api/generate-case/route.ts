import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const userPrompt = body.userPrompt || ('Generate a ' + difficulty + ' level ' + specialty + ' case.')
    const systemPrompt = body.systemPrompt || 'You are an expert medical educator. Respond with valid JSON only.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt + ' Return ONLY a JSON object.',
      messages: [{ role: 'user', content: userPrompt + ' JSON only, no markdown.' }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)

    if (!match) {
      return NextResponse.json({ success: true, case: { management: [clean], keyLearning: [clean] } })
    }

    try {
      const caseData = JSON.parse(match[0])
      return NextResponse.json({ success: true, case: caseData })
    } catch {
      return NextResponse.json({ success: true, case: { management: [clean], keyLearning: [clean] } })
    }

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
