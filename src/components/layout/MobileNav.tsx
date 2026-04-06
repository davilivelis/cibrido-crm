'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Users, KanbanSquare, MessageSquare,
  CalendarDays, BarChart3, Settings, RotateCcw, LogOut, UserCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard, roles: ['owner','gestor','atendente'] },
  { label: 'Leads',        href: '/leads',        icon: Users,           roles: ['owner','gestor','atendente'] },
  { label: 'Pipeline',     href: '/pipeline',     icon: KanbanSquare,    roles: ['owner','gestor','atendente'] },
  { label: 'Conversas',    href: '/conversas',    icon: MessageSquare,   roles: ['owner','gestor','atendente'] },
  { label: 'Agenda',       href: '/agenda',       icon: CalendarDays,    roles: ['owner','gestor','atendente'] },
  { label: 'Tráfego Pago', href: '/trafego',      icon: BarChart3,       roles: ['owner','gestor'] },
  { label: 'Recall',       href: '/recalls',      icon: RotateCcw,       roles: ['owner','gestor','atendente'] },
]

const bottomItems: NavItem[] = [
  { label: 'Configurações', href: '/configuracoes', icon: Settings,    roles: ['owner'] },
  { label: 'Meu Perfil',    href: '/perfil',         icon: UserCircle,  roles: ['owner','gestor','atendente'] },
]

interface MobileNavProps {
  userRole: UserRole
  userName: string
  userInitials: string
  clinicName: string
}

export default function MobileNav({ userRole, userName, userInitials, clinicName }: MobileNavProps) {
  const [open, setOpen]  = useState(false)
  const pathname         = usePathname()
  const router           = useRouter()
  const supabase         = createClient()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleNav() {
    setOpen(false)
  }

  return (
    <>
      {/* Top bar — só mobile (lg:hidden) */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/10"
        style={{ backgroundColor: '#1E2A3A' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, overflow: 'hidden', flexShrink: 0, borderRadius: 4 }}>
            <img src="/logo.png" alt="CibridoCRM" style={{ width: '28px', height: 'auto', display: 'block' }} />
          </div>
          <span className="text-white font-bold text-sm" translate="no">CibridoCRM</span>
        </div>

        {/* Direita: nome clínica + hamburguer */}
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs truncate max-w-[100px]">{clinicName}</span>
          <button
            onClick={() => setOpen(true)}
            className="text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Overlay escuro */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#1E2A3A' }}
      >
        {/* Cabeçalho do drawer */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #E91E7B, #7B2D8E)' }}
            >
              <span className="text-[11px] font-bold text-white">{userInitials}</span>
            </div>
            <div className="leading-none">
              <p className="text-white text-sm font-semibold truncate max-w-[160px]">{userName}</p>
              <p className="text-white/50 text-xs">{clinicName}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNav}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-150 text-[15px]',
                    isActive(item.href)
                      ? 'bg-[#E91E7B] text-white shadow-sm shadow-[#E91E7B]/30'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  )}
                  translate="no"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
        </nav>

        {/* Rodapé: configurações + sair */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-3 shrink-0">
          {bottomItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNav}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-150 text-[15px]',
                    isActive(item.href)
                      ? 'bg-[#E91E7B] text-white shadow-sm shadow-[#E91E7B]/30'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  )}
                  translate="no"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-[15px] text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
