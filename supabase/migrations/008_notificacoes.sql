-- ============================================================
-- CRM Livelis — Motor de Notificações (S2)
-- Versão: 008
-- Regras por clínica + log idempotente + aniversário do lead
-- + token de confirmação de consulta
-- ============================================================

-- Aniversário do paciente/lead
ALTER TABLE leads ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Token público de confirmação de consulta (link SIM/NÃO)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS confirm_token TEXT UNIQUE;

-- ------------------------------------------------------------
-- Regras de notificação (config por clínica; sem linha = DESLIGADO)
-- ------------------------------------------------------------
CREATE TABLE notification_rules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Tipos do motor v1
  type TEXT NOT NULL CHECK (type IN (
    'confirmacao',     -- ao agendar: pede confirmação com link
    'vespera',         -- 1 dia antes
    'no_dia',          -- na manhã do dia
    'hora_antes',      -- ~1h antes
    'aniversario',     -- parabéns no aniversário do lead
    'recall',          -- recall pendente vencido
    'avaliacao',       -- pós-consulta: pedir avaliação Google
    'relatorio_dono'   -- resumo semanal pro dono (segunda de manhã)
  )),

  enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  template TEXT,                                   -- NULL = template padrão do sistema
  channel  TEXT NOT NULL DEFAULT 'evolution'
           CHECK (channel IN ('evolution', 'cloud_api')),
  config   JSONB NOT NULL DEFAULT '{}'::jsonb,     -- ex.: link do Google review

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (clinic_id, type)
);

CREATE INDEX idx_notification_rules_clinic ON notification_rules(clinic_id);

ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_rules: ver da própria clínica"
  ON notification_rules FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "notification_rules: criar na própria clínica"
  ON notification_rules FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "notification_rules: editar da própria clínica"
  ON notification_rules FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "notification_rules: deletar da própria clínica"
  ON notification_rules FOR DELETE
  USING (clinic_id = get_user_clinic_id());

CREATE TRIGGER set_notification_rules_updated_at
  BEFORE UPDATE ON notification_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Log de envios (idempotência: dedup_key único por clínica)
-- Escrito apenas pelo motor (service role); clínica só lê.
-- ------------------------------------------------------------
CREATE TABLE notification_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  target_id  UUID,                                 -- appointment/lead/recall
  dedup_key  TEXT NOT NULL,                        -- ex.: 'vespera:apt:<id>' · 'aniversario:lead:<id>:2026'
  phone      TEXT,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'sent'
             CHECK (status IN ('sent', 'failed', 'skipped')),
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (clinic_id, dedup_key)
);

CREATE INDEX idx_notification_log_clinic ON notification_log(clinic_id, created_at DESC);
CREATE INDEX idx_notification_log_type   ON notification_log(clinic_id, type);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_log: ver da própria clínica"
  ON notification_log FOR SELECT
  USING (clinic_id = get_user_clinic_id());
-- (sem INSERT/UPDATE/DELETE para usuários — só o motor via service role)
