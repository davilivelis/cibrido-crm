'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import {
  NOTIFICATION_LABELS,
  DEFAULT_TEMPLATES,
  type NotificationType,
} from '@/lib/notifications/templates'
import {
  saveNotificationRule,
  type NotificationRule,
  type NotificationLogRow,
} from '@/lib/actions/notifications'

const ORDER: NotificationType[] = [
  'confirmacao', 'vespera', 'no_dia', 'hora_antes',
  'aniversario', 'recall', 'avaliacao', 'pesquisa', 'relatorio_dono',
]

// Tipos que disparam "de manhã" — o negócio escolhe o horário
const HOUR_TYPES = new Set<NotificationType>(['vespera', 'no_dia', 'aniversario', 'recall', 'avaliacao', 'pesquisa', 'relatorio_dono'])

interface RuleState {
  enabled: boolean
  template: string
  review_link: string
  send_hour: string
  minutes_before: string
}

export default function NotificationsClient({
  rules,
  log,
}: {
  rules: NotificationRule[]
  log: NotificationLogRow[]
}) {
  const byType = new Map(rules.map((r) => [r.type, r]))
  const [open, setOpen] = useState<NotificationType | null>(null)
  const [pending, startTransition] = useTransition()

  // Estado local por tipo
  const [state, setState] = useState<Record<string, RuleState>>(
    Object.fromEntries(
      ORDER.map((t) => {
        const r = byType.get(t)
        return [t, {
          enabled: r?.enabled ?? false,
          template: r?.template ?? '',
          review_link: typeof r?.config?.review_link === 'string' ? (r.config.review_link as string) : '',
          send_hour: typeof r?.config?.send_hour === 'number' ? String(r.config.send_hour) : '',
          minutes_before: typeof r?.config?.minutes_before === 'number' ? String(r.config.minutes_before) : '',
        }]
      })
    )
  )

  function save(type: NotificationType, next: RuleState) {
    setState((s) => ({ ...s, [type]: next }))
    startTransition(async () => {
      const res = await saveNotificationRule({
        type,
        enabled: next.enabled,
        template: next.template || null,
        review_link: type === 'avaliacao' ? next.review_link : undefined,
        send_hour: HOUR_TYPES.has(type) && next.send_hour !== '' ? Number(next.send_hour) : undefined,
        minutes_before: type === 'hora_antes' && next.minutes_before !== '' ? Number(next.minutes_before) : undefined,
      })
      if (res.ok) toast.success(`${NOTIFICATION_LABELS[type].label}: salvo`)
      else toast.error(res.error ?? 'Erro ao salvar')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {ORDER.map((type) => {
          const meta = NOTIFICATION_LABELS[type]
          const st = state[type]
          const isOpen = open === type
          return (
            <div key={type} className="px-5 py-4">
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => save(type, { ...st, enabled: !st.enabled })}
                  disabled={pending}
                  className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                  style={{ backgroundColor: st.enabled ? 'var(--primary)' : 'var(--muted)' }}
                  aria-label={`${st.enabled ? 'Desligar' : 'Ligar'} ${meta.label}`}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-card border border-border transition-all"
                    style={{ left: st.enabled ? 22 : 2 }}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : type)}
                  className="text-xs font-semibold text-primary-strong flex items-center gap-1 shrink-0"
                >
                  mensagem {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isOpen && (
                <div className="mt-4 space-y-3 pl-15">
                  <textarea
                    value={st.template || DEFAULT_TEMPLATES[type]}
                    onChange={(e) => setState((s) => ({ ...s, [type]: { ...st, template: e.target.value } }))}
                    rows={5}
                    className="w-full rounded-lg border border-input bg-background text-foreground p-3 text-sm resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis: {'{nome} {primeiro_nome} {data} {hora} {clinica} {link}'}
                    {type === 'recall' && ' {motivo}'}
                  </p>
                  {type === 'avaliacao' && (
                    <input
                      value={st.review_link}
                      onChange={(e) => setState((s) => ({ ...s, [type]: { ...st, review_link: e.target.value } }))}
                      placeholder="Link de avaliação do Google (ex.: https://g.page/r/...)"
                      className="w-full rounded-lg border border-input bg-background text-foreground p-2.5 text-sm"
                    />
                  )}
                  {HOUR_TYPES.has(type) && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Horário de envio:</label>
                      <input
                        type="number" min={0} max={23}
                        value={st.send_hour}
                        onChange={(e) => setState((s) => ({ ...s, [type]: { ...st, send_hour: e.target.value } }))}
                        placeholder="8"
                        className="w-16 rounded-lg border border-input bg-background text-foreground p-2 text-sm text-center"
                      />
                      <span className="text-xs text-muted-foreground">h (padrão 8h)</span>
                    </div>
                  )}
                  {type === 'hora_antes' && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Enviar</label>
                      <input
                        type="number" min={15} max={1440}
                        value={st.minutes_before}
                        onChange={(e) => setState((s) => ({ ...s, [type]: { ...st, minutes_before: e.target.value } }))}
                        placeholder="60"
                        className="w-20 rounded-lg border border-input bg-background text-foreground p-2 text-sm text-center"
                      />
                      <span className="text-xs text-muted-foreground">min antes (padrão 60)</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => save(type, st)}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      Salvar mensagem
                    </button>
                    <button
                      type="button"
                      onClick={() => setState((s) => ({ ...s, [type]: { ...st, template: '' } }))}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-muted"
                    >
                      Restaurar padrão
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Histórico de envios */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary-strong" />
          <h2 className="font-semibold text-foreground text-sm">Últimos envios automáticos</h2>
        </div>
        {log.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            Nenhum envio ainda — ligue uma notificação acima e o robô começa a trabalhar.
          </p>
        ) : (
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {log.map((l) => (
              <div key={l.id} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: l.status === 'sent' ? 'var(--accent)' : 'var(--muted)',
                    color: l.status === 'sent' ? 'var(--accent-foreground)' : 'var(--destructive)',
                  }}
                >
                  {l.status === 'sent' ? 'enviado' : l.status}
                </span>
                <span className="text-muted-foreground text-xs shrink-0">
                  {NOTIFICATION_LABELS[l.type as NotificationType]?.label ?? l.type}
                </span>
                <span className="text-muted-foreground truncate flex-1 text-xs">{l.message}</span>
                <span className="text-muted-foreground text-xs shrink-0">
                  {new Date(l.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
