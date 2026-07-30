// ── CLINIVERSE AI — TELEGRAM MONITOR ──
// File: app/api/monitor/route.ts
// يرسل إشعارات فورية لـ Telegram عند أي حدث مهم

import { NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || ''

// ── إرسال رسالة Telegram ──
export async function sendTelegram(message: string, emoji = '🔔') {
  if (!BOT_TOKEN || !CHAT_ID) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID.toString(),
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      })
    })
  } catch (e) {
    console.error('Telegram error:', e)
  }
}

// ── أنواع الإشعارات ──
export const notify = {

  // AI Generation
  aiSuccess: (type: string, specialty: string, ms: number) =>
    sendTelegram(`✅ <b>AI Generated</b>\nType: ${type}\nSpecialty: ${specialty}\nTime: ${ms}ms`),

  aiError: (type: string, error: string) =>
    sendTelegram(`❌ <b>AI Error</b>\nType: ${type}\nError: ${error}\n\n⚠️ Check Anthropic API`),

  aiSlow: (type: string, ms: number) =>
    sendTelegram(`🐌 <b>AI Slow Response</b>\nType: ${type}\nTime: ${ms}ms (>5s)\n\n💡 Consider caching`),

  // Supabase
  dbError: (table: string, op: string, error: string) =>
    sendTelegram(`🗄️ <b>Supabase Error</b>\nTable: ${table}\nOperation: ${op}\nError: ${error}`),

  dbInsert: (table: string, count = 1) =>
    sendTelegram(`📥 <b>DB Insert</b>\nTable: ${table}\nRows: ${count}`),

  // Vercel / API
  apiError: (endpoint: string, status: number, error: string) =>
    sendTelegram(`🚨 <b>API Error</b>\nEndpoint: ${endpoint}\nStatus: ${status}\nError: ${error}`),

  // Rate Limiting
  rateLimitHit: (userId: string, endpoint: string) =>
    sendTelegram(`⛔ <b>Rate Limit Hit</b>\nUser: ${userId}\nEndpoint: ${endpoint}`),

  // New User
  newUser: (plan: 'free'|'pro') =>
    sendTelegram(`🎉 <b>New User!</b>\nPlan: ${plan.toUpperCase()}\n\n📊 Check dashboard`),

  // Pro Upgrade
  proUpgrade: () =>
    sendTelegram(`💰 <b>PRO Upgrade!</b>\n\n🎉 New paying customer on Cliniverse AI!`),

  // Cron Jobs
  cronSuccess: (job: string, count: number) =>
    sendTelegram(`⏰ <b>Cron Success</b>\nJob: ${job}\nItems: ${count}`),

  cronError: (job: string, error: string) =>
    sendTelegram(`⏰❌ <b>Cron Failed</b>\nJob: ${job}\nError: ${error}`),

  // Daily Report
  dailyReport: (stats: { users: number, aiCalls: number, errors: number, cost: string }) =>
    sendTelegram(`📊 <b>Daily Report — Cliniverse AI</b>\n\n👥 Active Users: ${stats.users}\n🤖 AI Calls: ${stats.aiCalls}\n❌ Errors: ${stats.errors}\n💰 Est. Cost: ${stats.cost}\n\n🌐 cliniverseai.com`),
}

// ── RATE LIMITER ──
const rateLimitMap = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(userId: string, limit = 10): boolean {
  const now  = Date.now()
  const hour = 3600 * 1000
  const rec  = rateLimitMap.get(userId)

  if (!rec || now > rec.reset) {
    rateLimitMap.set(userId, { count: 1, reset: now + hour })
    return true // allowed
  }
  if (rec.count >= limit) {
    notify.rateLimitHit(userId, 'ai-generation')
    return false // blocked
  }
  rec.count++
  return true
}

// ── API ROUTE — Manual trigger & health check ──
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'ping'

  if (type === 'ping') {
    await sendTelegram('🟢 <b>Cliniverse AI — Health Check</b>\n\nAll systems operational ✅\n\n🌐 cliniverseai.com')
    return NextResponse.json({ ok: true, message: 'Ping sent to Telegram' })
  }

  if (type === 'report') {
    await notify.dailyReport({ users: 0, aiCalls: 0, errors: 0, cost: 'calculating...' })
    return NextResponse.json({ ok: true, message: 'Report sent' })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    switch (type) {
      case 'ai_success': await notify.aiSuccess(data.type, data.specialty, data.ms); break
      case 'ai_error':   await notify.aiError(data.type, data.error); break
      case 'ai_slow':    await notify.aiSlow(data.type, data.ms); break
      case 'db_error':   await notify.dbError(data.table, data.op, data.error); break
      case 'api_error':  await notify.apiError(data.endpoint, data.status, data.error); break
      case 'new_user':   await notify.newUser(data.plan); break
      case 'pro':        await notify.proUpgrade(); break
      default:           await sendTelegram(`📢 ${JSON.stringify(data)}`)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
