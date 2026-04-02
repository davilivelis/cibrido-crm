import { createClient } from '@/lib/supabase/server'
import { MessageSquare } from 'lucide-react'

export default async function ConversasPage() {
  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`*, lead:leads(id, name, phone)`)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Conversas</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>Histórico de mensagens WhatsApp</p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <p className="font-medium text-gray-700">Nenhuma conversa ainda</p>
          <p className="text-sm text-gray-400 max-w-xs">
            As conversas aparecerão aqui quando o WhatsApp estiver conectado via Evolution API.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {conversations.map((conv) => (
            <div key={conv.id} className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${conv.direction === 'inbound' ? 'bg-green-400' : 'bg-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {(conv.lead as { name: string } | null)?.name ?? 'Lead desconhecido'}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(conv.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{conv.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
