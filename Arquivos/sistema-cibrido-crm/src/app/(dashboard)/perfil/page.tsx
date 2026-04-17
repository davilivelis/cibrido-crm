// Página de perfil do usuário — alterar nome e senha
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PerfilClient from '@/components/perfil/PerfilClient'

export const metadata = { title: 'Meu Perfil — CibridoCRM' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl lg:text-[28px] font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">Gerencie seus dados e senha de acesso</p>
      </div>
      <PerfilClient user={profile} />
    </div>
  )
}
