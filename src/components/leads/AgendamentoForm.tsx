'use client'

import { useState, useTransition } from 'react'
import { CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAppointment } from '@/lib/actions/appointments'

interface AgendamentoFormProps {
  leadId: string
  clinicId: string
}

// Formata a data/hora atual + 1 dia como valor padrão do input
function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  // datetime-local espera "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16)
}

export default function AgendamentoForm({ leadId, clinicId }: AgendamentoFormProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [, startTransition] = useTransition()

  const [form, setForm] = useState({
    title:       'Consulta',
    scheduledAt: defaultDateTime(),
    durationMin: '60',
    notes:       '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    startTransition(async () => {
      await createAppointment({
        leadId,
        clinicId,
        title:       form.title,
        scheduledAt: form.scheduledAt,
        durationMin: Number(form.durationMin),
        notes:       form.notes,
      })
      setSaving(false)
      setSuccess(true)
      setOpen(false)
      // Reseta após 2 segundos
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <CalendarPlus className="w-4 h-4 text-violet-500" />
          Agendar Consulta
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Feedback de sucesso */}
      {success && (
        <p className="px-4 pb-3 text-sm text-green-600 font-medium">
          ✓ Consulta agendada com sucesso!
        </p>
      )}

      {/* Formulário expansível */}
      {open && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {/* Título */}
          <div className="space-y-1.5">
            <Label>Tipo de consulta</Label>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ex: Avaliação, Limpeza, Retorno..."
            />
          </div>

          {/* Data e hora */}
          <div className="space-y-1.5">
            <Label>Data e hora</Label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => set('scheduledAt', e.target.value)}
              required
            />
          </div>

          {/* Duração */}
          <div className="space-y-1.5">
            <Label>Duração</Label>
            <Select value={form.durationMin} onValueChange={(v) => set('durationMin', v ?? '60')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Opcional..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Agendando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
