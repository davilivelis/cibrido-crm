import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClinicForm from '@/components/configuracoes/ClinicForm'
import TeamSection from '@/components/configuracoes/TeamSection'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('*, clinics(*)')
    .single()

  // Só owner acessa configurações
  if (profile?.role !== 'owner') redirect('/dashboard')

  const { data: team } = await supabase
    .from('users')
    .select('id, name, email, role, is_active, created_at')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at')

  const clinic = profile.clinics as {
    id: string; name: string; phone: string | null
    email: string | null; address: string | null; plan: string; created_at: string
  } | null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Configurações</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>Dados da clínica e gerenciamento de equipe</p>
      </div>

      <ClinicForm clinic={clinic} />
      <TeamSection team={team ?? []} clinicPlan={clinic?.plan ?? 'trial'} />
    </div>
  )
}
