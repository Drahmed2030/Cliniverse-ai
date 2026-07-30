import { NextResponse } from 'next/server'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT   = process.env.TELEGRAM_CHAT_ID   || '-1004359189976'

export async function sendTelegram(msg: string) {
  if (!TOKEN || !CHAT) { console.log('Missing TOKEN or CHAT'); return }
  try {
    const r = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text: msg, parse_mode: 'HTML' })
    })
    const d = await r.json()
    console.log('TG:', JSON.stringify(d))
  } catch(e) { console.error('TG error:', e) }
}

export const notify = {
  aiSuccess: (t:string, s:string, ms:number) => sendTelegram('✅ <b>AI Done</b>\nType: '+t+'\nSpecialty: '+s+'\nTime: '+ms+'ms'),
  aiError:   (t:string, e:string)             => sendTelegram('❌ <b>AI Error</b>\nType: '+t+'\nError: '+e),
  aiSlow:    (t:string, ms:number)            => sendTelegram('🐌 <b>AI Slow</b>\nType: '+t+'\nTime: '+ms+'ms'),
  dbError:   (tb:string, op:string, e:string) => sendTelegram('🗄️ <b>DB Error</b>\nTable: '+tb+'\nOp: '+op+'\nError: '+e),
  apiError:  (ep:string, st:number, e:string) => sendTelegram('🚨 <b>API Error</b>\nEndpoint: '+ep+'\nStatus: '+st+'\nError: '+e),
  newUser:   (plan:string)                    => sendTelegram('🎉 <b>New User!</b>\nPlan: '+plan.toUpperCase()),
  proUpgrade: ()                              => sendTelegram('💰 <b>PRO Upgrade!</b>\n\n🎉 New paying customer!'),
  cronSuccess:(job:string, n:number)          => sendTelegram('⏰ <b>Cron OK</b>\nJob: '+job+'\nItems: '+n),
  cronError:  (job:string, e:string)          => sendTelegram('⏰❌ <b>Cron Failed</b>\nJob: '+job+'\nError: '+e),
  dailyReport:(s:{users:number,aiCalls:number,errors:number,cost:string}) =>
    sendTelegram('📊 <b>Daily Report</b>\n\n👥 Users: '+s.users+'\n🤖 AI Calls: '+s.aiCalls+'\n❌ Errors: '+s.errors+'\n💰 Cost: '+s.cost+'\n\n🌐 cliniverseai.com'),
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'ping'
  if (type === 'ping')   { await sendTelegram('🟢 <b>Cliniverse AI</b>\n\nAll systems operational ✅\n\n🌐 cliniverseai.com'); return NextResponse.json({ ok:true }) }
  if (type === 'report') { await notify.dailyReport({ users:0, aiCalls:0, errors:0, cost:'calculating...' }); return NextResponse.json({ ok:true }) }
  return NextResponse.json({ ok:true })
}

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()
    switch(type) {
      case 'ai_success': await notify.aiSuccess(data.type, data.specialty, data.ms); break
      case 'ai_error':   await notify.aiError(data.type, data.error); break
      case 'ai_slow':    await notify.aiSlow(data.type, data.ms); break
      case 'db_error':   await notify.dbError(data.table, data.op, data.error); break
      case 'api_error':  await notify.apiError(data.endpoint, data.status, data.error); break
      case 'new_user':   await notify.newUser(data.plan); break
      case 'pro':        await notify.proUpgrade(); break
      default:           await sendTelegram('📢 '+JSON.stringify(data))
    }
    return NextResponse.json({ ok:true })
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 })
  }
}
