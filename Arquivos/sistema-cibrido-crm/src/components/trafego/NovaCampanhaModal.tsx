'use client'

// Modal para cadastrar nova campanha de tráfego pago

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCampaign } from '@/lib/actions/campaigns'

interface NovaCampanhaModalProps {
  open:    boolean
  onClose: () => void
}

const PLATFORMS = [
  { value: 'meta',   label: 'Meta (Facebook/Instagram)' },
  { value: 'google', label: 'Google Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
]

export default function NovaCampanhaModal({ open, onClose }: NovaCampanhaModalProps) {
  const [name,     setName]     = useState('')
  const [platform, setPlatform] = useState<'meta' | 'google' | 'tiktok'>('meta')
  const [budget,   setBudget]   = useState('')
  const [startDate, setStartDate] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  function reset() {
    setName('')
    setPlatform('meta')
    setBudget('')
    setStartDate('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSave() {
    if (!name.trim()) { setError('Informe o nome da campanha.'); return }

    setSaving(true)
    setError(null)
    try {
      await createCampaign({
        name,
        platform,
        budget_monthly: budget ? parseFloat(budget.replace(',', '.')) : null,
        started_at:     startDate || null,
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
          <DialogTitle>Nova Campanha</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div className="space-y-1.5">
            <Label>Nome da campanha *</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Limpeza Janeiro - Meta"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Plataforma *</Label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as typeof platform)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Verba mensal (R$)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex: 1500"
              className="h-10"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data de início</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10"
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
              {saving ? 'Salvando...' : 'Criar Campanha'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
