import { createHmac } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

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
    if (!url) return

    const bodyStr = JSON.stringify({ event, data: payload, sent_at: new Date().toISOString() })
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (clinic?.webhook_out_secret) {
      headers['X-Livelis-Signature'] = createHmac('sha256', clinic.webhook_out_secret).update(bodyStr).digest('hex')
    }

    await fetch(url, { method: 'POST', headers, body: bodyStr })
  } catch (err) {
    console.error('[Webhook OUT] Erro:', err)
  }
}
