// Página do Pipeline Kanban — colunas por etapa com cards de leads
import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/pipeline/KanbanBoard'

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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Pipeline</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
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
