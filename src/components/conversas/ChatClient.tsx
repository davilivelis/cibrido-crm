'use client'

// Chat ao vivo (S3): mostra o histórico, escuta INSERTs via Supabase
// Realtime (mensagem nova aparece sem recarregar) e envia pelo painel.

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendChatMessage } from '@/lib/actions/conversations'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  direction: string
  content: string
  created_at: string
  status?: string
}

function fmtTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export function ChatClient({
  leadId,
  initialMessages,
}: {
  leadId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime: escuta INSERTs desta conversa; RLS garante só a própria clínica
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`conversa-${leadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations', filter: `lead_id=eq.${leadId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [leadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    try {
      const res = await sendChatMessage(leadId, value)
      if (res.ok) {
        setText('')
        // O INSERT chega via realtime; nada mais a fazer
      } else {
        toast.error(res.error ?? 'Falha ao enviar')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[420px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhuma mensagem ainda — mande a primeira. 😉
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                  msg.direction === 'outbound'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-1 ${
                    msg.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {fmtTime(msg.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escreva uma mensagem… (Enter envia, Shift+Enter quebra linha)"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0"
          aria-label="Enviar mensagem"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
