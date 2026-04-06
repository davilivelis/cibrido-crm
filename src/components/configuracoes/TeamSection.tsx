'use client'

import { Users, Shield, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface TeamSectionProps {
  team: TeamMember[]
  clinicPlan: string
}

export default function TeamSection({ team }: TeamSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
          <Users className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Equipe</h2>
          <p className="text-xs text-gray-400">{team.length} membro{team.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Convite de equipe — disponível na V2 */}
      <div className="mb-5 p-4 bg-gray-50 rounded-xl text-center">
        <p className="text-gray-500 text-sm font-medium">Gerenciamento de equipe estará disponível em breve.</p>
        <p className="text-gray-400 text-xs mt-1">Na próxima atualização você poderá convidar membros da sua equipe.</p>
      </div>

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
