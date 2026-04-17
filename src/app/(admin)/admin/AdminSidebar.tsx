'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Mail, TrendingUp, PhoneCall, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/clientes',  label: 'Clientes',           icon: Building2   },
  { href: '/admin/convites',  label: 'Convites',           icon: Mail        },
  { href: '/admin/pipeline',  label: 'Pipeline Comercial', icon: TrendingUp  },
  { href: '/admin/calls',     label: 'Calls',              icon: PhoneCall   },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function navClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + '/')
    return cn(
      'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-150 text-[15px]',
      active
        ? 'bg-[#E91E7B] text-white shadow-sm shadow-[#E91E7B]/30'
        : 'text-slate-300 hover:bg-white/8 hover:text-white'
    )
  }

  return (
    <aside className="w-60 hidden lg:flex flex-col shrink-0" style={{ backgroundColor: '#1E2A3A' }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0, borderRadius: 6 }}>
            <img
              src="/logo.png"
              alt="Cíbrido"
              style={{ width: '36px', height: 'auto', display: 'block', objectPosition: 'top' }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-white font-bold text-sm leading-none block" translate="no">CibridoCRM</span>
            <span className="text-[11px] text-slate-500 leading-none mt-[2px] block">Painel Admin</span>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={navClass(href)} translate="no">
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.08]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Voltar ao CRM
        </Link>
      </div>
    </aside>
  )
}
