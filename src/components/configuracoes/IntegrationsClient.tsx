'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Link2, Copy, Check, RefreshCw, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { generateInboundToken, saveOutboundWebhook, saveCloudApi, type IntegrationConfig, type CloudApiStatus } from '@/lib/actions/integrations'

export default function IntegrationsClient({ config, cloud }: { config: IntegrationConfig; cloud: CloudApiStatus }) {
  const [inboundUrl, setInboundUrl] = useState(config.inboundUrl)
  const [outboundUrl, setOutboundUrl] = useState(config.outboundUrl ?? '')
  const [phoneId, setPhoneId] = useState(cloud.phoneId ?? '')
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  function saveCloud() {
    startTransition(async () => {
      const res = await saveCloudApi(phoneId, token)
      if (res.ok) { toast.success('WhatsApp oficial salvo.'); setToken('') }
      else toast.error(res.error ?? 'Erro ao salvar')
    })
  }

  function copy() {
    if (!inboundUrl) return
    navigator.clipboard.writeText(inboundUrl)
    setCopied(true)
    toast.success('Link copiado! Cole na plataforma externa.')
    setTimeout(() => setCopied(false), 2500)
  }

  function generate() {
    startTransition(async () => {
      const res = await generateInboundToken()
      if (res.ok && res.url) {
        setInboundUrl(res.url)
        toast.success(inboundUrl ? 'Link renovado (o anterior parou de valer).' : 'Link gerado!')
      } else {
        toast.error(res.error ?? 'Erro ao gerar')
      }
    })
  }

  function saveOutbound() {
    startTransition(async () => {
      const res = await saveOutboundWebhook(outboundUrl)
      if (res.ok) toast.success(outboundUrl ? 'Envio configurado.' : 'Envio removido.')
      else toast.error(res.error ?? 'Erro ao salvar')
    })
  }

  return (
    <div className="space-y-6">
      {/* WHATSAPP OFICIAL — anti-ban */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-strong" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">WhatsApp Oficial (anti-banimento)</h2>
            <p className="text-xs text-muted-foreground">
              Conta oficial da Meta: as notificações saem por template aprovado e o número não cai.
            </p>
          </div>
          {cloud.configured && (
            <span className="ml-auto shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-primary/15 text-primary-strong">ativo</span>
          )}
        </div>
        <div className="space-y-2">
          <input
            value={phoneId}
            onChange={(e) => setPhoneId(e.target.value)}
            placeholder="Phone Number ID (do painel da Meta)"
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-sm"
          />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="password"
            placeholder={cloud.configured ? 'Token salvo — preencha só pra trocar' : 'Token de acesso permanente'}
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-sm"
          />
          <button
            onClick={saveCloud}
            disabled={pending}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Salvar WhatsApp oficial
          </button>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/60 rounded-lg p-3 leading-relaxed">
          Precisa de uma conta WhatsApp Business verificada na Meta + templates de utilidade aprovados —
          o suporte configura isso com você no onboarding. É o que faz o número não cair.
        </div>
      </div>

      {/* ENTRADA — receber conversões */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary-strong" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Receber conversões (entrada)</h2>
            <p className="text-xs text-muted-foreground">
              Dê este link à sua plataforma de rastreamento ou ao seu sistema. Quando um cliente comprar, a venda cai aqui e vira prova.
            </p>
          </div>
        </div>

        {inboundUrl ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate text-xs font-mono bg-muted rounded-lg px-3 py-2.5 text-foreground border border-border">
              {inboundUrl}
            </code>
            <button
              onClick={copy}
              className="shrink-0 h-10 px-3 rounded-lg border border-border hover:border-primary flex items-center gap-1.5 text-sm text-foreground transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-primary-strong" /> : <Copy className="w-4 h-4" />}
              copiar
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum link ainda — gere abaixo.</p>
        )}

        <button
          onClick={generate}
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${pending ? 'animate-spin' : ''}`} />
          {inboundUrl ? 'Renovar link (invalida o atual)' : 'Gerar link de entrada'}
        </button>

        <div className="text-xs text-muted-foreground bg-muted/60 rounded-lg p-3 leading-relaxed">
          A plataforma externa deve mandar um <strong>POST</strong> com JSON contendo pelo menos o{' '}
          <strong>telefone</strong> do cliente e o <strong>valor</strong> da venda. O CRM casa com o lead,
          identifica de qual anúncio veio e soma no faturamento por campanha.
        </div>
      </div>

      {/* SAÍDA — enviar eventos (opcional) */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Enviar eventos (saída) — opcional</h2>
            <p className="text-xs text-muted-foreground">
              O CRM manda seus eventos (lead, agendamento, conversão) pra uma URL sua. Assinado com HMAC.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={outboundUrl}
            onChange={(e) => setOutboundUrl(e.target.value)}
            placeholder="https://sua-plataforma.com/webhook"
            className="flex-1 rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-sm"
          />
          <button
            onClick={saveOutbound}
            disabled={pending}
            className="shrink-0 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Salvar
          </button>
        </div>
        {config.hasOutbound && (
          <p className="text-xs text-muted-foreground">
            Segredo HMAC configurado (enviado no header <code>X-Livelis-Signature</code>).
          </p>
        )}
      </div>
    </div>
  )
}
