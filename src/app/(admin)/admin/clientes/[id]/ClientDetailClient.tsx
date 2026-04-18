'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, CalendarCheck, Clock, Phone, Mail, MapPin, Plus } from 'lucide-react'
import { toggleClientAccess, createAdminNote } from '@/lib/actions/admin'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trial:     { bg: '#fef9ec', text: '#92400e', label: 'Trial' },
  active:    { bg: '#f0fdf4', text: '#15803d', label: 'Ativo' },
  blocked:   { bg: '#fef2f2', text: '#dc2626', label: 'Bloqueado' },
  cancelled: { bg: '#f9fafb', text: '#6b7280', label: 'Cancelado' },
}
const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial', lite: 'Cibri-Lite', standard: 'Cibri-Standard', master: 'Cibri-Master',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClientDetailClient({ data, clinicId }: { data: any; clinicId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const { clinic, totalLeads, totalAppointments, notes } = data
  const sub    = clinic.subscriptions?.[0]
  const owner  = clinic.users?.find((u: { role: string }) => u.role === 'owner') ?? clinic.users?.[0]
  const status = sub?.status ?? (clinic.is_active ? 'active' : 'blocked')
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.cancelled

  function handleToggle() {
    startTransition(async () => {
      await toggleClientAccess(clinicId, !clinic.is_active)
      router.refresh()
    })
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      await createAdminNote(clinicId, noteText.trim())
      setNoteText('')
      router.refresh()
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.push('/admin/clientes')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
            {clinic.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              style={{
                fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                backgroundColor: statusStyle.bg, color: statusStyle.text,
              }}
            >
              {statusStyle.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, background: '#f3e8ff', color: '#7e22ce', padding: '3px 10px', borderRadius: 20 }}>
              {PLAN_LABELS[sub?.plan ?? 'trial']}
            </span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              Cliente desde {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 ${
            clinic.is_active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
          style={{ fontSize: 14 }}
        >
          {clinic.is_active ? 'Bloquear acesso' : 'Liberar acesso'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dados cadastrais */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Dados cadastrais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {owner && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Responsável</p>
                    <p style={{ fontSize: 15, color: '#111827', fontWeight: 500 }}>{owner.name}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>{owner.email}</p>
                  </div>
                </div>
              )}
              {clinic.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Telefone</p>
                    <p style={{ fontSize: 15, color: '#111827', fontWeight: 500 }}>{clinic.phone}</p>
                  </div>
                </div>
              )}
              {clinic.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Email</p>
                    <p style={{ fontSize: 15, color: '#111827', fontWeight: 500 }}>{clinic.email}</p>
                  </div>
                </div>
              )}
              {clinic.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Endereço</p>
                    <p style={{ fontSize: 15, color: '#111827', fontWeight: 500 }}>{clinic.address}</p>
                  </div>
                </div>
              )}
              {sub?.trial_ends_at && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Trial até</p>
                    <p style={{ fontSize: 15, color: '#111827', fontWeight: 500 }}>
                      {new Date(sub.trial_ends_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Anotações internas */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Anotações internas</h2>

            <div className="flex gap-2 mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex: Ricardo ligou em 20/04, cliente interessado em upgrade..."
                rows={2}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E91E7B] resize-none"
                style={{ fontSize: 14, color: '#374151' }}
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
                className="px-3 rounded-lg bg-[#E91E7B] text-white disabled:opacity-40 transition-opacity shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {notes.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Nenhuma anotação ainda.</p>
            ) : (
              <ol className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {notes.map((note: any) => (
                  <li key={note.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#E91E7B' }} />
                    <div>
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{note.content}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        {note.author_email} · {new Date(note.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Coluna lateral — métricas */}
        <div className="space-y-4">
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Uso do CRM</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf2f8' }}>
                  <Users className="w-5 h-5" style={{ color: '#E91E7B' }} />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{totalLeads}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Leads cadastrados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                  <CalendarCheck className="w-5 h-5" style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{totalAppointments}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Consultas agendadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                  <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{clinic.users?.length ?? 0}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Usuários na conta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plano */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Assinatura</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ fontSize: 13, color: '#6b7280' }}>Plano</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{PLAN_LABELS[sub?.plan ?? 'trial']}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: statusStyle.text }}>{statusStyle.label}</span>
              </div>
              {sub?.paid_until && (
                <div className="flex justify-between">
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Pago até</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {new Date(sub.paid_until).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
