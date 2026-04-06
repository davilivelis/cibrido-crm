// Página do Pipeline Kanban — colunas por etapa com cards de leads
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/pipeline/KanbanBoard'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function PipelinePage() {
  const supabase = await createClient()

  // Busca etapas e leads em paralelo
  const [stagesResult, leadsResult] = await Promise.all([
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
  ])

  return (
    <div className="space-y-5 h-full">
      <div>
        <h1 className="text-xl lg:text-[28px] font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">
          {leadsResult.data?.length ?? 0} leads ativos no funil
        </p>
      </div>

      <KanbanBoard
        stages={stagesResult.data ?? []}
        leads={leadsResult.data ?? []}
      />
    </div>
  )
}
