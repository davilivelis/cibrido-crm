// Motor de notificações do CRM Livelis (S2).
// Roda via /api/cron/notifications (pg_cron/Vercel Cron a cada 15 min).
// Idempotente: cada envio grava dedup_key único em notification_log —
// rodar o motor 2x NUNCA duplica mensagem.

import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_TEMPLATES, renderTemplate, firstName, NotificationType } from './templates'
import { getSender, phoneAllowed } from './sender'

// São Paulo é UTC-3 fixo (sem horário de verão desde 2019)
const SP_OFFSET_MS = -3 * 3600_000

function spWall(now: Date): Date {
  // Date cujos métodos getUTC* devolvem o relógio de São Paulo
  return new Date(now.getTime() + SP_OFFSET_MS)
}
function spDateStr(d: Date): string {
  return spWall(d).toISOString().slice(0, 10)
}
function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400_000)
}
// Intervalo UTC [início, fim) do dia civil de São Paulo `dateStr`
function spDayUtcRange(dateStr: string): { start: string; end: string } {
  const start = new Date(`${dateStr}T00:00:00-03:00`)
  return { start: start.toISOString(), end: new Date(start.getTime() + 86400_000).toISOString() }
}
function fmtHora(iso: string): string {
  const d = spWall(new Date(iso))
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}
function fmtData(iso: string): string {
  const d = spWall(new Date(iso))
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
function token(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

interface Due {
  targetId: string | null
  phone: string
  message: string
  dedupKey: string
}

interface RuleRow {
  id: string
  clinic_id: string
  type: NotificationType
  template: string | null
  channel: string
  config: Record<string, unknown>
  clinics: { id: string; name: string; phone: string | null; wa_cloud_phone_id: string | null; wa_cloud_token: string | null } | null
}

type Admin = ReturnType<typeof createAdminClient>

const APPT_ACTIVE = ['scheduled', 'confirmed']

async function confirmLink(admin: Admin, apt: { id: string; confirm_token: string | null }): Promise<string> {
  let t = apt.confirm_token
  if (!t) {
    t = token()
    await admin.from('appointments').update({ confirm_token: t }).eq('id', apt.id)
  }
  const base = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.livelis.com.br'
  return `${base}/confirmar/${t}`
}

async function appointmentsInRange(admin: Admin, clinicId: string, startIso: string, endIso: string, statuses = APPT_ACTIVE) {
  const { data } = await admin
    .from('appointments')
    .select('id, scheduled_at, confirm_token, status, lead:leads(id, name, phone)')
    .eq('clinic_id', clinicId)
    .in('status', statuses)
    .gte('scheduled_at', startIso)
    .lt('scheduled_at', endIso)
  return (data ?? []) as unknown as Array<{
    id: string; scheduled_at: string; confirm_token: string | null; status: string
    lead: { id: string; name: string; phone: string | null } | null
  }>
}

async function dueForRule(admin: Admin, rule: RuleRow, now: Date): Promise<Due[]> {
  const clinicName = rule.clinics?.name ?? 'sua clínica'
  const template = rule.template?.trim() || DEFAULT_TEMPLATES[rule.type]
  const spHour = spWall(now).getUTCHours()
  // Personalização por negócio: horário de envio das notificações do dia
  // (default 8h) e antecedência do "1h antes" (default 60min) — vêm do config.
  const sendHour = typeof rule.config.send_hour === 'number' ? rule.config.send_hour : 8
  const atSendHour = spHour === sendHour
  const minutesBefore = typeof rule.config.minutes_before === 'number' ? rule.config.minutes_before : 60
  const today = spDateStr(now)
  const out: Due[] = []

  const aptVars = async (apt: { id: string; scheduled_at: string; confirm_token: string | null; lead: { name: string } | null }, withLink: boolean) => ({
    nome: apt.lead?.name ?? '',
    primeiro_nome: firstName(apt.lead?.name),
    data: fmtData(apt.scheduled_at),
    hora: fmtHora(apt.scheduled_at),
    clinica: clinicName,
    link: withLink ? await confirmLink(admin, apt) : '',
    motivo: '',
  })

  switch (rule.type) {
    case 'confirmacao': {
      // Consultas criadas nas últimas 2h ainda não confirmadas (o dedup segura repetição)
      const since = new Date(now.getTime() - 2 * 3600_000).toISOString()
      const { data } = await admin
        .from('appointments')
        .select('id, scheduled_at, confirm_token, created_at, lead:leads(id, name, phone)')
        .eq('clinic_id', rule.clinic_id)
        .eq('status', 'scheduled')
        .gte('created_at', since)
      for (const apt of (data ?? []) as unknown as Array<{ id: string; scheduled_at: string; confirm_token: string | null; lead: { id: string; name: string; phone: string | null } | null }>) {
        if (!apt.lead?.phone) continue
        out.push({
          targetId: apt.id,
          phone: apt.lead.phone,
          message: renderTemplate(template, await aptVars(apt, true)),
          dedupKey: `confirmacao:apt:${apt.id}`,
        })
      }
      break
    }

    case 'vespera': {
      if (!atSendHour) break
      const r = spDayUtcRange(spDateStr(addDays(now, 1)))
      for (const apt of await appointmentsInRange(admin, rule.clinic_id, r.start, r.end)) {
        if (!apt.lead?.phone) continue
        out.push({
          targetId: apt.id,
          phone: apt.lead.phone,
          message: renderTemplate(template, await aptVars(apt, true)),
          dedupKey: `vespera:apt:${apt.id}`,
        })
      }
      break
    }

    case 'no_dia': {
      if (!atSendHour) break
      const r = spDayUtcRange(today)
      for (const apt of await appointmentsInRange(admin, rule.clinic_id, r.start, r.end)) {
        if (!apt.lead?.phone) continue
        out.push({
          targetId: apt.id,
          phone: apt.lead.phone,
          message: renderTemplate(template, await aptVars(apt, false)),
          dedupKey: `no_dia:apt:${apt.id}`,
        })
      }
      break
    }

    case 'hora_antes': {
      // Janela [minutesBefore, minutesBefore+20] à frente (cron 15min + dedup → dispara 1x)
      const start = new Date(now.getTime() + minutesBefore * 60_000).toISOString()
      const end = new Date(now.getTime() + (minutesBefore + 20) * 60_000).toISOString()
      for (const apt of await appointmentsInRange(admin, rule.clinic_id, start, end)) {
        if (!apt.lead?.phone) continue
        out.push({
          targetId: apt.id,
          phone: apt.lead.phone,
          message: renderTemplate(template, await aptVars(apt, false)),
          dedupKey: `hora_antes:apt:${apt.id}`,
        })
      }
      break
    }

    case 'aniversario': {
      if (!atSendHour) break
      const { data } = await admin
        .from('leads')
        .select('id, name, phone, birth_date')
        .eq('clinic_id', rule.clinic_id)
        .not('birth_date', 'is', null)
      const mmdd = today.slice(5)
      for (const lead of data ?? []) {
        if (!lead.phone || !lead.birth_date || String(lead.birth_date).slice(5) !== mmdd) continue
        out.push({
          targetId: lead.id,
          phone: lead.phone,
          message: renderTemplate(template, {
            nome: lead.name, primeiro_nome: firstName(lead.name),
            clinica: clinicName, data: '', hora: '', link: '', motivo: '',
          }),
          dedupKey: `aniversario:lead:${lead.id}:${today.slice(0, 4)}`,
        })
      }
      break
    }

    case 'recall': {
      if (!atSendHour) break
      const { data } = await admin
        .from('recalls')
        .select('id, reason, lead:leads(id, name, phone)')
        .eq('clinic_id', rule.clinic_id)
        .eq('status', 'pending')
        .lte('recall_date', today)
      for (const rec of (data ?? []) as unknown as Array<{ id: string; reason: string; lead: { id: string; name: string; phone: string | null } | null }>) {
        if (!rec.lead?.phone) continue
        out.push({
          targetId: rec.id,
          phone: rec.lead.phone,
          message: renderTemplate(template, {
            nome: rec.lead.name, primeiro_nome: firstName(rec.lead.name),
            clinica: clinicName, motivo: rec.reason, data: '', hora: '', link: '',
          }),
          dedupKey: `recall:rec:${rec.id}`,
        })
      }
      break
    }

    case 'avaliacao': {
      if (!atSendHour) break
      const r = spDayUtcRange(spDateStr(addDays(now, -1)))
      const reviewLink = typeof rule.config.review_link === 'string' ? rule.config.review_link : ''
      for (const apt of await appointmentsInRange(admin, rule.clinic_id, r.start, r.end, ['attended'])) {
        if (!apt.lead?.phone) continue
        out.push({
          targetId: apt.id,
          phone: apt.lead.phone,
          message: renderTemplate(template, {
            nome: apt.lead.name, primeiro_nome: firstName(apt.lead.name),
            clinica: clinicName, link: reviewLink, data: fmtData(apt.scheduled_at), hora: '', motivo: '',
          }).trim(),
          dedupKey: `avaliacao:apt:${apt.id}`,
        })
      }
      break
    }

    case 'relatorio_dono': {
      // Segunda-feira de manhã, no WhatsApp cadastrado da clínica
      if (!atSendHour || spWall(now).getUTCDay() !== 1) break
      const ownerPhone = rule.clinics?.phone
      if (!ownerPhone) break
      const weekStart = new Date(now.getTime() - 7 * 86400_000).toISOString()
      const [leads, apts, attended] = await Promise.all([
        admin.from('leads').select('id', { count: 'exact', head: true }).eq('clinic_id', rule.clinic_id).gte('created_at', weekStart),
        admin.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', rule.clinic_id).gte('created_at', weekStart),
        admin.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', rule.clinic_id).eq('status', 'attended').gte('scheduled_at', weekStart),
      ])
      const resumo = [
        `• Novos pacientes/leads: *${leads.count ?? 0}*`,
        `• Consultas marcadas: *${apts.count ?? 0}*`,
        `• Consultas realizadas: *${attended.count ?? 0}*`,
      ].join('\n')
      out.push({
        targetId: rule.clinic_id,
        phone: ownerPhone,
        message: renderTemplate(template, {
          clinica: clinicName, resumo, nome: '', primeiro_nome: '', data: '', hora: '', link: '', motivo: '',
        }),
        dedupKey: `relatorio:${rule.clinic_id}:${today}`,
      })
      break
    }
  }

  return out
}

export interface EngineResult {
  processed: number
  sent: number
  skipped: number
  failed: number
  details: Array<{ type: string; dedupKey: string; status: string; error?: string }>
}

export async function runNotificationEngine(now = new Date()): Promise<EngineResult> {
  const admin = createAdminClient()
  const result: EngineResult = { processed: 0, sent: 0, skipped: 0, failed: 0, details: [] }

  const { data: rules, error } = await admin
    .from('notification_rules')
    .select('id, clinic_id, type, template, channel, config, clinics(id, name, phone, wa_cloud_phone_id, wa_cloud_token)')
    .eq('enabled', true)
  if (error) throw new Error(`Erro lendo notification_rules: ${error.message}`)

  for (const rule of (rules ?? []) as unknown as RuleRow[]) {
    let due: Due[] = []
    try {
      due = await dueForRule(admin, rule, now)
    } catch (err) {
      result.details.push({ type: rule.type, dedupKey: '(coleta)', status: 'failed', error: String(err) })
      continue
    }

    for (const item of due) {
      result.processed++
      // Idempotência: INSERT primeiro; conflito de dedup_key = já enviado → pula
      const { error: insErr } = await admin.from('notification_log').insert({
        clinic_id: rule.clinic_id,
        type: rule.type,
        target_id: item.targetId,
        dedup_key: item.dedupKey,
        phone: item.phone,
        message: item.message,
        status: 'sent',
      })
      if (insErr) {
        if (insErr.code === '23505') { result.skipped++; continue } // unique_violation = dedup
        result.failed++
        result.details.push({ type: rule.type, dedupKey: item.dedupKey, status: 'failed', error: insErr.message })
        continue
      }

      // ── MODO SEGURO (trava anti-mensagem-indesejada) ─────────────
      // Se NOTIFICATIONS_ALLOWED_PHONES estiver definida no ambiente,
      // NENHUMA mensagem sai para número fora da lista — o item vira
      // 'skipped' no log. Proteção contra dado de teste/demo com
      // telefone que pode pertencer a alguém de verdade.
      if (!phoneAllowed(item.phone)) {
        result.skipped++
        await admin.from('notification_log')
          .update({ status: 'skipped', error: 'modo seguro: número fora da lista NOTIFICATIONS_ALLOWED_PHONES' })
          .eq('clinic_id', rule.clinic_id)
          .eq('dedup_key', item.dedupKey)
        result.details.push({ type: rule.type, dedupKey: item.dedupKey, status: 'skipped', error: 'modo seguro' })
        continue
      }

      const sender = getSender(rule.channel, rule.config ?? {}, {
        phoneId: rule.clinics?.wa_cloud_phone_id,
        token: rule.clinics?.wa_cloud_token,
      })
      const sendRes = await sender.send(item.phone, item.message)
      if (sendRes.ok) {
        result.sent++
        result.details.push({ type: rule.type, dedupKey: item.dedupKey, status: 'sent' })
      } else {
        result.failed++
        await admin.from('notification_log')
          .update({ status: 'failed', error: sendRes.error })
          .eq('clinic_id', rule.clinic_id)
          .eq('dedup_key', item.dedupKey)
        result.details.push({ type: rule.type, dedupKey: item.dedupKey, status: 'failed', error: sendRes.error })
      }

      // Recall enviado → marca como contatado (reflete no módulo Recall)
      if (rule.type === 'recall' && sendRes.ok && item.targetId) {
        await admin.from('recalls')
          .update({ status: 'contacted', contacted_at: new Date().toISOString() })
          .eq('id', item.targetId)
      }
    }
  }

  return result
}
