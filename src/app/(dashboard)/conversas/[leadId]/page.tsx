import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { ChatClient } from '@/components/conversas/ChatClient'

export const metadata: Metadata = { title: 'Conversa' }

// Chat completo de um paciente — histórico + envio + realtime (novas
// mensagens entram sozinhas via Supabase Realtime, sem recarregar).

export default async function ConversaPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, phone')
    .eq('id', leadId)
    .maybeSingle()
  if (!lead) notFound()

  const { data: messages } = await supabase
    .from('conversations')
    .select('id, direction, content, created_at, status')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })
    .limit(500)

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <Link
          href="/conversas"
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          aria-label="Voltar para conversas"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{lead.name}</h1>
          <p className="text-xs text-muted-foreground">
            {lead.phone ?? 'sem telefone'} ·{' '}
            <Link href={`/leads/${lead.id}`} className="underline hover:text-foreground">
              ver ficha do paciente
            </Link>
          </p>
        </div>
      </div>

      <ChatClient leadId={lead.id} initialMessages={messages ?? []} />
    </div>
  )
}
