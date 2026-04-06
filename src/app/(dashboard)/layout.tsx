// Layout principal do CRM — envolve todas as páginas autenticadas
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
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
  const profileName = (meta.name || meta.full_name || user.email?.split('@')[0] || 'Usuário') as string
  const clinicName  = (meta.clinic_name || 'CibridoCRM') as string
  const initials    = profileName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  const profile = {
    id:         user.id,
    clinic_id:  clinicId as string,
    name:       profileName,
    email:      user.email ?? '',
    role:       ((userRole || meta.role || 'owner') as UserRole),
    is_active:  true,
    created_at: '',
    updated_at: '',
    clinics:    { name: clinicName },
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F8F9FB' }}>
      {/* Sidebar desktop */}
      <Sidebar userRole={profile.role} />

      {/* Top bar + drawer mobile */}
      <MobileNav
        userRole={profile.role}
        userName={profileName}
        userInitials={initials}
        clinicName={clinicName}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header só no desktop — no mobile o MobileNav faz esse papel */}
        <div className="hidden lg:block">
          <Header user={profile} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pt-[82px] pb-6 lg:px-8 lg:py-7 lg:pt-7">
          {children}
        </main>
      </div>
    </div>
  )
}
