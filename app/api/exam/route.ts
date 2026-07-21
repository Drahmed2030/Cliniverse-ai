import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are an expert medical examiner specializing in clinical board examinations (USMLE, MRCPI, Saudi Board, Arab Board, PLAB).

Your task is to generate a high-yield clinical vignette with 4 options.

CRITICAL: Return ONLY valid JSON — no text before or after. No markdown. No backticks.

{
  "id": "unique_id_here",
  "specialty": "specialty name",
  "difficulty": "Easy|Medium|Hard",
  "examType": "exam type",
  "vignette": "Clinical scenario: age, sex, presenting complaint, history, examination findings, investigations",
  "question": "The clinical question (What is the most appropriate next step? / What is the diagnosis? etc.)",
  "options": [
    {"id": "A", "text": "Option A"},
    {"id": "B", "text": "Option B"},
    {"id": "C", "text": "Option C"},
    {"id": "D", "text": "Option D"}
  ],
  "correctOption": "A",
  "explanation": {
    "summary": "Why this answer is correct with clinical reasoning",
    "whyOthersAreWrong": "Brief explanation of why each wrong option is incorrect",
    "keyTakeaway": "The single most important high-yield pearl from this case",
    "guideline": "Relevant guideline (ESC 2023, AHA 2022, NICE, BNF etc.)"
  }
}`

export async function POST(req: Request) {
  try {
    const { specialty, examType, difficulty, userId } = await req.json()

    // ── Check daily usage limit ──
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('exam_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)

      const isPro = false // check from profiles table
      const limit = isPro ? 100 : 10

      if ((count || 0) >= limit) {
        return NextResponse.json(
          { error: `Daily limit reached (${limit} questions). Resets tomorrow!`, limitReached: true },
          { status: 429 }
        )
      }
    }

    // ── Try cache first (Supabase) ──
    const { data: cached } = await supabase
      .from('generated_questions')
      .select('*')
      .eq('specialty', specialty)
      .eq('difficulty', difficulty || 'Medium')
      .eq('exam_type', examType)
      .eq('is_approved', true)
      .limit(50)

    if (cached && cached.length > 5) {
      // Return random cached question 60% of the time
      if (Math.random() < 0.6) {
        const random = cached[Math.floor(Math.random() * cached.length)]
        return NextResponse.json({ ...random.content, fromCache: true })
      }
    }

    // ── Generate fresh with Claude ──
    const model = difficulty === 'Hard'
      ? 'claude-sonnet-4-6'   // Sonnet for complex cases
      : 'claude-haiku-4-5-20251001' // Haiku for speed + cost

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a ${difficulty || 'Medium'} difficulty question.
Specialty: ${specialty}
Exam type: ${examType}
Make it clinically realistic, evidence-based, and board-style.
Include a proper clinical vignette with age/sex/symptoms/investigations.`
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('No text content')

    // Clean and parse JSON
    const cleaned = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const questionData = JSON.parse(cleaned)
    questionData.id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // ── Save to Supabase cache ──
    supabase.from('generated_questions').insert({
      specialty,
      difficulty: difficulty || 'Medium',
      exam_type: examType,
      content: questionData,
      is_approved: true,
      model_used: model,
    }).then(() => {})

    // ── Log usage ──
    if (userId) {
      supabase.from('exam_usage').insert({ user_id: userId }).then(() => {})
    }

    return NextResponse.json({ ...questionData, fromCache: false })

  } catch (error: any) {
    console.error('Exam API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate question. Please try again.' },
      { status: 500 }
    )
  }
}
