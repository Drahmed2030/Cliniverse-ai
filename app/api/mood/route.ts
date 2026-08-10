import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { deviceId, mood, note } = await req.json()
    if (!deviceId || !mood || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ device_id: deviceId, mood, note: note || null })
      .select()
      .single()

    if (error) {
      console.error('mood insert error', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }
    return NextResponse.json({ success: true, entry: data })
  } catch (e) {
    console.error('mood route error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('deviceId')
    if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(14)

    if (error) {
      console.error('mood fetch error', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
    return NextResponse.json({ entries: data })
  } catch (e) {
    console.error('mood GET error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
