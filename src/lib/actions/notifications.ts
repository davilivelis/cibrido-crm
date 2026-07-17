'use server'

// Actions da tela Configurações → Notificações.
// RLS garante que cada clínica só enxerga/edita as próprias regras.

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NotificationType } from '@/lib/notifications/templates'

export interface NotificationRule {
  id: string
  clinic_id: string
  type: NotificationType
  enabled: boolean
  template: string | null
  channel: 'evolution' | 'cloud_api'
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function getNotificationRules(): Promise<NotificationRule[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .order('type')
  if (error) throw new Error(error.message)
  return (data ?? []) as NotificationRule[]
}

export async function saveNotificationRule(input: {
  type: NotificationType
  enabled: boolean
  template: string | null
  review_link?: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id, role')
    .single()
  if (!profile || profile.role !== 'owner') {
    return { ok: false, error: 'Apenas o dono da clínica altera notificações' }
  }

  const config: Record<string, unknown> = {}
  if (input.review_link !== undefined) config.review_link = input.review_link.trim()

  const { error } = await supabase.from('notification_rules').upsert(
    {
      clinic_id: profile.clinic_id,
      type: input.type,
      enabled: input.enabled,
      template: input.template?.trim() || null,
      config,
    },
    { onConflict: 'clinic_id,type' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/configuracoes/notificacoes')
  return { ok: true }
}

export interface NotificationLogRow {
  id: string
  type: string
  phone: string | null
  message: string | null
  status: string
  error: string | null
  created_at: string
}

export async function getNotificationLog(limit = 50): Promise<NotificationLogRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notification_log')
    .select('id, type, phone, message, status, error, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as NotificationLogRow[]
}
