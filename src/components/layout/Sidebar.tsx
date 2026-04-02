'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, KanbanSquare, MessageSquare,
  CalendarDays, BarChart3, Settings, RotateCcw,
} from 'lucide-react'
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
  { label: 'Configurações', href: '/configuracoes', icon: Settings, roles: ['owner'] },
]

export default function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  function navClass(href: string) {
    return cn(
      'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-150',
      'text-[15px]',
      isActive(href)
        ? 'bg-[#E91E7B] text-white shadow-sm shadow-[#E91E7B]/30'
        : 'text-slate-300 hover:bg-white/8 hover:text-white'
    )
  }

  return (
    <aside className="w-60 flex flex-col" style={{ backgroundColor: '#1E2A3A' }}>

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="CibridoCRM"
            width={120}
            height={40}
            style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
            priority
          />
          <span className="text-white font-bold text-sm leading-none" translate="no">CibridoCRM</span>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={navClass(item.href)} translate="no">
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
      </nav>

      {/* Rodapé — configurações */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/8 pt-3">
        {bottomItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={navClass(item.href)} translate="no">
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
      </div>
    </aside>
  )
}
