// Página do módulo de recall — lista de pacientes que precisam retornar
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecallsClient from '@/components/recalls/RecallsClient'
import { RecallWithLead } from '@/types/database'

export const metadata = { title: 'Recall — CibridoCRM' }

export default async function RecallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca recalls com dados do lead e responsável, ordenados por data
  const { data: rawRecalls } = await supabase
    .from('recalls')
    .select(`
      *,
      lead:leads(id, name, phone),
      assigned_user:users(id, name)
    `)
    .order('recall_date', { ascending: true })

  // Busca todos os leads ativos (para o select do modal de novo recall)
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, phone')
    .eq('status', 'active')
    .order('name')

  // Busca equipe da clínica
  const { data: team } = await supabase
    .from('users')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const recalls = (rawRecalls ?? []) as unknown as RecallWithLead[]

  return (
    <RecallsClient
      recalls={recalls}
      leads={leads ?? []}
      team={team ?? []}
    />
  )
}
