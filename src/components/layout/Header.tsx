'use client'

import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types/database'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  user: (User & { clinics?: { name: string } | null }) | null
}

const roleLabels: Record<string, string> = {
  owner:     'Proprietário',
  gestor:    'Gestor',
  atendente: 'Atendente',
}

export default function Header({ user }: HeaderProps) {
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Nome da clínica com pill dourado */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-foreground">
          {user?.clinics?.name ?? ''}
        </span>
        {user?.clinics?.name && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white hidden sm:inline-block"
            style={{ backgroundColor: '#F5A623' }}
          >
            CRM
          </span>
        )}
      </div>

      {/* Perfil */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 hover:opacity-80 transition-opacity outline-none">
          {/* Avatar magenta */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #BFFF00, #4d6b00)' }}
          >
            <span className="text-xs font-bold text-[#131500]">{initials}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-foreground leading-none" style={{ fontSize: '15px' }}>{user?.name}</p>
            <p className="text-muted-foreground/75 mt-0.5" style={{ fontSize: '13px' }}>{roleLabels[user?.role ?? ''] ?? ''}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground/75" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground/75 truncate">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push('/perfil')}
            className="cursor-pointer"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
