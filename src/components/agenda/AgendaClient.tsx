'use client'

// Componente interativo da Agenda
// Permite atualizar o status de cada consulta direto da lista

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Clock, ChevronDown, CheckCircle, XCircle, Ban } from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { AppointmentStatus } from '@/types/database'

// Dados de exibição por status
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  scheduled:  { label: 'Agendada',    color: 'bg-blue-50 text-blue-700' },
  confirmed:  { label: 'Confirmada',  color: 'bg-indigo-50 text-indigo-700' },
  attended:   { label: 'Compareceu',  color: 'bg-green-50 text-green-700' },
  no_show:    { label: 'Não veio',    color: 'bg-red-50 text-red-700' },
  cancelled:  { label: 'Cancelada',   color: 'bg-gray-50 text-gray-500' },
}

// Ações disponíveis por status atual
const STATUS_ACTIONS: Partial<Record<AppointmentStatus, { label: string; next: AppointmentStatus; icon: React.ElementType; danger?: boolean }[]>> = {
  scheduled: [
    { label: 'Confirmar presença', next: 'confirmed', icon: CheckCircle },
    { label: 'Marcar cancelada',   next: 'cancelled', icon: Ban, danger: true },
  ],
  confirmed: [
    { label: 'Compareceu',   next: 'attended', icon: CheckCircle },
    { label: 'Não veio',     next: 'no_show',  icon: XCircle, danger: true },
    { label: 'Cancelada',    next: 'cancelled', icon: Ban, danger: true },
  ],
}

interface Appt {
  id: string
  scheduled_at: string
  duration_min: number
  title: string
  status: AppointmentStatus
  notes: string | null
  lead: { id: string; name: string; phone: string } | null
}

interface AgendaClientProps {
  byDay: { dayKey: string; dayLabel: string; appts: Appt[] }[]
  total: number
}

export default function AgendaClient({ byDay, total }: AgendaClientProps) {
  // Rastreia status local de cada consulta (para atualização otimista)
  const [statusMap, setStatusMap]     = useState<Record<string, AppointmentStatus>>({})
  const [loadingId, setLoadingId]     = useState<string | null>(null)
  const [openMenu,  setOpenMenu]      = useState<string | null>(null)

  function getStatus(appt: Appt): AppointmentStatus {
    return statusMap[appt.id] ?? appt.status
  }

  async function handleAction(apptId: string, next: AppointmentStatus) {
    // Atualiza localmente primeiro (otimista)
    setStatusMap((prev) => ({ ...prev, [apptId]: next }))
    setOpenMenu(null)
    setLoadingId(apptId)
    try {
      await updateAppointmentStatus(apptId, next)
    } catch {
      // Reverte em caso de erro
      setStatusMap((prev) => { const c = { ...prev }; delete c[apptId]; return c })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Agenda</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>{total} consulta{total !== 1 ? 's' : ''} nos próximos dias</p>
      </div>

      {byDay.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-violet-500" />
          </div>
          <p className="font-medium text-gray-700">Nenhuma consulta agendada</p>
          <p className="text-sm text-gray-400">
            Consultas são criadas dentro do cadastro de cada lead.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {byDay.map(({ dayKey, dayLabel, appts }) => (
            <div key={dayKey}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 capitalize">
                {dayLabel}
              </h2>
              <div className="space-y-2">
                {appts.map((appt) => {
                  const status  = getStatus(appt)
                  const cfg     = STATUS_CONFIG[status]
                  const actions = STATUS_ACTIONS[status] ?? []
                  const busy    = loadingId === appt.id

                  return (
                    <div
                      key={appt.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      {/* Horário */}
                      <div className="shrink-0 text-center w-14">
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{appt.duration_min}min</span>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-gray-100 shrink-0" />

                      {/* Dados do lead */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {appt.lead ? (
                            <Link
                              href={`/leads/${appt.lead.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-[#E91E7B] transition-colors"
                            >
                              {appt.lead.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">—</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {appt.title}
                          {appt.lead?.phone && ` · ${appt.lead.phone}`}
                        </p>
                        {appt.notes && (
                          <p className="text-xs text-gray-400 italic mt-0.5 truncate">{appt.notes}</p>
                        )}
                      </div>

                      {/* Badge de status */}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>

                      {/* Menu de ações (só para status acionáveis) */}
                      {actions.length > 0 && (
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {openMenu === appt.id && (
                            <>
                              {/* Overlay para fechar */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 z-20">
                                {actions.map((action) => {
                                  const Icon = action.icon
                                  return (
                                    <button
                                      key={action.next}
                                      type="button"
                                      onClick={() => handleAction(appt.id, action.next)}
                                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors ${
                                        action.danger
                                          ? 'text-red-600 hover:bg-red-50'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                      {action.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
