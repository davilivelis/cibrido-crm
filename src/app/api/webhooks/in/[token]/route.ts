import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { fireOutbound } from '@/lib/integrations/outbound'

// Webhook de ENTRADA por clínica (N3 + integração com plataformas externas / sistema clínico).
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

// JSON canônico (chaves ordenadas em todos os níveis) → hash estável do payload.
// Retry manda os mesmos bytes → mesmo hash; venda diferente muda algum campo → hash diferente.
function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o).sort().map(k => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(',')}}`
  }
  return JSON.stringify(v) ?? 'null'
}

function parseValue(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    // Aceita BR e EN: "1.234,56" · "1234,56" · "1,234.56" · "1234.56".
    // Regra: o ÚLTIMO separador presente é o decimal; o outro é milhar.
    const s = v.replace(/[^\d.,-]/g, '')
    const lastComma = s.lastIndexOf(',')
    const lastDot = s.lastIndexOf('.')
    let norm = s
    if (lastComma > lastDot) norm = s.replace(/\./g, '').replace(',', '.')   // BR: 1.234,56
    else if (lastDot > lastComma) norm = s.replace(/,/g, '')                  // EN: 1,234.56
    const n = parseFloat(norm)
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
  const externalIdRaw = pick(body, ['id', 'event_id', 'external_id', 'transaction_id', 'comanda_id', 'venda_id'])
  // Só string não-vazia/number vale como id — objeto viraria "[object Object]" e
  // string vazia viraria chave "" compartilhada, deduplicando tudo indevidamente
  const externalId =
    (typeof externalIdRaw === 'string' && externalIdRaw.trim() !== '') || typeof externalIdRaw === 'number'
      ? externalIdRaw
      : undefined
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
  let occurredParsed = false
  try {
    if (occurredRaw != null) {
      occurredAt = new Date(occurredRaw as string).toISOString() // lança se inválida
      occurredParsed = true
    } else {
      occurredAt = new Date().toISOString()
    }
  } catch {
    occurredAt = new Date().toISOString()
  }

  // Grava a conversão (dedup por external_id — o mesmo evento nunca conta 2x).
  // Origem sem id → chave SINTÉTICA: dia + valor + HASH do payload inteiro.
  // O hash garante que 2 vendas legítimas que diferem em QUALQUER campo (descrição,
  // hora, item) geram chaves diferentes e contam as duas; e o dia (em vez de minuto)
  // garante que retry sem campo de data não duplica ao cruzar a fronteira do minuto.
  const synthetic = externalId == null
  const payloadHash = createHash('sha256').update(stableStringify(body)).digest('hex').slice(0, 16)
  const dedupId = !synthetic
    ? String(externalId).slice(0, 200)
    : `syn2:${source}:${leadId ?? (typeof phoneRaw === 'string' ? phoneRaw.replace(/\D/g, '').slice(0, 30) : 'x')}:${occurredAt.slice(0, 10)}:${value}:${payloadHash}`.slice(0, 200)
  // Payload trouxe hora DE VERDADE? Sem hora (só data, data inválida, ou "T00:00:00"
  // de meia-noite que APIs usam pra data pura), duas vendas idênticas no mesmo dia
  // são indistinguíveis de um retry — tratadas no conflito abaixo.
  const hasTime = occurredParsed && occurredAt.slice(11, 19) !== '00:00:00'

  const row = {
    clinic_id: clinic.id,
    lead_id: leadId,
    campaign_id: campaignId,
    source,
    value,
    description: description != null ? String(description).slice(0, 300) : null,
    occurred_at: occurredAt,
    raw: body,
  }
  let insErr = (await admin.from('conversions').insert({ ...row, external_id: dedupId })).error
  if (insErr?.code === '23505' && synthetic && !hasTime) {
    // Chave sintética SEM hora colidiu: pode ser retry (mesmos bytes, minutos depois)
    // OU uma 2ª venda legítima idêntica no mesmo dia. Heurística: registro original
    // recente (≤10 min) = retry → descarta; antigo = 2ª venda → grava com sufixo,
    // pra não perder faturamento em silêncio (achado do gate 22/07).
    // Idade do registro MAIS RECENTE do grupo (base + sufixadas) — se olhasse só a
    // base, o retry de uma 2ª venda sufixada gravada há pouco contaria de novo.
    const likeBase = dedupId.slice(0, 190).replace(/[\\%_]/g, (m) => `\\${m}`)
    const { data: matches, count } = await admin
      .from('conversions')
      .select('created_at', { count: 'exact' })
      .eq('clinic_id', clinic.id)
      .like('external_id', `${likeBase}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    const newestAgeMs = matches?.[0] ? Date.now() - new Date(matches[0].created_at as string).getTime() : 0
    if (matches?.[0] && newestAgeMs > 10 * 60 * 1000) {
      // Sufixo com nova tentativa: dois POSTs simultâneos da 2ª venda podem calcular
      // o mesmo N — o perdedor do 23505 tenta o próximo em vez de descartar a venda.
      const base = count ?? 1
      for (let n = base + 1; n <= base + 3; n++) {
        insErr = (await admin.from('conversions').insert({ ...row, external_id: `${dedupId.slice(0, 190)}:${n}` })).error
        if (insErr?.code !== '23505') break
      }
    }
  }
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
