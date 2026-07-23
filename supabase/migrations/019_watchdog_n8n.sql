-- 019 — SENTINELA EXTERNO: estado do watchdog do n8n
-- Guarda o último estado conhecido do n8n para o cron /api/cron/watchdog-n8n:
--   • status ('up'/'down') → detecta transição (caiu agora / voltou agora)
--   • down_since           → hora em que caiu (vai na mensagem de alerta)
--   • last_alert_at        → anti-spam: no máximo 1 alerta por hora enquanto fora
-- Tabela interna do sistema (sem clínica): RLS ligada SEM policies —
-- só o service_role (rotas do servidor) lê/escreve; usuário comum não enxerga.
-- Aplicada em produção 23/07/2026. Idempotente.

CREATE TABLE IF NOT EXISTS watchdog_state (
  service        text PRIMARY KEY,            -- identificador do serviço vigiado (ex.: 'n8n')
  status         text NOT NULL DEFAULT 'up',  -- 'up' | 'down'
  down_since     timestamptz,                 -- quando caiu (null se está de pé)
  last_alert_at  timestamptz,                 -- último alerta de queda enviado (anti-spam 1h)
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE watchdog_state ENABLE ROW LEVEL SECURITY;

-- Linha inicial do n8n (estado otimista: de pé)
INSERT INTO watchdog_state (service) VALUES ('n8n')
ON CONFLICT (service) DO NOTHING;
