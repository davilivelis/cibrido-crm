import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NotificationsClient from '@/components/configuracoes/NotificationsClient'
import { getNotificationRules, getNotificationLog } from '@/lib/actions/notifications'

export const metadata: Metadata = { title: 'Notificações automáticas' }

export default async function NotificacoesPage() {
  const supabase = await createClient()
  const { data: role } = await supabase.rpc('get_user_role')
  if (role !== 'owner') redirect('/dashboard')

  const [rules, log] = await Promise.all([getNotificationRules(), getNotificationLog()])

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Link href="/configuracoes" className="text-sm text-muted-foreground flex items-center gap-1 mb-2 hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Configurações
        </Link>
        <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Notificações automáticas</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          O CRM trabalha sozinho: confirmação, lembretes, aniversário, recall e mais — direto no WhatsApp do paciente.
        </p>
      </div>
      <NotificationsClient rules={rules} log={log} />
    </div>
  )
}
