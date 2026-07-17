'use server'

// Server Actions do chat de conversas (S3).
// Envio de mensagem manual pelo painel — sai pelo mesmo canal Evolution
// do motor de notificações e respeita o MODO SEGURO (whitelist).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EvolutionSender, phoneAllowed } from '@/lib/notifications/sender'

export async function sendChatMessage(
  leadId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: 'Mensagem vazia' }
  if (trimmed.length > 4000) return { ok: false, error: 'Mensagem longa demais' }

  // Autentica pelo cliente com RLS — garante que o lead é da clínica do usuário
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, phone, clinic_id')
    .eq('id', leadId)
    .maybeSingle()
  if (!lead) return { ok: false, error: 'Lead não encontrado' }
  if (!lead.phone) return { ok: false, error: 'Lead sem telefone' }

  // Modo seguro: mesmo bloqueio do motor de notificações
  if (!phoneAllowed(lead.phone)) {
    return { ok: false, error: 'Modo seguro ativo: número fora da lista de envio autorizada' }
  }

  const admin = createAdminClient()
  const { data: clinic } = await admin
    .from('clinics')
    .select('whatsapp_instance')
    .eq('id', lead.clinic_id)
    .single()

  const sender = new EvolutionSender(clinic?.whatsapp_instance ?? undefined)
  const res = await sender.send(lead.phone, trimmed)
  if (!res.ok) return { ok: false, error: res.error ?? 'Falha no envio' }

  const { error: insErr } = await admin.from('conversations').insert({
    clinic_id: lead.clinic_id,
    lead_id: lead.id,
    channel: 'whatsapp',
    direction: 'outbound',
    content: trimmed,
    sent_by: user.id,
    status: 'sent',
  })
  if (insErr) return { ok: false, error: `Enviada, mas falhou ao registrar: ${insErr.message}` }

  revalidatePath('/conversas')
  revalidatePath(`/conversas/${leadId}`)
  return { ok: true }
}
