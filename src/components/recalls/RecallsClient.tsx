'use client'

// Tela principal do módulo de recall
// Lista ordenada por data, com badges de status e alertas visuais para recalls vencidos

import { useState } from 'react'
import { Plus, Phone, Calendar, AlertCircle, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecallWithLead, RecallStatus, Lead, User as UserType } from '@/types/database'
import { updateRecallStatus, deleteRecall } from '@/lib/actions/recalls'
import NovoRecallModal from '@/components/recalls/NovoRecallModal'

interface RecallsClientProps {
  recalls: RecallWithLead[]
  leads:   Pick<Lead, 'id' | 'name' | 'phone'>[]
  team:    Pick<UserType, 'id' | 'name'>[]
}

// Rótulos e cores dos status
const STATUS_CONFIG: Record<RecallStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendente',   color: '#92400E', bg: '#FEF3C7' },
  contacted: { label: 'Contactado', color: '#1E40AF', bg: '#DBEAFE' },
  scheduled: { label: 'Agendado',   color: '#065F46', bg: '#D1FAE5' },
  done:      { label: 'Concluído',  color: '#374151', bg: '#F3F4F6' },
  cancelled: { label: 'Cancelado',  color: '#9CA3AF', bg: '#F9FAFB' },
}

// Próximo status disponível (fluxo do ciclo de recall)
const NEXT_STATUS: Partial<Record<RecallStatus, RecallStatus>> = {
  pending:   'contacted',
  contacted: 'scheduled',
  scheduled: 'done',
}

// Filtros de status ativos por padrão (exclui concluídos e cancelados)
const FILTER_OPTIONS: { label: string; value: RecallStatus | 'all' }[] = [
  { label: 'Todos',       value: 'all' },
  { label: 'Pendentes',   value: 'pending' },
  { label: 'Contactados', value: 'contacted' },
  { label: 'Agendados',   value: 'scheduled' },
  { label: 'Concluídos',  value: 'done' },
  { label: 'Cancelados',  value: 'cancelled' },
]

// Retorna true se o recall já passou da data e ainda não foi resolvido
function isOverdue(recall: RecallWithLead): boolean {
  if (recall.status === 'done' || recall.status === 'cancelled') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date  = new Date(recall.recall_date + 'T00:00:00')
  return date < today
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function RecallsClient({ recalls, leads, team }: RecallsClientProps) {
  const [modalOpen,    setModalOpen]    = useState(false)
  const [statusFilter, setStatusFilter] = useState<RecallStatus | 'all'>('all')
  const [loadingId,    setLoadingId]    = useState<string | null>(null)

  // Aplica o filtro de status
  const filtered = statusFilter === 'all'
    ? recalls
    : recalls.filter((r) => r.status === statusFilter)

  // Conta alertas de recall vencido (só nos não resolvidos)
  const overdueCount = recalls.filter(isOverdue).length

  async function handleAdvanceStatus(recall: RecallWithLead) {
    const next = NEXT_STATUS[recall.status]
    if (!next) return
    setLoadingId(recall.id)
    try {
      await updateRecallStatus(recall.id, next)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleCancel(recallId: string) {
    setLoadingId(recallId)
    try {
      await updateRecallStatus(recallId, 'cancelled')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Recall de Pacientes</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">{recalls.length} recalls cadastrados</p>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                {overdueCount} vencido{overdueCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <Button className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Recall
        </Button>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.value === 'all'
            ? recalls.length
            : recalls.filter((r) => r.status === opt.value).length
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === opt.value
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={statusFilter === opt.value ? { backgroundColor: '#E91E7B' } : {}}
            >
              {opt.label}
              {count > 0 && (
                <span className="ml-1.5 opacity-75">({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de recalls */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum recall encontrado</p>
          <p className="text-gray-400 text-xs mt-1">
            {statusFilter === 'all'
              ? 'Clique em "Novo Recall" para cadastrar o primeiro.'
              : 'Tente outro filtro de status.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((recall) => {
            const overdue = isOverdue(recall)
            const cfg     = STATUS_CONFIG[recall.status]
            const next    = NEXT_STATUS[recall.status]
            const busy    = loadingId === recall.id

            return (
              <div
                key={recall.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                  overdue ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'
                }`}
              >
                {/* Alerta vencido */}
                {overdue && (
                  <div className="shrink-0 text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}

                {/* Dados do paciente */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{recall.lead.name}</p>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    {overdue && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-100">
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{recall.reason}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(recall.recall_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {recall.lead.phone}
                    </span>
                    {recall.assigned_user && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {recall.assigned_user.name}
                      </span>
                    )}
                  </div>
                  {recall.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">{recall.notes}</p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  {next && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1"
                      onClick={() => handleAdvanceStatus(recall)}
                      disabled={busy}
                    >
                      {busy ? '...' : STATUS_CONFIG[next].label}
                    </Button>
                  )}

                  {/* Dropdown cancelar / excluir */}
                  {recall.status !== 'done' && recall.status !== 'cancelled' && (
                    <div className="relative group">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        disabled={busy}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-36 hidden group-focus-within:block z-10">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                          onClick={() => handleCancel(recall.id)}
                        >
                          Marcar cancelado
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => deleteRecall(recall.id)}
                        >
                          Excluir recall
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NovoRecallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        leads={leads}
        team={team}
      />
    </div>
  )
}
