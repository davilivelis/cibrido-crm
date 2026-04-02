// Layout principal do CRM — envolve todas as páginas autenticadas
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { UserRole } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Usa RPC SECURITY DEFINER para checar clínica (bypassa problema de GRANT nas tabelas)
  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')
  const { data: userRole } = await supabase.rpc('get_user_role')

  // Sem clínica → onboarding
  if (!clinicId) redirect('/onboarding')

  // Dados do perfil via metadados do auth (sempre acessíveis) + fallbacks
  const meta = user.user_metadata ?? {}
  const profile = {
    id:         user.id,
    clinic_id:  clinicId as string,
    name:       (meta.name || meta.full_name || user.email?.split('@')[0] || 'Usuário') as string,
    email:      user.email ?? '',
    role:       ((userRole || meta.role || 'owner') as UserRole),
    is_active:  true,
    created_at: '',
    updated_at: '',
    clinics:    { name: (meta.clinic_name || 'CibridoCRM') as string },
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F8F9FB' }}>
      <Sidebar userRole={profile.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
