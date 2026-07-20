import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fireOutbound } from '@/lib/integrations/outbound'

// Webhook de ENTRADA por clínica (N3 + integração Tintim/Trinks/sistema clínico).
// A plataforma externa manda eventos de conversão pra:
//   https://crm.livelis.com.br/api/webhooks/in/{webhook_in_token}?source=trinks
// O CRM casa com o lead pelo telefone, carimba a campanha de origem e grava a
// conversão (valor). É a fonte automática do N3. Cada clínica tem seu token.

export const maxDuration = 20

type Admin = ReturnType<typeof createAdminClient>

// Variações do mesmo número BR (com/sem 55, com/sem o 9) — mesmo critério do webhook Evolution
function phoneVariants(raw: string): string[] {
  const digits = raw.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits.slice(2) : digits
  const v = new Set<string>([base, `55${base}`])
  if (base.length === 10) {
    const with9 = `${base.slice(0, 2)}9${base.slice(2)}`
    v.add(with9); v.add(`55${with9}`)
  }
  if (base.length === 11 && base[2] === '9') {
    const without9 = `${base.slice(0, 2)}${base.slice(3)}`
    v.add(without9); v.add(`55${without9}`)
  }
  return [...v].filter(Boolean)
}

// Extrai um campo tentando vários nomes comuns (pt/en) + caminhos aninhados
function pick(body: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (k.includes('.')) {
      const [a, b] = k.split('.')
      const obj = body[a] as Record<string, unknown> | undefined
      if (obj && obj[b] != null) return obj[b]
    } else if (body[k] != null) {
      return body[k]
    }
  }
  return undefined
}

function parseValue(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    // aceita "1234.56", "1234,56"
    const n = parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export async function POST(request: Request, ctx: RouteContext<'/api/webhooks/in/[token]'>) {
  const { token } = await ctx.params
  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin: Admin = createAdminClient()

  // Token → clínica (multi-tenant; token inválido nunca vaza nada)
  const { data: clinic } = await admin
    .from('clinics')
    .select('id, webhook_out_url')
    .eq('webhook_in_token', token)
    .maybeSingle()
  if (!clinic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const url = new URL(request.url)
  const source = (url.searchParams.get('source') || (body.source as string) || 'webhook').slice(0, 40)

  const phoneRaw = pick(body, ['phone', 'telefone', 'whatsapp', 'celular', 'customer.phone', 'customer.telefone', 'cliente.telefone', 'cliente.celular'])
  const externalId = pick(body, ['id', 'event_id', 'external_id', 'transaction_id', 'comanda_id', 'venda_id'])
  const value = parseValue(pick(body, ['value', 'valor', 'amount', 'total', 'price', 'valor_total']))
  const description = pick(body, ['description', 'descricao', 'procedimento', 'servico', 'produto'])
  const occurredRaw = pick(body, ['occurred_at', 'date', 'data', 'created_at', 'data_venda'])

  // Casa com o lead pelo telefone normalizado (carimba a campanha de origem = N1→N3)
  let leadId: string | null = null
  let campaignId: string | null = null
  if (typeof phoneRaw === 'string' && phoneRaw.replace(/\D/g, '').length >= 8) {
    const { data: leads } = await admin
      .from('leads')
      .select('id, campaign_id')
      .eq('clinic_id', clinic.id)
      .in('phone_digits', phoneVariants(phoneRaw))
      .limit(1)
    if (leads?.[0]) {
      leadId = leads[0].id
      campaignId = (leads[0].campaign_id as string | null) ?? null
    }
  }

  let occurredAt: string
  try {
    occurredAt = occurredRaw ? new Date(occurredRaw as string).toISOString() : new Date().toISOString()
  } catch {
    occurredAt = new Date().toISOString()
  }

  // Grava a conversão (dedup por external_id — o mesmo evento nunca conta 2x)
  const { error: insErr } = await admin.from('conversions').insert({
    clinic_id: clinic.id,
    lead_id: leadId,
    campaign_id: campaignId,
    source,
    external_id: externalId != null ? String(externalId).slice(0, 200) : null,
    value,
    description: description != null ? String(description).slice(0, 300) : null,
    occurred_at: occurredAt,
    raw: body,
  })
  if (insErr) {
    if (insErr.code === '23505') return NextResponse.json({ ok: true, skipped: 'duplicada' })
    console.error('[Webhook IN] Erro gravando conversão:', insErr.message)
    return NextResponse.json({ error: 'Erro ao gravar' }, { status: 500 })
  }

  // Repassa o evento adiante se a clínica configurou saída (opcional)
  if (clinic.webhook_out_url) {
    fireOutbound(clinic.id, 'conversion.created', { leadId, campaignId, value, source }).catch(() => {})
  }

  return NextResponse.json({ ok: true, matched: Boolean(leadId), value })
}
