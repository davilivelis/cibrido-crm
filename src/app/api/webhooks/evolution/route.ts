import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EvolutionSender, phoneAllowed } from '@/lib/notifications/sender'
import { syncAppointmentToGoogle } from '@/lib/google/calendar'

// Webhook de ENTRADA do WhatsApp (Evolution API) — S3 Conversas Vivas.
// Configurado na instância Evolution com a URL:
//   https://crm.livelis.com.br/api/webhooks/evolution?token=<EVOLUTION_WEBHOOK_TOKEN>
// Cada mensagem recebida/enviada no chip vira uma linha em `conversations`.
// 1ª mensagem de um número desconhecido cria o lead sozinho.
// Resposta SIM/NÃO do paciente confirma/cancela a consulta pendente.

export const maxDuration = 30

type Admin = ReturnType<typeof createAdminClient>

function authorized(request: Request): boolean {
  const secret = process.env.EVOLUTION_WEBHOOK_TOKEN
  if (!secret) return false
  const url = new URL(request.url)
  return url.searchParams.get('token') === secret
}

// remoteJid "5511999998888@s.whatsapp.net" → "5511999998888"
function jidToPhone(jid: string): string {
  return jid.split('@')[0].replace(/\D/g, '')
}

// Variações do mesmo número BR pra casar com o cadastro do lead:
// com/sem 55, com/sem o 9 extra do celular
function phoneVariants(digits: string): string[] {
  const base = digits.startsWith('55') ? digits.slice(2) : digits
  const variants = new Set<string>([base, `55${base}`])
  if (base.length === 10) {
    // sem o 9: adiciona a versão com 9 (ddd + 9 + numero)
    const with9 = `${base.slice(0, 2)}9${base.slice(2)}`
    variants.add(with9)
    variants.add(`55${with9}`)
  }
  if (base.length === 11 && base[2] === '9') {
    const without9 = `${base.slice(0, 2)}${base.slice(3)}`
    variants.add(without9)
    variants.add(`55${without9}`)
  }
  return [...variants]
}

// Extrai o texto da mensagem em qualquer formato comum da Evolution
function extractText(message: Record<string, unknown> | undefined): string {
  if (!message) return ''
  if (typeof message.conversation === 'string') return message.conversation
  const ext = message.extendedTextMessage as { text?: string } | undefined
  if (ext?.text) return ext.text
  const img = message.imageMessage as { caption?: string } | undefined
  if (img) return img.caption ?? '[imagem]'
  if (message.audioMessage) return '[áudio]'
  if (message.videoMessage) return '[vídeo]'
  if (message.documentMessage) return '[documento]'
  if (message.stickerMessage) return '[figurinha]'
  return ''
}

// "Sim, confirmo!" → "sim confirmo" (minúsculo, sem acento/pontuação)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const YES_WORDS = new Set(['sim', 'confirmo', 'confirmado', 'confirmar', 'ok', 'pode confirmar', 'sim confirmo', 'confirmada'])
const NO_WORDS = new Set(['nao', 'nao posso', 'nao posso ir', 'cancela', 'cancelar', 'nao vou', 'nao consigo', 'remarcar', 'nao vou conseguir'])

function detectYesNo(text: string): 'sim' | 'nao' | null {
  const norm = normalizeText(text)
  if (!norm || norm.length > 40) return null
  if (YES_WORDS.has(norm)) return 'sim'
  if (NO_WORDS.has(norm)) return 'nao'
  return null
}

