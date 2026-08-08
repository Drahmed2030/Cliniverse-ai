import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function sb(path: string, options: any = {}) {
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

export async function POST(req: Request) {
  try {
    const { action, userId, specialty, data } = await req.json()

    switch(action) {

      // تسجيل نشاط المستخدم
      case 'track': {
        await sb('user_activity', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            action: data.action,
            component: data.component,
            specialty: specialty,
            metadata: data.metadata,
            created_at: new Date().toISOString()
          })
        })
        return NextResponse.json({ success: true })
      }

      // جلب محتوى مخصص
      case 'personalize': {
        // جلب آخر نشاط المستخدم
        const activity = await sb(
          `user_activity?user_id=eq.${userId}&order=created_at.desc&limit=10`
        )

        // تحديد المحتوى المناسب بناءً على النشاط
        const topComponents = activity.reduce((acc: any, a: any) => {
          acc[a.component] = (acc[a.component] || 0) + 1
          return acc
        }, {})

        // توليد توصيات بـ Claude
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 300,
            messages: [{
              role: 'user',
              content: `Doctor profile: specialty=${specialty}. Most used components: ${JSON.stringify(topComponents)}. 
              Suggest ONE specific clinical learning recommendation in JSON:
              {"title":"...","description":"...","component":"...","priority":"high/medium/low"}`
            }]
          })
        })
        const aiData = await aiRes.json()
        const text = aiData.content?.[0]?.text || '{}'
        const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
        
        let recommendation = {}
        try { recommendation = JSON.parse(clean) } catch {}

        return NextResponse.json({ 
          success: true, 
          topComponents,
          recommendation 
        })
      }

      // بث محتوى جديد لكل المكونات
      case 'broadcast': {
        // حفظ في Supabase للـ realtime
        await sb('intelligence_feed', {
          method: 'POST',
          body: JSON.stringify({
            content_type: data.type,
            specialty: specialty,
            content: data.content,
            source: data.source,
            expires_at: new Date(Date.now() + 86400000).toISOString(), // 24h
            created_at: new Date().toISOString()
          })
        })
        return NextResponse.json({ success: true, broadcasted: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch(err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
