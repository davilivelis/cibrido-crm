'use server'

// Server Actions — módulo de recall
// Recall = paciente que precisa retornar à clínica

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { RecallStatus } from '@/types/database'

// Cria um novo recall para um lead
export async function createRecall(data: {
  lead_id: string
  recall_date: string   // YYYY-MM-DD
  reason: string
  notes?: string
  assigned_to?: string | null
}) {
  const supabase = await createClient()

  // clinic_id do usuário via RPC user-scoped (o .single() sobre users quebra com 2+ membros)
  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')
  if (!clinicId) throw new Error('Usuário sem clínica')

  const { error } = await supabase.from('recalls').insert({
    clinic_id:   clinicId,
    lead_id:     data.lead_id,
    recall_date: data.recall_date,
    reason:      data.reason,
    notes:       data.notes ?? null,
    assigned_to: data.assigned_to ?? null,
    status:      'pending',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/recalls')
}

// Atualiza o status de um recall
export async function updateRecallStatus(recallId: string, status: RecallStatus) {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const extraFields: Record<string, string | null> = {}
  if (status === 'contacted') extraFields.contacted_at = now
  if (status === 'done' || status === 'cancelled') extraFields.resolved_at = now

  const { error } = await supabase
    .from('recalls')
    .update({ status, ...extraFields })
    .eq('id', recallId)

  if (error) throw new Error(error.message)

  revalidatePath('/recalls')
}

// Atualiza campos livres de um recall (data, motivo, notas)
export async function updateRecall(recallId: string, data: {
  recall_date?: string
  reason?: string
  notes?: string | null
  assigned_to?: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('recalls')
    .update(data)
    .eq('id', recallId)

  if (error) throw new Error(error.message)

  revalidatePath('/recalls')
}

// Remove um recall
export async function deleteRecall(recallId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('recalls')
    .delete()
    .eq('id', recallId)

  if (error) throw new Error(error.message)

  revalidatePath('/recalls')
}
