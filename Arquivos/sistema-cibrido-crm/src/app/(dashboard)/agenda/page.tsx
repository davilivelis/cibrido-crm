// Página de Agenda — consultas agrupadas por dia
// A lógica de exibição e interação de status está no AgendaClient
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgendaClient from '@/components/agenda/AgendaClient'
import { AppointmentStatus } from '@/types/database'

export const metadata = { title: 'Agenda — CibridoCRM' }

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca consultas dos últimos 7 dias até 30 dias no futuro
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, title, scheduled_at, duration_min, status, notes, lead:leads(id, name, phone)')
    .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(100)

  const hoje   = new Date().toDateString()
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()

  function getDayLabel(dateStr: string): string {
    const d = new Date(dateStr).toDateString()
    if (d === hoje)   return 'Hoje'
    if (d === amanha) return 'Amanhã'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  // Agrupa por dia para passar ao client
  const grouped: Record<string, { dayKey: string; dayLabel: string; appts: NonNullable<typeof appointments> }> = {}

  for (const appt of appointments ?? []) {
    const key = new Date(appt.scheduled_at).toDateString()
    if (!grouped[key]) {
      grouped[key] = { dayKey: key, dayLabel: getDayLabel(appt.scheduled_at), appts: [] }
    }
    grouped[key]!.appts.push(appt)
  }

  const byDay = Object.values(grouped).map((g) => ({
    dayKey:   g.dayKey,
    dayLabel: g.dayLabel,
    appts: g.appts.map((a) => ({
      id:           a.id,
      scheduled_at: a.scheduled_at,
      duration_min: a.duration_min,
      title:        a.title,
      status:       a.status as AppointmentStatus,
      notes:        a.notes,
      lead:         a.lead as unknown as { id: string; name: string; phone: string } | null,
    })),
  }))

  return (
    <AgendaClient
      byDay={byDay}
      total={appointments?.length ?? 0}
    />
  )
}
