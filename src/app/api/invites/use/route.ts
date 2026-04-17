import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })

    const admin = createAdminClient()

    const { error } = await admin
      .from('invites')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('token', token)
      .eq('status', 'pending')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
