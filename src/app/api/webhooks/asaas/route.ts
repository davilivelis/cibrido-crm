import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Planos Asaas → planos internos
const PLAN_MAP: Record<string, string> = {
  [process.env.ASAAS_PRODUCT_LITE     ?? 'lite']:     'lite',
  [process.env.ASAAS_PRODUCT_STANDARD ?? 'standard']: 'standard',
  [process.env.ASAAS_PRODUCT_MASTER   ?? 'master']:   'master',
}

function getPlanFromAsaas(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes('master'))   return 'master'
  if (lower.includes('standard')) return 'standard'
  return 'lite'
}

function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(request: Request) {
  try {
    // Valida o token de segurança do Asaas
    const accessToken = request.headers.get('asaas-access-token')
    if (accessToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, payment } = body

    // Só processa pagamentos confirmados
    if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const email       = payment?.customer?.email?.toLowerCase()
    const description = payment?.description ?? ''
    const paymentId   = payment?.id

    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 })
    }

    const plan = getPlanFromAsaas(description)
    const admin = createAdminClient()

    // Verifica se já existe convite pendente para esse email
    const { data: existing } = await admin
      .from('invites')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, message: 'Convite já existe para este email' })
    }

    // Cria convite automático (válido por 7 dias)
    const token     = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error: inviteError } = await admin
      .from('invites')
      .insert({
        token,
        email,
        plan,
        origin:           'asaas_webhook',
        asaas_payment_id: paymentId,
        expires_at:       expiresAt.toISOString(),
      })

    if (inviteError) throw new Error(inviteError.message)

    const crmUrl  = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.cibrido.com.br'
    const inviteLink = `${crmUrl}/convite/${token}`

    // TODO: quando tiver serviço de email configurado, enviar o link automaticamente
    // await sendInviteEmail({ to: email, plan, link: inviteLink })

    console.log(`[Asaas Webhook] Convite criado para ${email} — plano ${plan} — ${inviteLink}`)

    return NextResponse.json({ ok: true, plan, inviteLink })
  } catch (err) {
    console.error('[Asaas Webhook] Erro:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
