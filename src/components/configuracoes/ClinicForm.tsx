'use client'

import { useState, useTransition } from 'react'
import { Building2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClinic } from '@/lib/actions/clinic'
import { toast } from 'sonner'

interface ClinicFormProps {
  clinic: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
    plan: string
    created_at: string
  } | null
}

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial (10 dias grátis)',
  basic: 'Basic',
  pro:   'Pro',
}

export default function ClinicForm({ clinic }: ClinicFormProps) {
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name:    clinic?.name    ?? '',
    phone:   clinic?.phone   ?? '',
    email:   clinic?.email   ?? '',
    address: clinic?.address ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)

    startTransition(async () => {
      try {
        await updateClinic(form)
        toast.success('Configurações salvas!')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        toast.error('Erro ao salvar. Tente novamente.')
        setError('Erro ao salvar. Tente novamente.')
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Dados da Clínica</h2>
          <p className="text-xs text-gray-400">
            Plano atual: <span className="font-medium text-gray-600">{PLAN_LABELS[clinic?.plan ?? 'trial']}</span>
            {clinic?.created_at && (
              <> · Desde {new Date(clinic.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome da clínica *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Clínica Sorriso Perfeito"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email de contato</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="clinica@exemplo.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Rua, número, bairro, cidade - UF"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Salvando...
              </span>
            ) : 'Salvar alterações'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" /> Salvo com sucesso
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
