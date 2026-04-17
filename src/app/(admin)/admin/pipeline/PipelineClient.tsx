'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCibridoLeadStage } from '@/lib/actions/admin'

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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Pipeline Comercial</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginTop: 4 }}>Acompanhe o avanço dos leads Cíbrido</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id)
          return (
            <div key={stage.id} className="w-52 shrink-0">
              <div className="flex justify-between items-center px-3 py-2.5 rounded-t-lg"
                style={{ backgroundColor: `${stage.color}18`, color: stage.color }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stage.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{stageLeads.length}</span>
              </div>
              <div className="rounded-b-lg p-2 min-h-[300px] space-y-2" style={{ background: '#F8F9FB' }}>
                {stageLeads.length === 0 && (
                  <p className="text-center pt-8" style={{ fontSize: 13, color: '#d1d5db' }}>Vazio</p>
                )}
                {stageLeads.map(lead => (
                  <div key={lead.id} className="bg-white rounded-lg p-3 border-l-4"
                    style={{ borderColor: stage.color, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{lead.name}</p>
                    {lead.clinic_name && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{lead.clinic_name}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{SOURCE_LABELS[lead.source] ?? lead.source ?? '—'}</span>
                      {stage.id !== 'cliente_ativo' && stage.id !== 'churned' && (
                        <button onClick={() => handleAdvance(lead.id, lead.stage)} disabled={isPending}
                          className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px' }}>
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
