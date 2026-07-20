'use server'

// Server Actions do chat de conversas (S3).
// Envio de mensagem manual pelo painel — sai pelo mesmo canal Evolution
// do motor de notificações e respeita o MODO SEGURO (whitelist).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EvolutionSender, phoneAllowed } from '@/lib/notifications/sender'

export interface ChatMessage {
  id: string
  direction: string
  content: string
  created_at: string
  status: string
}

export async function sendChatMessage(
  leadId: string,
  text: string
): Promise<{ ok: boolean; error?: string; message?: ChatMessage }> {
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
    .select('whatsapp_instance, is_active')
    .eq('id', lead.clinic_id)
    .single()

  // Bloqueio de acesso (S5) vale também nas server actions, não só no layout:
  // clínica bloqueada não envia mensagem mesmo com a aba aberta.
  if (clinic?.is_active === false) {
    return { ok: false, error: 'Acesso suspenso: regularize a clínica para voltar a enviar mensagens.' }
  }

  const sender = new EvolutionSender(clinic?.whatsapp_instance ?? undefined)
  const res = await sender.send(lead.phone, trimmed)
  if (!res.ok) return { ok: false, error: res.error ?? 'Falha no envio' }

  // Grava com o external_id da Evolution → o eco fromMe do webhook dedup (não duplica)
  const { data: inserted, error: insErr } = await admin.from('conversations').insert({
    clinic_id: lead.clinic_id,
    lead_id: lead.id,
    channel: 'whatsapp',
    direction: 'outbound',
    content: trimmed,
    sent_by: user.id,
    external_id: res.externalId ?? null,
    status: 'sent',
  }).select('id, direction, content, created_at, status').single()
  if (insErr) return { ok: false, error: `Enviada, mas falhou ao registrar: ${insErr.message}` }

  revalidatePath('/conversas')
  revalidatePath(`/conversas/${leadId}`)
  // Devolve a linha inserida p/ o chat apender na hora (fallback se o realtime cair)
  return { ok: true, message: inserted as ChatMessage }
}
