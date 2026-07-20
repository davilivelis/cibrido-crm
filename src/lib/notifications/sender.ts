// Camada de canal do motor de notificações — plugável por clínica.
// Hoje: Evolution API (instância do sistema). Próximo: WhatsApp Cloud API
// oficial por clínica (anti-banimento), ativada no onboarding.

export interface SendResult {
  ok: boolean
  error?: string
  externalId?: string  // id da mensagem na Evolution — grava como external_id p/ dedup do eco fromMe
}

export interface Sender {
  send(phone: string, message: string): Promise<SendResult>
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

// ── MODO SEGURO (trava anti-mensagem-indesejada) ─────────────────────
// Com NOTIFICATIONS_ALLOWED_PHONES definida (lista separada por vírgula),
// só sai mensagem pra número da lista. Sem a env → aberto.
// Vale pra TODO envio do CRM: motor de notificações E chat das conversas.
function normDigits(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('55') ? d.slice(2) : d
}

export function phoneAllowed(phone: string): boolean {
  const allowed = process.env.NOTIFICATIONS_ALLOWED_PHONES
  if (allowed === undefined) return true
  const list = allowed.split(',').map(normDigits).filter(Boolean)
  return list.includes(normDigits(phone))
}

export class EvolutionSender implements Sender {
  constructor(private instance?: string) {}

  async send(phone: string, message: string): Promise<SendResult> {
    const baseUrl  = process.env.EVOLUTION_API_URL
    const apiKey   = process.env.EVOLUTION_API_KEY
    const instance = this.instance ?? process.env.EVOLUTION_INSTANCE ?? 'Livelis-Bot'

    if (!baseUrl || !apiKey) {
      return { ok: false, error: 'Evolution API não configurada (EVOLUTION_API_URL/KEY)' }
    }

    try {
      const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({ number: normalizePhone(phone), text: message }),
      })
      if (!res.ok) return { ok: false, error: `Evolution ${res.status}: ${(await res.text()).slice(0, 300)}` }
      const json = (await res.json().catch(() => null)) as { key?: { id?: string } } | null
      return { ok: true, externalId: json?.key?.id }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}

// WhatsApp Cloud API OFICIAL da Meta, por clínica (anti-banimento).
// Duas formas de enviar:
//  • send()        → texto livre — só entregue DENTRO da janela de 24h de
//    atendimento (resposta a quem escreveu). Fora da janela a Meta rejeita.
//  • sendTemplate()→ template de UTILIDADE aprovado — é o que permite a
//    notificação PROATIVA (confirmação/lembrete/falta) sem cair. É o caminho
//    das notificações; exige templates aprovados na conta Meta da clínica.
const GRAPH_VERSION = 'v21.0'

export class CloudApiSender implements Sender {
  constructor(private phoneId: string, private token: string) {}

  private async post(payload: Record<string, unknown>): Promise<SendResult> {
    try {
      const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${this.phoneId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
      })
      if (!res.ok) return { ok: false, error: `Cloud API ${res.status}: ${(await res.text()).slice(0, 300)}` }
      const json = (await res.json().catch(() => null)) as { messages?: { id?: string }[] } | null
      return { ok: true, externalId: json?.messages?.[0]?.id }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  async send(phone: string, message: string): Promise<SendResult> {
    return this.post({ to: normalizePhone(phone), type: 'text', text: { body: message } })
  }

  async sendTemplate(phone: string, templateName: string, lang: string, params: string[]): Promise<SendResult> {
    return this.post({
      to: normalizePhone(phone),
      type: 'template',
      template: {
        name: templateName,
        language: { code: lang },
        components: params.length ? [{ type: 'body', parameters: params.map((t) => ({ type: 'text', text: t })) }] : undefined,
      },
    })
  }
}

// channel vem da notification_rule; cloud traz as credenciais Meta da clínica.
// Só usa Cloud API quando o canal é 'cloud_api' E a clínica tem credenciais —
// senão cai na Evolution (default). Nunca quebra: sem credencial → Evolution.
export function getSender(
  channel: string,
  config: Record<string, unknown>,
  cloud?: { phoneId?: string | null; token?: string | null }
): Sender {
  if (channel === 'cloud_api' && cloud?.phoneId && cloud?.token) {
    return new CloudApiSender(cloud.phoneId, cloud.token)
  }
  const instance = typeof config.instance === 'string' && config.instance ? config.instance : undefined
  return new EvolutionSender(instance)
}
