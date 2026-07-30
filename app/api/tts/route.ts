import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text, lang } = await req.json()

    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

    const voice = lang === 'ar' ? 'onyx' : 'alloy'

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.substring(0, 4000),
        voice,
        speed: 0.95,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: 500 })
    }

    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const url = 'data:audio/mpeg;base64,' + base64

    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
