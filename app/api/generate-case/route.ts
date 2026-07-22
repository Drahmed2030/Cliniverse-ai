import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const sysPrompt = body.systemPrompt || 'You are an expert medical educator.'
    const userPrompt = body.userPrompt || 'Generate a clinical case.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: sysPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON')
    return NextResponse.json({ success: true, case: JSON.parse(match[0]) })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
