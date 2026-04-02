'use server'

// Server Actions — funções que rodam no servidor, chamadas direto do componente
// Next.js executa no backend, nunca exposto ao browser

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Muda a etapa de um lead (usado no drag-and-drop do pipeline)
export async function updateLeadStage(leadId: string, stageId: string | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ stage_id: stageId })
    .eq('id', leadId)

  if (error) throw new Error(error.message)

  // Registra o evento na timeline do lead
  const { data: lead } = await supabase
    .from('leads')
    .select('clinic_id')
    .eq('id', leadId)
    .single()

  if (lead) {
    await supabase.from('lead_events').insert({
      clinic_id: lead.clinic_id,
      lead_id: leadId,
      type: 'stage_change',
      description: 'Etapa alterada via pipeline',
      metadata: { stage_id: stageId },
    })
  }

  revalidatePath('/pipeline')
  revalidatePath(`/leads/${leadId}`)
}

// Atualiza campos do lead (status, notes, assigned_to, etc.)
export async function updateLead(
  leadId: string,
  data: {
    name?: string
    phone?: string
    email?: string | null
    source?: string | null
    stage_id?: string | null
    status?: string
    lost_reason?: string | null
    notes?: string | null
    assigned_to?: string | null
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', leadId)

  if (error) throw new Error(error.message)

  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/leads')
  revalidatePath('/pipeline')
}

// Cria um novo lead (usado pelo modal Novo Lead)
export async function createLead(data: {
  name:     string
  phone:    string
  email?:   string | null
  source?:  string | null
  stage_id?: string | null
  notes?:   string | null
}) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .single()

  if (!profile?.clinic_id) throw new Error('Usuário sem clínica vinculada')

  const { error } = await supabase.from('leads').insert({
    clinic_id: profile.clinic_id,
    name:      data.name.trim(),
    phone:     data.phone.trim(),
    email:     data.email?.trim()  || null,
    source:    data.source?.trim() || null,
    stage_id:  data.stage_id       || null,
    notes:     data.notes?.trim()  || null,
    status:    'active' as const,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/leads')
  revalidatePath('/pipeline')
}

// Importação em lote de leads via CSV
// Recebe um array de linhas já parseadas (nome + telefone obrigatórios)
export async function importLeads(rows: {
  name: string
  phone: string
  email?: string
  source?: string
  notes?: string
}[]) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .single()

  if (!profile) throw new Error('Usuário sem clínica')

  const records = rows.map((r) => ({
    clinic_id: profile.clinic_id,
    name:   r.name.trim(),
    phone:  r.phone.trim(),
    email:  r.email?.trim() || null,
    source: r.source?.trim() || null,
    notes:  r.notes?.trim()  || null,
    status: 'active' as const,
  }))

  const { error } = await supabase.from('leads').insert(records)
  if (error) throw new Error(error.message)

  revalidatePath('/leads')
  return records.length
}

// Adiciona um evento/nota na timeline do lead
export async function addLeadEvent(
  leadId: string,
  clinicId: string,
  type: string,
  description: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('lead_events').insert({
    clinic_id: clinicId,
    lead_id: leadId,
    user_id: user?.id ?? null,
    type,
    description,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/leads/${leadId}`)
}
