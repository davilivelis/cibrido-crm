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

  // .select() confirma que o UPDATE casou uma linha da PRÓPRIA clínica (RLS).
  // Se não casou (consulta de outra clínica), para aqui — sem sync/conversão
  // cross-tenant (um usuário da clínica A não injeta faturamento na clínica B).
  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select('id, clinic_id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!updated) return

  // Agenda Google (S3.5): confirmada atualiza, cancelada/faltou remove
  await syncAppointmentToGoogle(appointmentId)

  // N3 manual: compareceu + valor → registra/ATUALIZA a conversão (faturamento
  // por campanha). Fallback universal pra clínica sem integração de sistema.
  if (status === 'attended' && value && value > 0) {
    const admin = createAdminClient()
    const { data: apt } = await admin
      .from('appointments')
      .select('lead_id, lead:leads(campaign_id)')
      .eq('id', appointmentId)
      .maybeSingle()
    // relação to-one: runtime é objeto, mas o tipo inferido pode vir como array
    const leadRel = apt?.lead as unknown as { campaign_id: string | null } | { campaign_id: string | null }[] | null
    const campaignId = (Array.isArray(leadRel) ? leadRel[0]?.campaign_id : leadRel?.campaign_id) ?? null
    const extId = `apt:${appointmentId}`

    // Remarcar com valor corrigido ATUALIZA (não perde a correção nem duplica)
    const { data: existing } = await admin
      .from('conversions').select('id').eq('clinic_id', updated.clinic_id).eq('external_id', extId).maybeSingle()
    if (existing) {
      await admin.from('conversions').update({ value, occurred_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await admin.from('conversions').insert({
        clinic_id: updated.clinic_id,
        lead_id: apt?.lead_id ?? null,
        campaign_id: campaignId,
        appointment_id: appointmentId,
        source: 'manual',
        external_id: extId,
        value,
        occurred_at: new Date().toISOString(),
      })
    }
    fireOutbound(updated.clinic_id, 'conversion.created', { leadId: apt?.lead_id, campaignId, value, source: 'manual' }).catch(() => {})
  }

  revalidatePath('/agenda')
  revalidatePath('/trafego')
}
