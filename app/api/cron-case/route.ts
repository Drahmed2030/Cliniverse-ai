import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Generate case with Claude
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate a clinical case for medical education. Return ONLY valid JSON:
{
  "title": "case title",
  "specialty": "Cardiology|Emergency|Internal Medicine|Respiratory|Neurology|Pediatrics",
  "difficulty": "Beginner|Intermediate|Advanced",
  "patient": "age, sex, brief demographics",
  "presentation": "chief complaint and history in 2-3 sentences",
  "diagnosis": "final diagnosis",
  "teaching_points": "2-3 key learning points"
}`
        }]
      })
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
    const caseData = JSON.parse(clean)

    // Save to Supabase
    const { error } = await supabase
      .from('daily_cases')
      .insert([{ ...caseData, source: 'ai' }])

    if (error) throw error

    return NextResponse.json({ success: true, case: caseData })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
