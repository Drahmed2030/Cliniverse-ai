import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const department = body.department || 'ED'
    const systemPrompt = body.systemPrompt || 'You are an expert medical educator creating clinical simulation cases.'
    const userPrompt = body.userPrompt || ('Generate a ' + difficulty + ' level case for ' + specialty)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const caseData = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, case: caseData })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generate case error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
