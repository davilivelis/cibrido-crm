'use server'

// Server Actions da tela Configurações → Integrações.
// A clínica gera o token de entrada (pra dar à Tintim/Trinks/sistema) e,
// opcionalmente, configura pra onde o CRM envia seus eventos.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function randomToken(len = 40): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')
}

async function clinicOf(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')
  return (clinicId as string) ?? null
}

export interface IntegrationConfig {
  inboundUrl: string | null   // URL completa pra dar à plataforma externa
  hasOutbound: boolean
  outboundUrl: string | null
}

export async function getIntegrationConfig(): Promise<IntegrationConfig> {
  const clinicId = await clinicOf()
  if (!clinicId) return { inboundUrl: null, hasOutbound: false, outboundUrl: null }

  const admin = createAdminClient()
  const { data: clinic } = await admin
    .from('clinics')
    .select('webhook_in_token, webhook_out_url, webhook_out_secret')
    .eq('id', clinicId)
    .maybeSingle()

  const base = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.livelis.com.br'
  return {
    inboundUrl: clinic?.webhook_in_token ? `${base}/api/webhooks/in/${clinic.webhook_in_token}` : null,
    hasOutbound: Boolean(clinic?.webhook_out_secret),
    outboundUrl: clinic?.webhook_out_url ?? null,
  }
}

// Gera (ou rotaciona) o token de entrada. Rotacionar invalida o anterior.
export async function generateInboundToken(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const clinicId = await clinicOf()
  if (!clinicId) return { ok: false, error: 'Não autorizado' }

  const token = randomToken()
  const admin = createAdminClient()
  const { error } = await admin.from('clinics').update({ webhook_in_token: token }).eq('id', clinicId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/configuracoes/integracoes')
  const base = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.livelis.com.br'
  return { ok: true, url: `${base}/api/webhooks/in/${token}` }
}

// Configura a URL de saída (o CRM envia eventos pra lá). Gera o segredo HMAC.
export async function saveOutboundWebhook(rawUrl: string): Promise<{ ok: boolean; secret?: string; error?: string }> {
  const clinicId = await clinicOf()
  if (!clinicId) return { ok: false, error: 'Não autorizado' }

  const url = rawUrl.trim()
  if (url && !/^https:\/\//i.test(url)) return { ok: false, error: 'A URL precisa começar com https://' }

  const admin = createAdminClient()
  if (!url) {
    // Limpar a saída
    const { error } = await admin.from('clinics')
      .update({ webhook_out_url: null, webhook_out_secret: null }).eq('id', clinicId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/configuracoes/integracoes')
    return { ok: true }
  }

  // Preserva o segredo se já existe; senão gera um novo
  const { data: existing } = await admin.from('clinics').select('webhook_out_secret').eq('id', clinicId).maybeSingle()
  const secret = existing?.webhook_out_secret ?? randomToken(48)
  const { error } = await admin.from('clinics')
    .update({ webhook_out_url: url, webhook_out_secret: secret }).eq('id', clinicId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/configuracoes/integracoes')
  return { ok: true, secret }
}
