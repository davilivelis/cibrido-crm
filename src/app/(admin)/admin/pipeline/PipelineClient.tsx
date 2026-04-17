'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'
import { updateCibridoLeadStage } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'

const STAGES = [
  { id: 'lead',             label: 'Lead',             color: '#6366f1' },
  { id: 'qualificado',      label: 'Qualificado',      color: '#f59e0b' },
  { id: 'call_agendada',    label: 'Call Agendada',    color: '#10b981' },
  { id: 'proposta_enviada', label: 'Proposta Enviada', color: '#E91E7B' },
  { id: 'cliente_ativo',    label: 'Cliente Ativo',    color: '#22c55e' },
  { id: 'churned',          label: 'Churned',          color: '#ef4444' },
]

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram', meta_ads: 'Meta Ads', indicacao: 'Indicação',
  presencial: 'Presencial', organico: 'Orgânico',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PipelineClient({ leads }: { leads: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAdvance(id: string, currentStage: string) {
    const idx  = STAGES.findIndex(s => s.id === currentStage)
    const next = STAGES[idx + 1]
    if (!next) return
    startTransition(async () => {
      await updateCibridoLeadStage(id, next.id)
      router.refresh()
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl lg:text-[28px] font-bold text-gray-900">Pipeline Comercial</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} no pipeline
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id)
          return (
            <div key={stage.id} className="flex-shrink-0 min-w-[280px] snap-start">

              {/* Header — estilo idêntico ao CRM KanbanBoard */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl"
                style={{ backgroundColor: `${stage.color}18` }}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-semibold text-gray-800 truncate flex-1">{stage.label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stageLeads.length}
                </span>
              </div>

              {/* Corpo da coluna */}
              <div className="min-h-[200px] rounded-b-xl p-2.5 bg-[#F1F3F5]">
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      className={cn(
                        'bg-white rounded-xl border p-4 transition-all duration-150',
                        'border-[#E2E5EA] shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                        'hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-[#C5CAD3]'
                      )}
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-2">{lead.name}</p>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2.5">
                        {lead.source && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                            {SOURCE_LABELS[lead.source] ?? lead.source}
                          </span>
                        )}
                        {stage.id !== 'cliente_ativo' && stage.id !== 'churned' && (
                          <button
                            onClick={() => handleAdvance(lead.id, lead.stage)}
                            disabled={isPending}
                            className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {stageLeads.length === 0 && (
                  <p className="text-xs text-gray-300 text-center pt-6">Vazio</p>
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
