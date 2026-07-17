// S3.5 — Agenda Google mão ÚNICA (CRM → Google), padrão Service Account.
// A clínica só compartilha a agenda dela com o e-mail da SA (onboarding de
// 2 min) e cola o ID da agenda nas Configurações. Sem OAuth, sem navegador.
//
// Envs (Vercel + cofre):
//   GOOGLE_CALENDAR_SA_EMAIL — e-mail da service account
//   GOOGLE_CALENDAR_SA_KEY   — private key PEM (com \n escapado)
//
// Regra: o sync NUNCA derruba o fluxo principal — falhou, loga e segue.

import { createSign } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

// Access token via JWT assinado com a chave da SA (RS256) — sem SDK
async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_CALENDAR_SA_EMAIL
  const key = process.env.GOOGLE_CALENDAR_SA_KEY?.replace(/\\n/g, '\n')
  if (!email || !key) return null

  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = signer.sign(key).toString('base64url')
  const assertion = `${header}.${claims}.${signature}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!res.ok) {
    console.error('[Agenda Google] Token falhou:', res.status, (await res.text()).slice(0, 200))
    return null
  }
  const json = (await res.json()) as { access_token?: string }
  return json.access_token ?? null
}

interface AptRow {
  id: string
  clinic_id: string
  scheduled_at: string
  duration_min: number | null
  status: string
  title: string | null
  notes: string | null
  google_event_id: string | null
  lead: { name: string; phone: string | null } | null
  clinic: { name: string; google_calendar_id: string | null } | null
}

// Sincroniza UMA consulta com a agenda Google da clínica.
// scheduled/confirmed → cria/atualiza o evento · cancelled/no_show → remove.
export async function syncAppointmentToGoogle(appointmentId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('appointments')
      .select(
        'id, clinic_id, scheduled_at, duration_min, status, title, notes, google_event_id, lead:leads(name, phone), clinic:clinics(name, google_calendar_id)'
      )
      .eq('id', appointmentId)
      .maybeSingle()
    const apt = data as unknown as AptRow | null
    if (!apt) return

    const calendarId = apt.clinic?.google_calendar_id
    if (!calendarId) return // clínica sem agenda conectada → nada a fazer

    const token = await getAccessToken()
    if (!token) return // envs ausentes/erro → sync desligado, CRM segue normal

    const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const remove = apt.status === 'cancelled' || apt.status === 'no_show'

    if (remove) {
      if (!apt.google_event_id) return
      const res = await fetch(`${base}/${encodeURIComponent(apt.google_event_id)}`, {
        method: 'DELETE',
        headers,
      })
      // 410 = já não existe — considera removido
      if (res.ok || res.status === 410 || res.status === 404) {
        await admin.from('appointments').update({ google_event_id: null }).eq('id', apt.id)
      } else {
        console.error('[Agenda Google] Delete falhou:', res.status, (await res.text()).slice(0, 200))
      }
      return
    }

    const start = new Date(apt.scheduled_at)
    const end = new Date(start.getTime() + (apt.duration_min ?? 60) * 60_000)
    const leadName = apt.lead?.name ?? 'Paciente'
    const statusLabel = apt.status === 'confirmed' ? ' ✅' : ''
    const event = {
      summary: `${leadName} — ${apt.title || 'Consulta'}${statusLabel}`,
      description: [
        apt.lead?.phone ? `WhatsApp: ${apt.lead.phone}` : null,
        apt.notes ? `Obs: ${apt.notes}` : null,
        `Agendado pelo CRM (${apt.clinic?.name ?? ''})`,
      ]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: start.toISOString(), timeZone: 'America/Sao_Paulo' },
      end: { dateTime: end.toISOString(), timeZone: 'America/Sao_Paulo' },
    }

    const url = apt.google_event_id ? `${base}/${encodeURIComponent(apt.google_event_id)}` : base
    const method = apt.google_event_id ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers, body: JSON.stringify(event) })

    if (res.ok) {
      const json = (await res.json()) as { id?: string }
      if (json.id && json.id !== apt.google_event_id) {
        await admin.from('appointments').update({ google_event_id: json.id }).eq('id', apt.id)
      }
    } else if ((res.status === 404 || res.status === 410) && apt.google_event_id) {
      // Evento sumiu da agenda → recria do zero
      const retry = await fetch(base, { method: 'POST', headers, body: JSON.stringify(event) })
      if (retry.ok) {
        const json = (await retry.json()) as { id?: string }
        if (json.id) await admin.from('appointments').update({ google_event_id: json.id }).eq('id', apt.id)
      }
    } else {
      console.error('[Agenda Google] Upsert falhou:', res.status, (await res.text()).slice(0, 200))
    }
  } catch (err) {
    console.error('[Agenda Google] Erro no sync:', err)
  }
}
