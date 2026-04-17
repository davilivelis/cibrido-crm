-- ============================================================
-- CibridoCRM — Painel Interno + Sistema de Convites + Asaas
-- Versão: 006 | Data: 17/04/2026
-- ============================================================

-- ============================================================
-- TABELA: invites
-- Controla quem pode se cadastrar no CRM
-- Gerado manualmente pelo admin ou automaticamente via Asaas webhook
-- ============================================================
CREATE TABLE invites (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token             TEXT UNIQUE NOT NULL,
  email             TEXT NOT NULL,
  plan              TEXT NOT NULL DEFAULT 'standard', -- lite | standard | master
  status            TEXT NOT NULL DEFAULT 'pending',  -- pending | used | expired | revoked
  origin            TEXT NOT NULL DEFAULT 'manual',   -- manual | asaas_webhook
  asaas_payment_id  TEXT,
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invites_token  ON invites(token);
CREATE INDEX idx_invites_email  ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);

-- ============================================================
-- TABELA: subscriptions
-- Controla o plano e status de acesso de cada clínica
-- Atualizado pelo admin manualmente ou via webhook Asaas
-- ============================================================
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id             UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL DEFAULT 'trial',   -- trial | lite | standard | master
  status                TEXT NOT NULL DEFAULT 'trial',   -- trial | active | blocked | cancelled
  trial_ends_at         TIMESTAMPTZ,
  paid_until            TIMESTAMPTZ,
  asaas_customer_id     TEXT,
  asaas_subscription_id TEXT,
  asaas_payment_id      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_clinic ON subscriptions(clinic_id);

-- ============================================================
-- TABELA: cibrido_leads
-- Prospects interessados em comprar o Sistema Cíbrido
-- Alimentado pelo Juliano (SDR) e pelo painel admin
-- ============================================================
CREATE TABLE cibrido_leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  clinic_name TEXT,
  phone       TEXT,
  email       TEXT,
  source      TEXT,        -- instagram | meta_ads | indicacao | presencial | organico
  stage       TEXT NOT NULL DEFAULT 'lead', -- lead | qualificado | call_agendada | proposta_enviada | cliente_ativo | churned
  notes       TEXT,
  assigned_to TEXT,        -- 'davi' | 'ricardo'
  lead_score  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cibrido_leads_stage ON cibrido_leads(stage);

-- ============================================================
-- TABELA: cibrido_calls
-- Registro de calls entre dentista e Davi/Ricardo
-- Agendado pelo Lorena, registrado manualmente pelo admin
-- ============================================================
CREATE TABLE cibrido_calls (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID REFERENCES cibrido_leads(id) ON DELETE CASCADE,
  attended_by  TEXT NOT NULL,   -- 'davi' | 'ricardo'
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes        TEXT,
  next_step    TEXT,
  outcome      TEXT,            -- 'fechou' | 'pendente' | 'nao_apareceu' | 'perdeu'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cibrido_calls_lead_id ON cibrido_calls(lead_id);
CREATE INDEX idx_cibrido_calls_date    ON cibrido_calls(scheduled_at);

-- ============================================================
-- RLS — invites e subscriptions só acessíveis via service_role
-- cibrido_leads e cibrido_calls: idem (dados internos da Cíbrido)
-- ============================================================
ALTER TABLE invites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cibrido_leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cibrido_calls     ENABLE ROW LEVEL SECURITY;

-- Nenhum usuário comum acessa — só service_role (admin backend)
CREATE POLICY "invites: somente service_role"
  ON invites FOR ALL USING (false);

CREATE POLICY "subscriptions: somente service_role"
  ON subscriptions FOR ALL USING (false);

CREATE POLICY "cibrido_leads: somente service_role"
  ON cibrido_leads FOR ALL USING (false);

CREATE POLICY "cibrido_calls: somente service_role"
  ON cibrido_calls FOR ALL USING (false);

-- ============================================================
-- FUNÇÃO: gerar token de convite único
-- ============================================================
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  token TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..32 LOOP
    token := token || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN token;
END;
$$;
