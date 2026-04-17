import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadDetailClient from '@/components/leads/LeadDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [leadResult, stagesResult, usersResult, eventsResult] = await Promise.all([
    supabase
      .from('leads')
      .select('*, stage:pipeline_stages(id, name, color), assigned_user:users(id, name)')
      .eq('id', id)
      .single(),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('users')
      .select('id, name, role')
      .eq('is_active', true),
    supabase
      .from('lead_events')
      .select('*, user:users(id, name)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (!leadResult.data) notFound()

  return (
    <LeadDetailClient
      lead={leadResult.data}
      stages={stagesResult.data ?? []}
      teamMembers={usersResult.data ?? []}
      events={eventsResult.data ?? []}
    />
  )
}
