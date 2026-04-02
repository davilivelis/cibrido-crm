'use client'

// Modal Trello — centralizado, com abas e ações rápidas
// Abre ao clicar em qualquer card do Pipeline

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  X, Phone, MessageCircle, CalendarPlus, StickyNote,
  ArrowUpRight, PhoneCall, MessageSquare, CheckCircle,
  Clock, RotateCcw, ChevronDown,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { updateLead, addLeadEvent } from '@/lib/actions/leads'
import { createAppointment } from '@/lib/actions/appointments'
import { Lead, LeadStatus, PipelineStage } from '@/types/database'
import { cn } from '@/lib/utils'

// ─── Tipos locais ───────────────────────────────────────────────
interface LeadEvent {
  id: string; type: string; description: string | null; created_at: string
}
interface RecallRow {
  id: string; recall_date: string; reason: string; status: string
}

// ─── Configs visuais ────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'active',    label: 'Ativo',      cls: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'lost',      label: 'Perdido',    cls: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'converted', label: 'Convertido', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]
const NOTE_TYPES = [
  { value: 'note',     label: 'Nota',     icon: StickyNote },
  { value: 'call',     label: 'Ligação',  icon: PhoneCall },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
]
const EVENT_ICONS: Record<string, React.ElementType> = {
  stage_change: ChevronDown,
  note:         StickyNote,
  call:         PhoneCall,
  whatsapp:     MessageSquare,
  appointment:  CalendarPlus,
}
const RECALL_STATUS_LABELS: Record<string, string> = {
  pending:   'Pendente', contacted: 'Contactado',
  scheduled: 'Agendado', done: 'Concluído', cancelled: 'Cancelado',
}

// ─── Props ──────────────────────────────────────────────────────
interface LeadCardModalProps {
  lead: Lead
  stages: PipelineStage[]
  onClose: () => void
  onStageChange: (leadId: string, stageId: string | null) => void
}

