'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Tag, User, MessageSquare, PhoneCall, CalendarPlus, StickyNote, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateLead, addLeadEvent } from '@/lib/actions/leads'
import AgendamentoForm from '@/components/leads/AgendamentoForm'
import { Lead, PipelineStage, LeadEvent } from '@/types/database'
import { cn } from '@/lib/utils'

const EVENT_ICONS: Record<string, React.ElementType> = {
  stage_change: Tag,
  note:         StickyNote,
  call:         PhoneCall,
  whatsapp:     MessageSquare,
  appointment:  CalendarPlus,
}

const EVENT_LABELS: Record<string, string> = {
  stage_change: 'Etapa alterada',
  note:         'Nota',
  call:         'Ligação',
  whatsapp:     'WhatsApp',
  appointment:  'Agendamento',
}

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Ativo',      style: 'bg-green-50 text-green-700' },
  { value: 'lost',      label: 'Perdido',    style: 'bg-red-50 text-red-700' },
  { value: 'converted', label: 'Convertido', style: 'bg-indigo-50 text-indigo-700' },
]

const ORIGENS = ['instagram','google','indicacao','facebook','whatsapp','outro']

interface LeadDetailClientProps {
  lead: Lead & {
    stage: PipelineStage | null
    assigned_user: { id: string; name: string } | null
  }
  stages: PipelineStage[]
  teamMembers: { id: string; name: string; role: string }[]
  events: (LeadEvent & { user: { id: string; name: string } | null })[]
}

export default function LeadDetailClient({ lead, stages, teamMembers, events }: LeadDetailClientProps) {
  const [isPending, startTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'call' | 'whatsapp'>('note')
  const [addingNote, setAddingNote] = useState(false)

  const [form, setForm] = useState({
    name:        lead.name,
    phone:       lead.phone,
    email:       lead.email ?? '',
    source:      lead.source ?? '',
    stage_id:    lead.stage_id ?? '',
    status:      lead.status,
    lost_reason: lead.lost_reason ?? '',
    notes:       lead.notes ?? '',
    assigned_to: lead.assigned_to ?? '',
  })

  function set(field: keyof typeof form, value: string | null) {
    setForm((p) => ({ ...p, [field]: value ?? '' }))
  }

  async function handleSave() {
    setSaving(true)
    startTransition(async () => {
      await updateLead(lead.id, {
        name:        form.name,
        phone:       form.phone,
        email:       form.email || null,
        source:      form.source || null,
        stage_id:    form.stage_id || null,
        status:      form.status,
        lost_reason: form.lost_reason || null,
        notes:       form.notes || null,
        assigned_to: form.assigned_to || null,
      })
      setSaving(false)
      setEditMode(false)
    })
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    setAddingNote(true)
    startTransition(async () => {
      await addLeadEvent(lead.id, lead.clinic_id, noteType, noteText.trim())
      setNoteText('')
      setAddingNote(false)
    })
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === (editMode ? form.status : lead.status))

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/leads" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Leads
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── COLUNA ESQUERDA: dados do lead ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Card principal */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                {editMode ? (
                  <Input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="text-lg font-semibold h-9 w-72"
                  />
                ) : (
                  <h1 className="text-lg font-semibold text-gray-900">{lead.name}</h1>
                )}
                <span className={cn('mt-1.5 inline-block text-xs font-medium px-2.5 py-1 rounded-full', currentStatus?.style)}>
                  {currentStatus?.label}
                </span>
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving || isPending}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>Editar</Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Telefone */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-gray-500">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </Label>
                {editMode ? (
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                ) : (
                  <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline font-medium">
                    {lead.phone}
                  </a>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-gray-500">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                {editMode ? (
                  <Input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="opcional" />
                ) : (
                  <span className="text-sm text-gray-700">{lead.email ?? '—'}</span>
                )}
              </div>

              {/* Origem */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> Origem
                </Label>
                {editMode ? (
                  <Select value={form.source} onValueChange={(v) => set('source', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-gray-700 capitalize">{lead.source ?? '—'}</span>
                )}
              </div>

              {/* Etapa */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-gray-500">
                  <Tag className="w-3.5 h-3.5" /> Etapa
                </Label>
                {editMode ? (
                  <Select value={form.stage_id} onValueChange={(v) => set('stage_id', v)}>
                    <SelectTrigger>
                      <span className="flex flex-1 text-left text-sm truncate">
                        {stages.find((s) => s.id === form.stage_id)?.name
                          ?? <span className="text-muted-foreground">Selecione</span>}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  lead.stage ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}>
                      {lead.stage.name}
                    </span>
                  ) : <span className="text-sm text-gray-400">Sem etapa</span>
                )}
              </div>

              {/* Status */}
              {editMode && (
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Responsável */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3.5 h-3.5" /> Responsável
                </Label>
                {editMode ? (
                  <Select value={form.assigned_to} onValueChange={(v) => set('assigned_to', v)}>
                    <SelectTrigger><SelectValue placeholder="Ninguém" /></SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-gray-700">{lead.assigned_user?.name ?? '—'}</span>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4 space-y-1.5">
              <Label className="text-gray-500">Observações</Label>
              {editMode ? (
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                  placeholder="Notas sobre este lead..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {lead.notes || <span className="text-gray-400">Nenhuma observação.</span>}
                </p>
              )}
            </div>
          </div>

          {/* Agendamento */}
          <AgendamentoForm leadId={lead.id} clinicId={lead.clinic_id} />

          {/* Ações rápidas */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Registrar atividade</p>
            <div className="flex gap-2 mb-3">
              {(['note', 'call', 'whatsapp'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNoteType(t)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                    noteType === t
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {t === 'note' && <StickyNote className="w-3.5 h-3.5" />}
                  {t === 'call' && <PhoneCall className="w-3.5 h-3.5" />}
                  {t === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                  {t === 'note' ? 'Nota' : t === 'call' ? 'Ligação' : 'WhatsApp'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={noteType === 'note' ? 'Escreva uma observação...' : noteType === 'call' ? 'Resumo da ligação...' : 'Resumo da conversa...'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1"
              />
              <Button onClick={handleAddNote} disabled={!noteText.trim() || addingNote || isPending} size="sm">
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA: timeline de eventos ── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Histórico</p>

          {events.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade registrada.</p>
          ) : (
            <ol className="relative border-l border-gray-100 space-y-4 ml-2">
              {events.map((ev) => {
                const Icon = EVENT_ICONS[ev.type] ?? StickyNote
                return (
                  <li key={ev.id} className="ml-4">
                    {/* Ícone na linha do tempo */}
                    <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-300" />
                    <div className="flex items-start gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500">{EVENT_LABELS[ev.type] ?? ev.type}</p>
                        {ev.description && (
                          <p className="text-sm text-gray-700 mt-0.5">{ev.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {ev.user?.name && <span>{ev.user.name} · </span>}
                          {new Date(ev.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
