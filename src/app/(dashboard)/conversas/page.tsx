import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Conversas' }

// Caixa de entrada: uma linha por paciente, com a última mensagem.
// Clique abre o chat completo em /conversas/[leadId].

interface ConvRow {
  id: string
  lead_id: string
  direction: string
  content: string
  created_at: string
  lead: { id: string; name: string; phone: string | null } | null
}

function fmtWhen(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000)
  const today = new Date(Date.now() - 3 * 3600_000)
  const sameDay = d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
  if (sameDay) return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function ConversasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('conversations')
    .select(`id, lead_id, direction, content, created_at, lead:leads(id, name, phone)`)
    .order('created_at', { ascending: false })
    .limit(300)

  // Agrupa por lead mantendo só a mensagem mais recente (a query já vem ordenada)
  const byLead = new Map<string, { last: ConvRow; count: number }>()
  for (const conv of (data ?? []) as unknown as ConvRow[]) {
    const entry = byLead.get(conv.lead_id)
    if (entry) entry.count++
    else byLead.set(conv.lead_id, { last: conv, count: 1 })
  }
  const threads = [...byLead.values()]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Conversas</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          WhatsApp ao vivo — cada mensagem recebida aparece aqui sozinha
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 lg:p-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-strong" />
          </div>
          <p className="font-medium text-foreground">Nenhuma conversa ainda</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Quando um paciente mandar mensagem no WhatsApp da clínica, a conversa nasce aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {threads.map(({ last, count }) => (
            <Link
              key={last.lead_id}
              href={`/conversas/${last.lead_id}`}
              className="flex items-start gap-4 px-4 py-3 hover:bg-muted/60 transition-colors"
            >
              <div className="mt-1 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-strong">
                  {(last.lead?.name ?? '?').trim().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {last.lead?.name ?? 'Lead desconhecido'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{fmtWhen(last.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {last.direction === 'inbound' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5 shrink-0 text-primary-strong" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground truncate">{last.content}</p>
                </div>
              </div>
              <span className="mt-1 text-xs text-muted-foreground shrink-0">{count} msg{count > 1 ? 's' : ''}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
