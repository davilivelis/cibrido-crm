'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ─── Verificação de admin ───────────────────────────────────
async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!user || !adminEmails.includes(user.email ?? '')) {
    throw new Error('Acesso negado.')
  }
  return user
}

// ─── CLIENTES ───────────────────────────────────────────────

export async function getAdminClients() {
  await assertAdmin()
  const admin = createAdminClient()

  const { data: clinics, error } = await admin
    .from('clinics')
    .select(`
      id, name, phone, email, is_active, created_at,
      users(id, name, email, role),
      subscriptions(plan, status, trial_ends_at, paid_until)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return clinics ?? []
}

export async function toggleClientAccess(clinicId: string, isActive: boolean) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('clinics')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', clinicId)

  if (error) throw new Error(error.message)

  await admin
    .from('subscriptions')
    .update({ status: isActive ? 'active' : 'blocked', updated_at: new Date().toISOString() })
    .eq('clinic_id', clinicId)
}

// ─── CONVITES ───────────────────────────────────────────────

export async function createInvite(data: {
  email: string
  plan: string
  validityDays: number
}) {
  const user = await assertAdmin()
  const admin = createAdminClient()

  // Gera token único via função do banco
  const { data: tokenData } = await admin.rpc('generate_invite_token')
  const token = tokenData as string

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + data.validityDays)

  const { data: invite, error } = await admin
    .from('invites')
    .insert({
      token,
      email:      data.email.trim().toLowerCase(),
      plan:       data.plan,
      origin:     'manual',
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const link = `${process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.cibrido.com.br'}/convite/${token}`
  return { invite, link }
}

export async function getInvites() {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('invites')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAdminClientDetail(clinicId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const [clinicRes, leadsRes, appointmentsRes, notesRes] = await Promise.all([
    admin
      .from('clinics')
      .select(`id, name, phone, email, address, plan, is_active, created_at, users(id, name, email, role), subscriptions(plan, status, trial_ends_at, paid_until)`)
      .eq('id', clinicId)
      .single(),
    admin.from('leads').select('id', { count: 'exact' }).eq('clinic_id', clinicId),
    admin.from('appointments').select('id', { count: 'exact' }).eq('clinic_id', clinicId),
    admin.from('admin_notes').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
  ])

  if (clinicRes.error) throw new Error(clinicRes.error.message)

  return {
    clinic:       clinicRes.data,
    totalLeads:   leadsRes.count ?? 0,
    totalAppointments: appointmentsRes.count ?? 0,
    notes:        notesRes.data ?? [],
  }
}

export async function createAdminNote(clinicId: string, content: string) {
  const user = await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('admin_notes')
    .insert({ clinic_id: clinicId, author_email: user.email ?? '', content })

  if (error) throw new Error(error.message)
}

export async function getAdminNotifications() {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('admin_notifications')
    .select('*')
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function markNotificationsRead() {
  await assertAdmin()
  const admin = createAdminClient()

  await admin
    .from('admin_notifications')
    .update({ read: true })
    .eq('read', false)
}

export async function revokeInvite(id: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('invites')
    .update({ status: 'revoked' })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)
}

export async function deleteInvite(id: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('invites')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) throw new Error(error.message)
}

// ─── CIBRIDO LEADS ──────────────────────────────────────────

export async function getCibridoLeads() {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('cibrido_leads')
    .select('*, cibrido_calls(id, scheduled_at, outcome)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCibridoLead(data: {
  name: string
  clinic_name?: string
  phone?: string
  email?: string
  source?: string
  assigned_to?: string
  notes?: string
}) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data: lead, error } = await admin
    .from('cibrido_leads')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return lead
}

export async function updateCibridoLeadStage(id: string, stage: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('cibrido_leads')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── CALLS ──────────────────────────────────────────────────

export async function getCibridoCalls() {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('cibrido_calls')
    .select('*, cibrido_leads(name, clinic_name)')
    .order('scheduled_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCibridoCall(data: {
  lead_id: string
  attended_by: string
  scheduled_at: string
  notes?: string
  next_step?: string
  outcome?: string
}) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error: callError } = await admin
    .from('cibrido_calls')
    .insert(data)

  if (callError) throw new Error(callError.message)

  // Avança lead para "call_agendada" se ainda estiver em estágio anterior
  const { data: lead } = await admin
    .from('cibrido_leads')
    .select('stage')
    .eq('id', data.lead_id)
    .single()

  if (lead && ['lead', 'qualificado'].includes(lead.stage)) {
    await admin
      .from('cibrido_leads')
      .update({ stage: 'call_agendada', updated_at: new Date().toISOString() })
      .eq('id', data.lead_id)
  }
}
