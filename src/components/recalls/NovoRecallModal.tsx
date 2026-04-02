'use client'

// Modal para criar um novo recall
// Campos: paciente (lead), data prevista, motivo, observações, responsável

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecall } from '@/lib/actions/recalls'
import { Lead, User } from '@/types/database'

interface NovoRecallModalProps {
  open:    boolean
  onClose: () => void
  leads:   Pick<Lead, 'id' | 'name' | 'phone'>[]
  team:    Pick<User, 'id' | 'name'>[]
}

export default function NovoRecallModal({ open, onClose, leads, team }: NovoRecallModalProps) {
  const [leadId,      setLeadId]      = useState('')
  const [recallDate,  setRecallDate]  = useState('')
  const [reason,      setReason]      = useState('')
  const [notes,       setNotes]       = useState('')
  const [assignedTo,  setAssignedTo]  = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  function resetForm() {
    setLeadId('')
    setRecallDate('')
    setReason('')
    setNotes('')
    setAssignedTo('')
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSave() {
    if (!leadId)     { setError('Selecione o paciente.'); return }
    if (!recallDate) { setError('Informe a data do recall.'); return }
    if (!reason.trim()) { setError('Informe o motivo do recall.'); return }

    setSaving(true)
    setError(null)
    try {
      await createRecall({
        lead_id:     leadId,
        recall_date: recallDate,
        reason:      reason.trim(),
        notes:       notes.trim() || undefined,
        assigned_to: assignedTo || null,
      })
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Recall</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Paciente */}
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione o paciente...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Data prevista */}
          <div className="space-y-1.5">
            <Label>Data prevista do retorno *</Label>
            <Input
              type="date"
              value={recallDate}
              onChange={(e) => setRecallDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label>Motivo *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Limpeza semestral, Revisão pós-procedimento..."
              className="h-10"
            />
          </div>

          {/* Responsável */}
          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sem responsável</option>
              {team.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas extras sobre este recall..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Criar Recall'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
