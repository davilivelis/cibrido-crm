'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  const { error } = await supabase.from('appointments').insert({
    clinic_id:    data.clinicId,
    lead_id:      data.leadId,
    scheduled_by: user?.id ?? null,
    title:        data.title,
    scheduled_at: new Date(data.scheduledAt).toISOString(),
    duration_min: data.durationMin,
    notes:        data.notes || null,
    status:       'scheduled',
  })

  if (error) throw new Error(error.message)

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
  status: 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) throw new Error(error.message)

  revalidatePath('/agenda')
}
