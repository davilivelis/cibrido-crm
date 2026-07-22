'use server'

// Server Actions da tela Configurações → Integrações.
// A clínica gera o token de entrada (pra dar à plataforma externa/sistema) e,
// opcionalmente, configura pra onde o CRM envia seus eventos.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSafeWebhookUrl } from '@/lib/integrations/outbound'

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

// Mutações de integração (rotacionar token, credenciais Meta, webhook de saída)
// são coisa de DONO — membro não pode matar o N3 nem redirecionar eventos.
async function ownerClinicOf(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [{ data: clinicId }, { data: role }] = await Promise.all([
    supabase.rpc('get_user_clinic_id'),
    supabase.rpc('get_user_role'),
  ])
  if (role !== 'owner') return null
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
  const clinicId = await ownerClinicOf()
  if (!clinicId) return { ok: false, error: 'Apenas o dono da clínica gerencia integrações' }

  const token = randomToken()
  const admin = createAdminClient()
  const { error } = await admin.from('clinics').update({ webhook_in_token: token }).eq('id', clinicId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/configuracoes/integracoes')
  const base = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.livelis.com.br'
  return { ok: true, url: `${base}/api/webhooks/in/${token}` }
}

// ── WhatsApp Cloud API oficial (anti-ban) — hand-off da conta Meta da clínica ──
export interface CloudApiStatus {
  configured: boolean
  phoneId: string | null
}

export async function getCloudApiStatus(): Promise<CloudApiStatus> {
  const clinicId = await clinicOf()
  if (!clinicId) return { configured: false, phoneId: null }
  const admin = createAdminClient()
  const { data } = await admin.from('clinics')
    .select('wa_cloud_phone_id, wa_cloud_token').eq('id', clinicId).maybeSingle()
  return { configured: Boolean(data?.wa_cloud_phone_id && data?.wa_cloud_token), phoneId: data?.wa_cloud_phone_id ?? null }
}

export async function saveCloudApi(phoneId: string, token: string): Promise<{ ok: boolean; error?: string }> {
  const clinicId = await ownerClinicOf()
  if (!clinicId) return { ok: false, error: 'Apenas o dono da clínica gerencia integrações' }
  const admin = createAdminClient()
  const { error } = await admin.from('clinics').update({
    wa_cloud_phone_id: phoneId.trim() || null,
    wa_cloud_token: token.trim() || null,
  }).eq('id', clinicId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/configuracoes/integracoes')
  return { ok: true }
}

// Configura a URL de saída (o CRM envia eventos pra lá). Gera o segredo HMAC.
export async function saveOutboundWebhook(rawUrl: string): Promise<{ ok: boolean; secret?: string; error?: string }> {
  const clinicId = await ownerClinicOf()
  if (!clinicId) return { ok: false, error: 'Apenas o dono da clínica gerencia integrações' }

  const url = rawUrl.trim()
  if (url && !isSafeWebhookUrl(url)) {
    return { ok: false, error: 'URL inválida — use https:// e um endereço público (não interno)' }
  }

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
