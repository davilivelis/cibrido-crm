import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EvolutionSender, phoneAllowed } from '@/lib/notifications/sender'

// ── SENTINELA EXTERNO DO N8N ─────────────────────────────────────────
// Vigia que roda FORA do servidor do n8n (aqui na Vercel): se o n8n
// inteiro cair — cenário em que qualquer vigia interno cai junto —
// este cron percebe e avisa o Davi no WhatsApp.
//
// Disparado a cada 5 min (pg_cron/Supabase → HTTP) + 1x/dia pelo Vercel
// Cron (backup) — mesmo padrão do /api/cron/notifications.
// Auth: Authorization: Bearer <CRON_SECRET> ou header x-cron-secret.
//
// Regras:
//  • n8n fora (timeout/5xx/erro de rede) → WhatsApp pro Davi, com
//    anti-spam de 1 alerta por hora enquanto seguir fora.
//  • n8n voltou depois de um período fora → 1 mensagem única de retorno.
//  • Destinatário ÚNICO: NOTIFY_PHONE_DAVI (Lei do Destinatário Único).
//    Passa também pelo MODO SEGURO (phoneAllowed) do motor de envio.
//  • ?simulate=down (só funciona junto com o secret) força o fluxo de
//    queda 1 vez, pra testar a entrega sem derrubar o n8n de verdade.

export const maxDuration = 60

const N8N_BASE       = 'https://livelisn8n.livelis.com.br'
const CHECK_TIMEOUT  = 10_000            // 10s por tentativa de healthcheck
const ALERT_COOLDOWN = 60 * 60 * 1000    // anti-spam: 1 alerta por hora

// Mesma autenticação do cron de notificações
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  const alt = request.headers.get('x-cron-secret')
  return auth === `Bearer ${secret}` || alt === secret
}

// Hora local do Brasil (São Paulo) formatada pra mensagem — ex.: "23/07 14:05"
function horaBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(date)
}

// Checa se o n8n está vivo:
//  1) GET /healthz (endpoint oficial de health do n8n) — 200 = vivo
//  2) se /healthz não existir/errar, GET na raiz — qualquer HTTP < 500 = vivo
// Só declara MORTO se as duas tentativas falharem (timeout, erro de rede ou 5xx).
async function n8nAlive(): Promise<{ alive: boolean; detail: string }> {
  try {
    const res = await fetch(`${N8N_BASE}/healthz`, {
      signal: AbortSignal.timeout(CHECK_TIMEOUT),
      cache: 'no-store',
    })
    if (res.ok) return { alive: true, detail: `healthz ${res.status}` }
    // healthz respondeu mas não-2xx (ex.: 404 = endpoint desativado) → cai no fallback
  } catch {
    // timeout ou erro de rede no healthz → ainda dá uma 2ª chance na raiz
  }
  try {
    const res = await fetch(`${N8N_BASE}/`, {
      signal: AbortSignal.timeout(CHECK_TIMEOUT),
      cache: 'no-store',
    })
    // Raiz pode devolver 200 (editor), 401 (auth) etc. — servidor de pé responde < 500
    if (res.status < 500) return { alive: true, detail: `raiz ${res.status}` }
    return { alive: false, detail: `raiz ${res.status}` }
  } catch (err) {
    return { alive: false, detail: err instanceof Error ? err.message : String(err) }
  }
}

// Envio pro Davi — reusa o EvolutionSender do motor de notificações,
// respeitando o MODO SEGURO (whitelist NOTIFICATIONS_ALLOWED_PHONES).
async function alertDavi(message: string): Promise<{ sent: boolean; error?: string }> {
  const davi = process.env.NOTIFY_PHONE_DAVI
  if (!davi) return { sent: false, error: 'NOTIFY_PHONE_DAVI não configurado' }
  if (!phoneAllowed(davi)) return { sent: false, error: 'número fora da whitelist (MODO SEGURO)' }
  const result = await new EvolutionSender().send(davi, message)
  return { sent: result.ok, error: result.error }
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const simulateDown = url.searchParams.get('simulate') === 'down'

    // 1) Checa o n8n (ou finge queda, se for teste com ?simulate=down)
    const check = simulateDown
      ? { alive: false, detail: 'SIMULAÇÃO forçada via ?simulate=down' }
      : await n8nAlive()

    // 2) Carrega o último estado conhecido (linha 'n8n' criada na migration 019)
    const admin = createAdminClient()
    const { data: state, error: stateError } = await admin
      .from('watchdog_state')
      .select('status, down_since, last_alert_at')
      .eq('service', 'n8n')
      .maybeSingle()
    if (stateError) throw new Error(`watchdog_state: ${stateError.message}`)

    const now = new Date()
    const wasDown = state?.status === 'down'

    // ── n8n FORA DO AR ───────────────────────────────────────────────
    if (!check.alive) {
      // "desde quando": se já estava fora, mantém a hora original da queda
      const downSince = wasDown && state?.down_since ? new Date(state.down_since) : now

      // Anti-spam: só alerta se nunca alertou ou se o último alerta tem 1h+
      const lastAlert = state?.last_alert_at ? new Date(state.last_alert_at).getTime() : 0
      const shouldAlert = now.getTime() - lastAlert >= ALERT_COOLDOWN

      let alert: { sent: boolean; error?: string } = { sent: false }
      if (shouldAlert) {
        alert = await alertDavi(
          `🚨 SENTINELA EXTERNO: o n8n não responde desde ${horaBR(downSince)}. ` +
          `Todas as automações podem estar paradas. Verificar EasyPanel.`
        )
      }

      // Persiste o estado 'down' (e a hora do alerta, se saiu alerta agora)
      await admin.from('watchdog_state').upsert({
        service: 'n8n',
        status: 'down',
        down_since: downSince.toISOString(),
        last_alert_at: alert.sent ? now.toISOString() : state?.last_alert_at ?? null,
        updated_at: now.toISOString(),
      })

      console.log('[Watchdog n8n] FORA DO AR', JSON.stringify({ detail: check.detail, shouldAlert, alert }))
      return NextResponse.json({
        ok: true, n8n: 'down', detail: check.detail,
        alerted: alert.sent, alertError: alert.error,
        cooldownActive: !shouldAlert, simulated: simulateDown,
      })
    }

    // ── n8n DE PÉ ────────────────────────────────────────────────────
    let recovery: { sent: boolean; error?: string } = { sent: false }
    if (wasDown) {
      // Estava fora e voltou → 1 mensagem única de retorno
      recovery = await alertDavi(`✅ SENTINELA: o n8n voltou às ${horaBR(now)}.`)
    }

    // Zera o estado (up, sem down_since nem cooldown pendente)
    await admin.from('watchdog_state').upsert({
      service: 'n8n',
      status: 'up',
      down_since: null,
      last_alert_at: null,
      updated_at: now.toISOString(),
    })

    if (wasDown) console.log('[Watchdog n8n] VOLTOU', JSON.stringify(recovery))
    return NextResponse.json({
      ok: true, n8n: 'up', detail: check.detail,
      recovered: wasDown, recoveryMessageSent: recovery.sent, recoveryError: recovery.error,
    })
  } catch (err) {
    console.error('[Watchdog n8n] Erro:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
