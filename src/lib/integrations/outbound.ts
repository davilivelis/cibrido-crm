import { createHmac } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Anti-SSRF: só permite https pra host PÚBLICO. Bloqueia localhost, hostnames
// sem TLD, e IPs internos/link-local (inclui 169.254.169.254 de metadados).
export function isSafeWebhookUrl(raw: string): boolean {
  let u: URL
  try { u = new URL(raw) } catch { return false }
  if (u.protocol !== 'https:') return false
  const host = u.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.')) return false
  if (host === '::1' || host.startsWith('fd') || host.startsWith('fe80')) return false
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const [a, b] = host.split('.').map(Number)
    if (a === 127 || a === 10 || a === 0 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)) return false
  }
  return true
}

// Webhook de SAÍDA: o CRM envia seus eventos (lead criado, agendou, converteu)
// pra uma URL externa que a clínica configurou. Assina com HMAC-SHA256 pra a
// outra ponta poder validar que veio mesmo do CRM. Nunca derruba o fluxo
// principal — falhou, loga e segue.

export async function fireOutbound(
  clinicId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: clinic } = await admin
      .from('clinics')
      .select('webhook_out_url, webhook_out_secret')
      .eq('id', clinicId)
      .maybeSingle()

    const url = clinic?.webhook_out_url
    if (!url || !isSafeWebhookUrl(url)) return  // defesa em profundidade (bloqueia SSRF)

    const bodyStr = JSON.stringify({ event, data: payload, sent_at: new Date().toISOString() })
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (clinic?.webhook_out_secret) {
      headers['X-Livelis-Signature'] = createHmac('sha256', clinic.webhook_out_secret).update(bodyStr).digest('hex')
    }

    // redirect:'error' — sem isso um 302 pra host interno burlaria o anti-SSRF
    await fetch(url, { method: 'POST', headers, body: bodyStr, redirect: 'error' })
  } catch (err) {
    console.error('[Webhook OUT] Erro:', err)
  }
}
