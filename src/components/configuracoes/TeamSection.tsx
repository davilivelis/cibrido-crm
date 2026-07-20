'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users, Shield, UserCheck, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inviteUser } from '@/lib/actions/clinic'

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; style: string }> = {
  owner:     { label: 'Proprietário', icon: Shield,    style: 'bg-indigo-50 text-indigo-700' },
  gestor:    { label: 'Gestor',       icon: UserCheck, style: 'bg-violet-50 text-violet-700' },
  atendente: { label: 'Atendente',    icon: Users,     style: 'bg-blue-50 text-blue-700' },
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export default function TeamSection({ team, seatLimit }: { team: TeamMember[]; seatLimit: number }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('atendente')
  const [pending, startTransition] = useTransition()

  const used = team.length
  const full = used >= seatLimit

  function invite() {
    if (!email.trim() || !name.trim()) {
      toast.error('Preencha nome e email do membro')
      return
    }
    startTransition(async () => {
      const res = await inviteUser({ email: email.trim(), name: name.trim(), role })
      if (res.success) {
        toast.success('Membro adicionado! Ele entra com o email e cria a senha em “Esqueci a senha”.')
        setEmail('')
        setName('')
        router.refresh()
      } else {
        toast.error(res.error ?? 'Erro ao convidar')
      }
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
          <Users className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Equipe</h2>
          <p className="text-xs text-muted-foreground">
            {used} de {seatLimit} assento{seatLimit !== 1 ? 's' : ''} usado{used !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {full ? (
        <div className="mb-5 p-4 bg-muted/60 rounded-xl text-center">
          <p className="text-foreground text-sm font-medium">Você atingiu o limite de {seatLimit} membros do seu plano.</p>
          <p className="text-muted-foreground text-xs mt-1">Fale com o suporte pra liberar mais assentos.</p>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-muted/40 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Adicionar membro
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email@exemplo.com"
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm flex-1"
            >
              <option value="atendente">Atendente</option>
              <option value="gestor">Gestor</option>
            </select>
            <button
              onClick={invite}
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pending ? 'Adicionando…' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de membros */}
      <div className="space-y-2">
        {team.map((member) => {
          const config = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.atendente!
          const Icon = config.icon
          return (
            <div key={member.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-indigo-700">
                  {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
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
