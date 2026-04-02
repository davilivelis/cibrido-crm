'use server'

// Server Actions — módulo de tráfego pago
// Gerencia campanhas de Meta, Google e TikTok

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createCampaign(data: {
  name:           string
  platform:       'meta' | 'google' | 'tiktok'
  budget_monthly: number | null
  started_at:     string | null   // YYYY-MM-DD ou null
}) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .single()

  if (!profile) throw new Error('Usuário sem clínica')

  const { error } = await supabase.from('campaigns').insert({
    clinic_id:      profile.clinic_id,
    name:           data.name.trim(),
    platform:       data.platform,
    status:         'active',
    budget_monthly: data.budget_monthly,
    started_at:     data.started_at || null,
    spent_total:    0,
    impressions:    0,
    clicks:         0,
    leads_generated: 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/trafego')
}

// Atualiza métricas de uma campanha (gasto, impressões, cliques, leads)
export async function updateCampaignMetrics(campaignId: string, data: {
  spent_total?:     number
  impressions?:     number
  clicks?:          number
  leads_generated?: number
  status?:          'active' | 'paused' | 'ended'
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', campaignId)

  if (error) throw new Error(error.message)
  revalidatePath('/trafego')
}
