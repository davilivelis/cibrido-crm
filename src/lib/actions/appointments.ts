'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncAppointmentToGoogle } from '@/lib/google/calendar'
import { fireOutbound } from '@/lib/integrations/outbound'

export async function createAppointment(data: {
  leadId: string
  clinicId: string
  title: string
  scheduledAt: string   // ISO string vindo do datetime-local input
  durationMin: number
  notes: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: created, error } = await supabase.from('appointments').insert({
    clinic_id:    data.clinicId,
    lead_id:      data.leadId,
    scheduled_by: user?.id ?? null,
    title:        data.title,
    scheduled_at: new Date(data.scheduledAt).toISOString(),
    duration_min: data.durationMin,
    notes:        data.notes || null,
    status:       'scheduled',
  }).select('id').single()

  if (error) throw new Error(error.message)

  // Agenda Google (S3.5): reflete a consulta na agenda da clínica
  if (created) await syncAppointmentToGoogle(created.id)

  // Registra na timeline do lead
  await supabase.from('lead_events').insert({
    clinic_id:   data.clinicId,
    lead_id:     data.leadId,
    user_id:     user?.id ?? null,
    type:        'appointment',
    description: `Consulta agendada para ${new Date(data.scheduledAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })}`,
  })

  // Avança o lead para "Consulta Marcada" se houver essa etapa
  const { data: stage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('clinic_id', data.clinicId)
    .ilike('name', '%consulta marcada%')
    .single()

  if (stage) {
    await supabase.from('leads').update({ stage_id: stage.id }).eq('id', data.leadId)
  }

  revalidatePath(`/leads/${data.leadId}`)
  revalidatePath('/agenda')
  revalidatePath('/pipeline')
}

// Atualiza o status de uma consulta (ex: marcar como compareceu, não veio, cancelada)
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled',
  value?: number
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) throw new Error(error.message)

  // Agenda Google (S3.5): confirmada atualiza, cancelada/faltou remove
  await syncAppointmentToGoogle(appointmentId)

  // N3 manual: compareceu + valor informado → registra a conversão (faturamento
  // por campanha). Fallback universal pra clínica sem integração de sistema.
  if (status === 'attended' && value && value > 0) {
    const admin = createAdminClient()
    const { data: apt } = await admin
      .from('appointments')
      .select('clinic_id, lead_id, lead:leads(campaign_id)')
      .eq('id', appointmentId)
      .maybeSingle()
    if (apt) {
      // relação to-one: runtime é objeto, mas o tipo inferido pode vir como array
      const leadRel = apt.lead as unknown as { campaign_id: string | null } | { campaign_id: string | null }[] | null
      const campaignId = (Array.isArray(leadRel) ? leadRel[0]?.campaign_id : leadRel?.campaign_id) ?? null
      // dedup por consulta (external_id apt:{id}) — remarcar não duplica
      await admin.from('conversions').insert({
        clinic_id: apt.clinic_id,
        lead_id: apt.lead_id,
        campaign_id: campaignId,
        appointment_id: appointmentId,
        source: 'manual',
        external_id: `apt:${appointmentId}`,
        value,
        occurred_at: new Date().toISOString(),
      })
      fireOutbound(apt.clinic_id, 'conversion.created', { leadId: apt.lead_id, campaignId, value, source: 'manual' }).catch(() => {})
    }
  }

  revalidatePath('/agenda')
  revalidatePath('/trafego')
}
