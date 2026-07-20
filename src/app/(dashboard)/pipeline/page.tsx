// Página do Pipeline Kanban — colunas por etapa com cards de leads
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import StageManager from '@/components/pipeline/StageManager'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function PipelinePage() {
  const supabase = await createClient()

  // Busca etapas, leads e papel do usuário em paralelo
  const [stagesResult, leadsResult, roleResult] = await Promise.all([
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('leads')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false }),
    supabase.rpc('get_user_role'),
  ])

  const stages = stagesResult.data ?? []
  const isOwner = roleResult.data === 'owner'

  return (
    <div className="space-y-5 h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Pipeline</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            {leadsResult.data?.length ?? 0} leads ativos no funil
          </p>
        </div>
        {isOwner && <StageManager stages={stages.map((s) => ({ id: s.id, name: s.name }))} />}
      </div>

      <KanbanBoard stages={stages} leads={leadsResult.data ?? []} />
    </div>
  )
}
