import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

function getPlanFromAsaas(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes('master'))   return 'master'
  if (lower.includes('standard')) return 'standard'
  return 'lite'
}

function getPlanLabel(plan: string): string {
  if (plan === 'master')   return 'Cibri-Master'
  if (plan === 'standard') return 'Cibri-Standard'
  return 'Cibri-Lite'
}

function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Normaliza telefone para formato 5511XXXXXXXXX
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const baseUrl  = process.env.EVOLUTION_API_URL
  const apiKey   = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE ?? 'Cibrido-Bot'

  if (!baseUrl || !apiKey) {
    console.warn('[Asaas Webhook] Evolution API não configurada — WhatsApp não enviado')
    return
  }

  const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body: JSON.stringify({ number: normalizePhone(phone), text: message }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Asaas Webhook] Erro Evolution API:', err)
  } else {
    console.log('[Asaas Webhook] WhatsApp enviado para', phone)
  }
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
    const phone       = payment?.customer?.mobilePhone ?? payment?.customer?.phone ?? ''
    const name        = payment?.customer?.name ?? ''
    const description = payment?.description ?? ''
    const paymentId   = payment?.id

    if (!email) {
      return NextResponse.json({ error: 'Email nao encontrado no payload' }, { status: 400 })
    }

    const plan  = getPlanFromAsaas(description)
    const admin = createAdminClient()

    // Verifica se já existe convite pendente para esse email
    const { data: existing } = await admin
      .from('invites')
      .select('id, token')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle()

    const crmUrl = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.cibrido.com.br'

    if (existing) {
      const inviteLink = `${crmUrl}/convite/${existing.token}`
      // Reenviar WhatsApp se tiver telefone
      if (phone) {
        await sendWhatsApp(phone, buildMessage(name, getPlanLabel(plan), inviteLink))
      }
      return NextResponse.json({ ok: true, message: 'Convite ja existe — WhatsApp reenviado', inviteLink })
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

    const inviteLink = `${crmUrl}/convite/${token}`

    // Envia WhatsApp com o link de acesso
    if (phone) {
      await sendWhatsApp(phone, buildMessage(name, getPlanLabel(plan), inviteLink))
    } else {
      console.warn('[Asaas Webhook] Sem telefone para', email, '— WhatsApp nao enviado')
    }

    console.log(`[Asaas Webhook] Convite criado para ${email} — plano ${plan} — ${inviteLink}`)

    return NextResponse.json({ ok: true, plan, inviteLink })
  } catch (err) {
    console.error('[Asaas Webhook] Erro:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildMessage(name: string, planLabel: string, inviteLink: string): string {
  const firstName = name.split(' ')[0] || 'Doutor(a)'
  return [
    `Ola, ${firstName}! Aqui e a equipe Cibrido.`,
    ``,
    `Seu pagamento do *${planLabel}* foi confirmado!`,
    ``,
    `Acesse seu CRM agora pelo link abaixo:`,
    inviteLink,
    ``,
    `O link e valido por 7 dias. Qualquer duvida, chama a gente aqui no WhatsApp.`,
    ``,
    `-- Equipe Cibrido`,
  ].join('\n')
}
