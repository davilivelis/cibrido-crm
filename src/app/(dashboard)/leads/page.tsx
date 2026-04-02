import { createClient } from '@/lib/supabase/server'
import LeadsClient from '@/components/leads/LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()

  const [leadsResult, stagesResult, profileResult] = await Promise.all([
    supabase
      .from('leads')
      .select(`*, stage:pipeline_stages(id, name, color), assigned_user:users(id, name)`)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('position'),
    supabase.from('users').select('clinic_id').single(),
  ])

  return (
    <LeadsClient
      leads={leadsResult.data ?? []}
      stages={stagesResult.data ?? []}
      clinicId={profileResult.data?.clinic_id ?? ''}
    />
  )
}
