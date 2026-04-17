import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingClient from '@/components/onboarding/OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // RPC SECURITY DEFINER — funciona mesmo sem GRANT nas tabelas
  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')

  // Já tem clínica → vai direto pro dashboard
  if (clinicId) redirect('/dashboard')

  const meta = user.user_metadata ?? {}
  const userName = (meta.name || meta.full_name || user.email?.split('@')[0] || 'Usuário') as string

  return (
    <OnboardingClient
      userName={userName}
      clinicId={''}
      clinicName={''}
    />
  )
}
