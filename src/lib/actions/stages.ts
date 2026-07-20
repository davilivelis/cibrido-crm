'use server'

// Etapas do funil editáveis pelo dono — cada negócio nomeia do seu jeito
// (clínica: "Consulta Marcada"; agência: "Proposta Enviada"; etc.).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertOwner(): Promise<string | null> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('users').select('clinic_id, role').single()
  if (!profile || profile.role !== 'owner') return null
  return profile.clinic_id as string
}

export async function saveStages(input: {
  existing: { id: string; name: string }[]  // na ordem desejada (renomeadas/reordenadas)
  added: string[]                            // etapas novas (nomes), no fim
  deletedIds: string[]
}): Promise<{ ok: boolean; error?: string }> {
  const clinicId = await assertOwner()
  if (!clinicId) return { ok: false, error: 'Apenas o dono edita as etapas do funil' }

  const admin = createAdminClient()

  // Remove (soft) e solta os leads dessas etapas (não some ninguém do funil)
  for (const id of input.deletedIds) {
    await admin.from('leads').update({ stage_id: null }).eq('stage_id', id).eq('clinic_id', clinicId)
    await admin.from('pipeline_stages').update({ is_active: false }).eq('id', id).eq('clinic_id', clinicId)
  }

  // Renomeia + reordena as existentes
  let pos = 1
  for (const s of input.existing) {
    const name = s.name.trim().slice(0, 40) || 'Etapa'
    await admin.from('pipeline_stages')
      .update({ name, position: pos }).eq('id', s.id).eq('clinic_id', clinicId)
    pos++
  }

  // Adiciona as novas
  for (const raw of input.added) {
    const name = raw.trim().slice(0, 40)
    if (!name) continue
    await admin.from('pipeline_stages')
      .insert({ clinic_id: clinicId, name, position: pos, is_active: true, color: '#94a3b8' })
    pos++
  }

  revalidatePath('/pipeline')
  return { ok: true }
}
