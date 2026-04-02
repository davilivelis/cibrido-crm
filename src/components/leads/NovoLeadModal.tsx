'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createLead } from '@/lib/actions/leads'
import { PipelineStage } from '@/types/database'

const ORIGENS = [
  { value: 'instagram',  label: 'Instagram' },
  { value: 'google',     label: 'Google' },
  { value: 'indicacao',  label: 'Indicação' },
  { value: 'facebook',   label: 'Facebook' },
  { value: 'whatsapp',   label: 'WhatsApp direto' },
  { value: 'outro',      label: 'Outro' },
]

interface NovoLeadModalProps {
  open:     boolean
  onClose:  () => void
  stages:   PipelineStage[]
  clinicId: string   // mantido na interface por compatibilidade, mas não usado no insert
}

export default function NovoLeadModal({ open, onClose, stages }: NovoLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    name:     '',
    phone:    '',
    email:    '',
    source:   '',
    stage_id: stages[0]?.id ?? '',
    notes:    '',
  })

  function set(field: keyof typeof form, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value ?? '' }))
  }

  function reset() {
    setForm({ name: '', phone: '', email: '', source: '', stage_id: stages[0]?.id ?? '', notes: '' })
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim())  { setError('Nome é obrigatório.'); return }
    if (!form.phone.trim()) { setError('Telefone é obrigatório.'); return }

    setLoading(true)
    setError(null)

    try {
      await createLead({
        name:     form.name,
        phone:    form.phone,
        email:    form.email  || null,
        source:   form.source || null,
        stage_id: form.stage_id || null,
        notes:    form.notes  || null,
      })
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar o lead. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              autoFocus
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp *</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="opcional"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={form.source} onValueChange={(v) => set('source', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Etapa</Label>
              <Select value={form.stage_id} onValueChange={(v) => set('stage_id', v)}>
                <SelectTrigger>
                  <span className="flex flex-1 text-left text-sm truncate">
                    {stages.find((s) => s.id === form.stage_id)?.name
                      ?? <span className="text-muted-foreground">Selecione</span>}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              placeholder="Informações adicionais..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
