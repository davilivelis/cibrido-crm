import { NextResponse } from 'next/server'
import { runNotificationEngine } from '@/lib/notifications/engine'

// Disparado a cada 15 min (pg_cron/Supabase → HTTP) + 1x/dia pelo Vercel Cron (backup).
// Auth: Authorization: Bearer <CRON_SECRET> (padrão Vercel Cron) ou header x-cron-secret.

export const maxDuration = 60

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  const alt = request.headers.get('x-cron-secret')
  return auth === `Bearer ${secret}` || alt === secret
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runNotificationEngine()
    console.log('[Cron Notificações]', JSON.stringify({ ...result, details: result.details.slice(0, 20) }))
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[Cron Notificações] Erro:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
