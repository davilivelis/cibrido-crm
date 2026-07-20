'use server'

// Submissão da pesquisa de satisfação — pública (o paciente chega pelo link do
// WhatsApp, sem login). A segurança é o token secreto + só responde 1 vez.

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitSurvey(input: {
  token: string
  reception: number
  professional: number
  comment: string
}): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient()

  const { data: survey } = await admin
    .from('satisfaction_surveys')
    .select('id, status')
    .eq('token', input.token)
    .maybeSingle()
  if (!survey) return { ok: false, error: 'Link inválido' }
  if (survey.status === 'responded') return { ok: false, error: 'Esta pesquisa já foi respondida' }

  const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)))

  // Compare-and-swap: só grava se ainda estiver 'pending'. Dois envios
  // concorrentes (double-tap / duas abas) — o segundo casa 0 linhas e não
  // sobrescreve a primeira resposta.
  const { data: updated, error } = await admin
    .from('satisfaction_surveys')
    .update({
      reception_rating: input.reception ? clamp(input.reception) : null,
      professional_rating: input.professional ? clamp(input.professional) : null,
      comment: input.comment?.trim().slice(0, 1000) || null,
      status: 'responded',
      responded_at: new Date().toISOString(),
    })
    .eq('id', survey.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!updated) return { ok: false, error: 'Esta pesquisa já foi respondida' }
  return { ok: true }
}
