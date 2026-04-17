import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import InviteClient from './InviteClient'

const PLAN_LABELS: Record<string, string> = {
  lite:     'Cibri-Lite',
  standard: 'Cibri-Standard',
  master:   'Cibri-Master',
  trial:    'Trial 10 dias',
}

export default async function ConvitePage({ params }: { params: { token: string } }) {
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('invites')
    .select('id, email, plan, status, expires_at')
    .eq('token', params.token)
    .maybeSingle()

  // Token inválido ou revogado
  if (!invite || invite.status === 'revoked') {
    redirect('/login?error=convite-invalido')
  }

  // Já usado
  if (invite.status === 'used') {
    redirect('/login?error=convite-usado')
  }

  // Expirado
  if (new Date(invite.expires_at) < new Date()) {
    await admin.from('invites').update({ status: 'expired' }).eq('id', invite.id)
    redirect('/login?error=convite-expirado')
  }

  const planLabel = PLAN_LABELS[invite.plan] ?? invite.plan

  return (
    <InviteClient
      token={params.token}
      email={invite.email}
      plan={invite.plan}
      planLabel={planLabel}
    />
  )
}
