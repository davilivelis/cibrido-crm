// Camada de canal do motor de notificações — plugável por clínica.
// Hoje: Evolution API (instância do sistema). Próximo: WhatsApp Cloud API
// oficial por clínica (anti-banimento), ativada no onboarding.

export interface SendResult {
  ok: boolean
  error?: string
}

export interface Sender {
  send(phone: string, message: string): Promise<SendResult>
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
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
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}

// Futuro (onboarding por clínica): CloudApiSender com token/número da conta
// Meta da própria clínica — templates de utilidade aprovados, zero banimento.

// channel vem da notification_rule; config pode trazer instância própria da clínica
export function getSender(channel: string, config: Record<string, unknown>): Sender {
  // 'cloud_api' cai na Evolution até a ativação oficial existir por clínica
  const instance = typeof config.instance === 'string' && config.instance ? config.instance : undefined
  return new EvolutionSender(instance)
}