// ─── Componente principal ───────────────────────────────────────
export default function LeadCardModal({ lead, stages, onClose, onStageChange }: LeadCardModalProps) {
  const supabase = createClient()
  const [, startTransition] = useTransition()

  // ── Estado geral ─────────────────────────────────────────────
  const [tab,            setTab]            = useState<'dados' | 'historico' | 'recall'>('dados')
  const [stageId,        setStageId]        = useState(lead.stage_id ?? '')
  const [status,         setStatus]         = useState<LeadStatus>(lead.status)
  const [noteType,       setNoteType]       = useState('note')
  const [noteText,       setNoteText]       = useState('')
  const [noteSaving,     setNoteSaving]     = useState(false)
  const [noteSaved,      setNoteSaved]      = useState(false)
  const [showSchedule,   setShowSchedule]   = useState(false)

  // ── Agenda rápida ─────────────────────────────────────────────
  const [schedTitle,     setSchedTitle]     = useState('Consulta')
  const [schedAt,        setSchedAt]        = useState('')
  const [schedDur,       setSchedDur]       = useState('60')
  const [schedNotes,     setSchedNotes]     = useState('')
  const [schedSaving,    setSchedSaving]    = useState(false)
  const [schedDone,      setSchedDone]      = useState(false)

  // ── Dados carregados ──────────────────────────────────────────
  const [events,         setEvents]         = useState<LeadEvent[]>([])
  const [recalls,        setRecalls]        = useState<RecallRow[]>([])
  const [loadingData,    setLoadingData]    = useState(true)

  // Carrega eventos e recalls ao abrir
  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      supabase
        .from('lead_events')
        .select('id, type, description, created_at')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('recalls')
        .select('id, recall_date, reason, status')
        .eq('lead_id', lead.id)
        .order('recall_date', { ascending: true }),
    ]).then(([evR, reR]) => {
      setEvents(evR.data ?? [])
      setRecalls(reR.data ?? [])
      setLoadingData(false)
    })
  }, [lead.id])

  // ── Handlers ─────────────────────────────────────────────────
  function handleStageChange(newId: string | null) {
    setStageId(newId ?? '')
    onStageChange(lead.id, newId || null)
    startTransition(async () => {
      await updateLead(lead.id, { stage_id: newId || null })
    })
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus as LeadStatus)
    startTransition(async () => {
      await updateLead(lead.id, { status: newStatus })
    })
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    setNoteSaving(true)
    try {
      await addLeadEvent(lead.id, lead.clinic_id, noteType, noteText.trim())
      const newEvent: LeadEvent = {
        id: Date.now().toString(),
        type: noteType,
        description: noteText.trim(),
        created_at: new Date().toISOString(),
      }
      setEvents((prev) => [newEvent, ...prev])
      setNoteText('')
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 2000)
    } finally {
      setNoteSaving(false)
    }
  }

  async function handleSchedule() {
    if (!schedAt) return
    setSchedSaving(true)
    try {
      await createAppointment({
        leadId:      lead.id,
        clinicId:    lead.clinic_id,
        title:       schedTitle,
        scheduledAt: schedAt,
        durationMin: parseInt(schedDur),
        notes:       schedNotes,
      })
      setSchedDone(true)
      setShowSchedule(false)
      setTimeout(() => setSchedDone(false), 3000)
    } finally {
      setSchedSaving(false)
    }
  }

  const currentStage = stages.find((s) => s.id === stageId)
  const statusCfg    = STATUS_OPTIONS.find((s) => s.value === status)
  const phone        = lead.phone.replace(/\D/g, '')

  // ─── UI ────────────────────────────────────────────────────────
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 flex flex-col gap-0 overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* ── Cabeçalho ── */}
        <div className="flex items-start gap-4 p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', statusCfg?.cls)}>
                {statusCfg?.label}
              </span>
              {currentStage && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${currentStage.color}20`, color: currentStage.color }}
                >
                  {currentStage.name}
                </span>
              )}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`https://wa.me/55${phone}`}
              target="_blank" rel="noreferrer"
              title="Abrir WhatsApp"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={`tel:${lead.phone}`}
              title="Ligar"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              type="button"
              title="Agendar consulta"
              onClick={() => { setShowSchedule((v) => !v); setTab('dados') }}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
                showSchedule ? 'bg-[#E91E7B] text-white' : 'bg-pink-50 text-[#E91E7B] hover:bg-pink-100'
              )}
            >
              <CalendarPlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Agenda rápida (aparece ao clicar no botão de calendário) ── */}
        {showSchedule && (
          <div className="px-5 py-3 border-b border-gray-100 bg-pink-50/40 space-y-3">
            <p className="text-xs font-semibold text-[#E91E7B] uppercase tracking-wide">Agendar consulta rápida</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Título"
                value={schedTitle}
                onChange={(e) => setSchedTitle(e.target.value)}
                className="h-9 text-sm bg-white"
              />
              <select
                value={schedDur}
                onChange={(e) => setSchedDur(e.target.value)}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
              >
                {[30,45,60,90,120].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
            <Input
              type="datetime-local"
              value={schedAt}
              onChange={(e) => setSchedAt(e.target.value)}
              className="h-9 text-sm bg-white"
            />
            {schedDone && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Consulta agendada!
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={handleSchedule} disabled={schedSaving || !schedAt}>
                {schedSaving ? 'Agendando...' : 'Confirmar'}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowSchedule(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* ── Abas ── */}
        <div className="flex border-b border-gray-100 px-5 bg-white">
          {(['dados', 'historico', 'recall'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'py-3 px-1 mr-5 text-sm font-medium border-b-2 transition-colors capitalize',
                tab === t
                  ? 'border-[#E91E7B] text-[#E91E7B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'dados' ? 'Dados' : t === 'historico' ? 'Histórico' : 'Recall'}
              {t === 'recall' && recalls.length > 0 && (
                <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                  {recalls.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Corpo scrollável ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── ABA: DADOS ── */}
          {tab === 'dados' && (
            <div className="p-5 space-y-5">

              {/* Contato */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contato</p>
                <div className="text-sm text-gray-700 font-medium">{lead.phone}</div>
                {lead.email && <div className="text-sm text-gray-500">{lead.email}</div>}
                {lead.source && (
                  <div className="text-sm text-gray-400 capitalize">Origem: {lead.source}</div>
                )}
              </div>

              {/* Mover para etapa */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Etapa do funil</p>
                <Select value={stageId} onValueChange={handleStageChange}>
                  <SelectTrigger className="h-9">
                    <span className="flex flex-1 items-center gap-2 text-sm truncate">
                      {(() => {
                        const s = stages.find((s) => s.id === stageId)
                        return s
                          ? <><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />{s.name}</>
                          : <span className="text-muted-foreground">Selecione a etapa</span>
                      })()}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={cn(
                        'flex-1 text-xs font-medium py-1.5 rounded-lg border transition-all',
                        status === s.value ? s.cls : 'border-gray-100 text-gray-400 hover:bg-gray-50'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {lead.notes && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Observações</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {/* Registrar atividade */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registrar atividade</p>
                <div className="flex gap-1.5">
                  {NOTE_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setNoteType(value)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors',
                        noteType === value
                          ? 'bg-pink-50 border-pink-200 text-[#E91E7B]'
                          : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Escreva aqui..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button size="sm" className="h-9" onClick={handleAddNote} disabled={!noteText.trim() || noteSaving}>
                    {noteSaving ? '...' : 'OK'}
                  </Button>
                </div>
                {noteSaved && <p className="text-xs text-green-600 font-medium">✓ Salvo</p>}
              </div>

              {/* UTMs */}
              {(lead.utm_source || lead.utm_campaign) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Campanha</p>
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1 font-mono">
                    {lead.utm_source   && <p>source: {lead.utm_source}</p>}
                    {lead.utm_medium   && <p>medium: {lead.utm_medium}</p>}
                    {lead.utm_campaign && <p>campaign: {lead.utm_campaign}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ABA: HISTÓRICO ── */}
          {tab === 'historico' && (
            <div className="p-5">
              {loadingData ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {events.map((ev) => {
                    const Icon = EVENT_ICONS[ev.type] ?? StickyNote
                    return (
                      <div key={ev.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{ev.description ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(ev.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ABA: RECALL ── */}
          {tab === 'recall' && (
            <div className="p-5">
              {loadingData ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
                </div>
              ) : recalls.length === 0 ? (
                <div className="text-center py-10">
                  <RotateCcw className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nenhum recall cadastrado para este paciente</p>
                  <Link
                    href="/recalls"
                    className="text-xs text-[#E91E7B] hover:underline mt-1 inline-block"
                    onClick={onClose}
                  >
                    Ir para módulo de Recall →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recalls.map((r) => {
                    const overdue = r.status !== 'done' && r.status !== 'cancelled'
                      && new Date(r.recall_date + 'T00:00:00') < new Date()
                    return (
                      <div
                        key={r.id}
                        className={cn(
                          'rounded-xl border p-3 flex items-center justify-between gap-3',
                          overdue ? 'border-amber-300 bg-amber-50/40' : 'border-gray-100'
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800">{r.reason}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(r.recall_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            {overdue && <span className="ml-2 text-amber-600 font-semibold">• Vencido</span>}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0 font-medium">
                          {RECALL_STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </div>
                    )
                  })}
                  <Link
                    href="/recalls"
                    className="text-xs text-[#E91E7B] hover:underline mt-2 inline-block"
                    onClick={onClose}
                  >
                    Gerenciar recalls →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Rodapé ── */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex items-center justify-between gap-3">
          {schedDone && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Consulta agendada!
            </p>
          )}
          <div className="ml-auto">
            <Link href={`/leads/${lead.id}`} onClick={onClose}>
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <ArrowUpRight className="w-4 h-4" />
                Ver ficha completa
              </Button>
            </Link>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