// Processa SIM/NÃO: atualiza a próxima consulta pendente do lead e responde
async function processYesNo(
  admin: Admin,
  clinic: { id: string; name: string; whatsapp_instance: string | null },
  lead: { id: string; name: string; phone: string },
  answer: 'sim' | 'nao'
): Promise<void> {
  const { data: apt } = await admin
    .from('appointments')
    .select('id, scheduled_at, status')
    .eq('lead_id', lead.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!apt) return

  const newStatus = answer === 'sim' ? 'confirmed' : 'cancelled'
  await admin.from('appointments').update({ status: newStatus }).eq('id', apt.id)
  await syncAppointmentToGoogle(apt.id)

  const d = new Date(new Date(apt.scheduled_at).getTime() - 3 * 3600_000)
  const when = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} às ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`

  await admin.from('lead_events').insert({
    clinic_id: clinic.id,
    lead_id: lead.id,
    type: newStatus === 'confirmed' ? 'appointment_confirmed' : 'appointment_cancelled',
    description:
      newStatus === 'confirmed'
        ? `Paciente confirmou a consulta de ${when} pelo WhatsApp`
        : `Paciente cancelou a consulta de ${when} pelo WhatsApp`,
  })

  // Resposta automática (respeita o modo seguro)
  if (phoneAllowed(lead.phone)) {
    const firstName = lead.name.trim().split(/\s+/)[0] || ''
    const reply =
      newStatus === 'confirmed'
        ? `✅ Presença confirmada${firstName ? `, ${firstName}` : ''}! Te esperamos ${when} na ${clinic.name}.`
        : `Tudo bem${firstName ? `, ${firstName}` : ''}! Consulta de ${when} cancelada — a ${clinic.name} vai te chamar pra remarcar. 😉`
    const sender = new EvolutionSender(clinic.whatsapp_instance ?? undefined)
    const res = await sender.send(lead.phone, reply)
    if (res.ok) {
      await admin.from('conversations').insert({
        clinic_id: clinic.id,
        lead_id: lead.id,
        channel: 'whatsapp',
        direction: 'outbound',
        content: reply,
        status: 'sent',
      })
    }
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const event: string = body.event ?? ''
    if (event !== 'messages.upsert') {
      return NextResponse.json({ ok: true, skipped: event || 'sem evento' })
    }

    const instance: string = body.instance ?? ''
    const data = body.data ?? {}
    const key = data.key ?? {}
    const remoteJid: string = key.remoteJid ?? ''
    const fromMe: boolean = Boolean(key.fromMe)
    const externalId: string | null = key.id ?? null

    // Ignora grupos, status e broadcast — o CRM só conversa 1:1
    if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid.startsWith('status@')) {
      return NextResponse.json({ ok: true, skipped: 'não é conversa 1:1' })
    }

    const text = extractText(data.message)
    if (!text) return NextResponse.json({ ok: true, skipped: 'sem texto' })

    const admin = createAdminClient()

    // Instância → clínica (multi-tenant)
    const { data: clinic } = await admin
      .from('clinics')
      .select('id, name, whatsapp_instance')
      .eq('whatsapp_instance', instance)
      .maybeSingle()
    if (!clinic) {
      return NextResponse.json({ ok: true, skipped: `instância "${instance}" sem clínica` })
    }

    // Localiza o lead pelo telefone (variações com/sem 55 e com/sem 9)
    const phone = jidToPhone(remoteJid)
    const variants = phoneVariants(phone)
    const { data: leads } = await admin
      .from('leads')
      .select('id, name, phone')
      .eq('clinic_id', clinic.id)
      .in('phone', variants)
      .limit(1)
    let lead = leads?.[0] ?? null

    // 1ª mensagem de número desconhecido → cria o lead sozinho
    if (!lead && !fromMe) {
      const pushName: string = data.pushName || phone
      const { data: firstStage } = await admin
        .from('pipeline_stages')
        .select('id')
        .eq('clinic_id', clinic.id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle()

      const { data: created, error: leadErr } = await admin
        .from('leads')
        .insert({
          clinic_id: clinic.id,
          name: pushName,
          phone,
          source: 'whatsapp',
          stage_id: firstStage?.id ?? null,
          status: 'active',
        })
        .select('id, name, phone')
        .single()
      if (leadErr) throw new Error(`Erro criando lead: ${leadErr.message}`)
      lead = created

      await admin.from('lead_events').insert({
        clinic_id: clinic.id,
        lead_id: lead.id,
        type: 'lead_created',
        description: 'Lead criado automaticamente pela 1ª mensagem no WhatsApp',
      })
    }

    // Mensagem nossa (fromMe) pra número que não é lead → nada a registrar
    if (!lead) return NextResponse.json({ ok: true, skipped: 'fromMe sem lead' })

    // Grava a mensagem (dedup por external_id — Evolution pode reenviar)
    const { error: convErr } = await admin.from('conversations').insert({
      clinic_id: clinic.id,
      lead_id: lead.id,
      channel: 'whatsapp',
      direction: fromMe ? 'outbound' : 'inbound',
      content: text,
      external_id: externalId,
      status: 'received',
    })
    if (convErr) {
      if (convErr.code === '23505') return NextResponse.json({ ok: true, skipped: 'duplicada' })
      throw new Error(`Erro gravando conversa: ${convErr.message}`)
    }

    // SIM/NÃO do paciente → confirma/cancela a consulta pendente
    if (!fromMe) {
      const answer = detectYesNo(text)
      if (answer) await processYesNo(admin, clinic, lead, answer)
    }

    return NextResponse.json({ ok: true, leadId: lead.id })
  } catch (err) {
    console.error('[Webhook Evolution] Erro:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
