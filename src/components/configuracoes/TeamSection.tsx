'use client'

import { useState, useTransition } from 'react'
import { Users, Plus, CheckCircle, Shield, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inviteUser } from '@/lib/actions/clinic'
import { cn } from '@/lib/utils'

const ROLE_CONFIG: Record<string, { label: string; desc: string; icon: React.ElementType; style: string }> = {
  owner:     { label: 'Proprietário', desc: 'Acesso total + configurações',   icon: Shield,    style: 'bg-indigo-50 text-indigo-700' },
  gestor:    { label: 'Gestor',       desc: 'Leads, pipeline e tráfego pago', icon: UserCheck, style: 'bg-violet-50 text-violet-700' },
  atendente: { label: 'Atendente',    desc: 'Leads e pipeline',               icon: Users,     style: 'bg-blue-50 text-blue-700' },
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface TeamSectionProps {
  team: TeamMember[]
  clinicPlan: string
}

export default function TeamSection({ team, clinicPlan }: TeamSectionProps) {
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', role: 'atendente' })

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    startTransition(async () => {
      try {
        const result = await inviteUser(form)
        if (result?.error) {
          setError(result.error)
        } else {
          setForm({ name: '', email: '', role: 'atendente' })
          setShowForm(false)
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao convidar. Tente novamente.'
        setError(msg)
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Equipe</h2>
            <p className="text-xs text-gray-400">{team.length} membro{team.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="w-3.5 h-3.5" />
          Convidar
        </Button>
      </div>

      {/* Formulário de convite */}
      {showForm && (
        <form onSubmit={handleInvite} className="mb-5 p-4 bg-gray-50 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Novo membro</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nome completo" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@exemplo.com" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Função</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v ?? 'atendente')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atendente">Atendente — leads e pipeline</SelectItem>
                <SelectItem value="gestor">Gestor — + tráfego pago</SelectItem>
                <SelectItem value="owner">Proprietário — acesso total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Convidando...' : 'Enviar convite'}
            </Button>
          </div>
        </form>
      )}

      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium mb-4">
          <CheckCircle className="w-4 h-4" /> Usuário criado com sucesso
        </p>
      )}

      {/* Lista de membros */}
      <div className="space-y-2">
        {team.map((member) => {
          const config = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.atendente!
          const Icon = config.icon
          return (
            <div key={member.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-indigo-700">
                  {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              <span className={cn('flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0', config.style)}>
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
