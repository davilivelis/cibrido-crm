-- ============================================================
-- CibridoCRM — Schema Inicial
-- Versão: 001 | Multi-tenant (cada clínica = 1 tenant)
-- Regra principal: clinic_id em todas as tabelas de dados
-- ============================================================

-- Habilita extensão para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABELA: clinics (cada linha = 1 clínica/tenant)
-- ============================================================
CREATE TABLE clinics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,                        -- Nome da clínica
  slug        TEXT UNIQUE NOT NULL,                 -- Ex: "clinica-sorriso" (para URLs)
  phone       TEXT,                                 -- Telefone principal
  email       TEXT,                                 -- Email de contato
  address     TEXT,                                 -- Endereço completo
  plan        TEXT NOT NULL DEFAULT 'trial',        -- trial | basic | pro
  trial_ends_at TIMESTAMPTZ,                        -- Data de fim do período grátis
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: users (usuários vinculados a uma clínica)
-- Conectado ao sistema de auth do Supabase (auth.users)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'atendente',    -- owner | gestor | atendente
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: pipeline_stages (etapas do funil por clínica)
-- Cada clínica pode ter as etapas padrão ou personalizadas
-- ============================================================
CREATE TABLE pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                        -- Ex: "Novo Lead"
  color       TEXT NOT NULL DEFAULT '#6366f1',      -- Cor no kanban
  position    INT NOT NULL DEFAULT 0,               -- Ordem das colunas
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: leads (pacientes/prospectos de cada clínica)
-- ============================================================
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,  -- Responsável
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,                    -- WhatsApp principal
  email           TEXT,
  source          TEXT,                             -- Ex: instagram | google | indicação
  utm_source      TEXT,                             -- Rastreamento de campanha
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  notes           TEXT,                             -- Observações livres
  status          TEXT NOT NULL DEFAULT 'active',   -- active | lost | converted
  lost_reason     TEXT,                             -- Motivo de perda
  converted_at    TIMESTAMPTZ,                      -- Quando virou cliente
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: lead_events (histórico de tudo que aconteceu com o lead)
-- Timeline completa: mudanças de etapa, ligações, mensagens, etc.
-- ============================================================
CREATE TABLE lead_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,  -- Quem fez
  type        TEXT NOT NULL,                        -- stage_change | note | call | whatsapp | appointment
  description TEXT,                                 -- Texto livre do evento
  metadata    JSONB,                                -- Dados extras (ex: etapa anterior/nova)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: conversations (mensagens WhatsApp com leads)
-- ============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL DEFAULT 'whatsapp',  -- whatsapp | sms | email
  direction       TEXT NOT NULL,                     -- inbound (recebida) | outbound (enviada)
  content         TEXT NOT NULL,                     -- Texto da mensagem
  media_url       TEXT,                              -- Link de imagem/áudio/documento
  media_type      TEXT,                              -- image | audio | document | video
  sent_by         UUID REFERENCES users(id),         -- NULL se foi pelo agente IA
  external_id     TEXT,                              -- ID da mensagem no WhatsApp/Evolution
  status          TEXT NOT NULL DEFAULT 'sent',      -- sent | delivered | read | failed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: appointments (consultas agendadas)
-- ============================================================
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'Consulta',
  scheduled_at    TIMESTAMPTZ NOT NULL,             -- Data e hora da consulta
  duration_min    INT NOT NULL DEFAULT 60,          -- Duração em minutos
  status          TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | confirmed | attended | no_show | cancelled
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: campaigns (campanhas de tráfego pago)
-- Só visível para usuários com role 'gestor' ou 'owner'
-- ============================================================
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,                    -- Nome da campanha
  platform        TEXT NOT NULL,                    -- meta | google | tiktok
  status          TEXT NOT NULL DEFAULT 'active',   -- active | paused | ended
  budget_monthly  NUMERIC(10, 2),                   -- Verba mensal (R$)
  spent_total     NUMERIC(10, 2) DEFAULT 0,         -- Total gasto
  impressions     INT DEFAULT 0,
  clicks          INT DEFAULT 0,
  leads_generated INT DEFAULT 0,                    -- Leads gerados por esta campanha
  started_at      DATE,
  ended_at        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ÍNDICES — aceleram as buscas mais comuns
-- ============================================================
CREATE INDEX idx_users_clinic_id       ON users(clinic_id);
CREATE INDEX idx_leads_clinic_id       ON leads(clinic_id);
CREATE INDEX idx_leads_stage_id        ON leads(stage_id);
CREATE INDEX idx_leads_assigned_to     ON leads(assigned_to);
CREATE INDEX idx_leads_phone           ON leads(phone);
CREATE INDEX idx_lead_events_lead_id   ON lead_events(lead_id);
CREATE INDEX idx_lead_events_clinic_id ON lead_events(clinic_id);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_appointments_clinic   ON appointments(clinic_id);
CREATE INDEX idx_appointments_date     ON appointments(scheduled_at);
CREATE INDEX idx_campaigns_clinic_id   ON campaigns(clinic_id);


-- ============================================================
-- RLS (Row Level Security) — ISOLAMENTO MULTI-TENANT
-- Cada usuário só vê os dados da própria clínica
-- ============================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE clinics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns         ENABLE ROW LEVEL SECURITY;


-- Função auxiliar: retorna o clinic_id do usuário logado
-- Evita repetir a subquery em cada política
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid();
$$;

-- Função auxiliar: retorna o role do usuário logado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;


-- ---- POLÍTICAS: clinics ----
-- Usuário só vê a clínica dele
CREATE POLICY "clinics: ver a própria clínica"
  ON clinics FOR SELECT
  USING (id = get_user_clinic_id());

-- Só owner pode editar dados da clínica
CREATE POLICY "clinics: owner pode editar"
  ON clinics FOR UPDATE
  USING (id = get_user_clinic_id() AND get_user_role() = 'owner');


-- ---- POLÍTICAS: users ----
-- Ver usuários da mesma clínica
CREATE POLICY "users: ver da mesma clínica"
  ON users FOR SELECT
  USING (clinic_id = get_user_clinic_id());

-- Owner pode convidar/editar usuários
CREATE POLICY "users: owner gerencia equipe"
  ON users FOR ALL
  USING (clinic_id = get_user_clinic_id() AND get_user_role() = 'owner');

-- Usuário pode ver e editar o próprio perfil
CREATE POLICY "users: editar próprio perfil"
  ON users FOR UPDATE
  USING (id = auth.uid());


-- ---- POLÍTICAS: pipeline_stages ----
CREATE POLICY "stages: ver da própria clínica"
  ON pipeline_stages FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "stages: owner e gestor gerenciam"
  ON pipeline_stages FOR ALL
  USING (clinic_id = get_user_clinic_id() AND get_user_role() IN ('owner', 'gestor'));


-- ---- POLÍTICAS: leads ----
CREATE POLICY "leads: ver da própria clínica"
  ON leads FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "leads: criar na própria clínica"
  ON leads FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "leads: editar da própria clínica"
  ON leads FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

-- Só owner e gestor podem deletar leads
CREATE POLICY "leads: owner e gestor podem deletar"
  ON leads FOR DELETE
  USING (clinic_id = get_user_clinic_id() AND get_user_role() IN ('owner', 'gestor'));


-- ---- POLÍTICAS: lead_events ----
CREATE POLICY "eventos: ver da própria clínica"
  ON lead_events FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "eventos: registrar na própria clínica"
  ON lead_events FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());


-- ---- POLÍTICAS: conversations ----
CREATE POLICY "conversas: ver da própria clínica"
  ON conversations FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "conversas: enviar na própria clínica"
  ON conversations FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());


-- ---- POLÍTICAS: appointments ----
CREATE POLICY "agenda: ver da própria clínica"
  ON appointments FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "agenda: criar e editar na própria clínica"
  ON appointments FOR ALL
  USING (clinic_id = get_user_clinic_id());


-- ---- POLÍTICAS: campaigns ----
-- Campanhas só são visíveis para owner e gestor
CREATE POLICY "campanhas: só owner e gestor veem"
  ON campaigns FOR SELECT
  USING (clinic_id = get_user_clinic_id() AND get_user_role() IN ('owner', 'gestor'));

CREATE POLICY "campanhas: só owner e gestor gerenciam"
  ON campaigns FOR ALL
  USING (clinic_id = get_user_clinic_id() AND get_user_role() IN ('owner', 'gestor'));


-- ============================================================
-- DADOS INICIAIS — Etapas padrão do pipeline
-- Inseridas via função para ser chamada ao criar uma clínica nova
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_pipeline_stages(p_clinic_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO pipeline_stages (clinic_id, name, color, position) VALUES
    (p_clinic_id, 'Novo Lead',             '#6366f1', 1),  -- roxo
    (p_clinic_id, 'Contato Iniciado',      '#3b82f6', 2),  -- azul
    (p_clinic_id, 'Qualificado',           '#f59e0b', 3),  -- amarelo
    (p_clinic_id, 'Agendamento Pendente',  '#f97316', 4),  -- laranja
    (p_clinic_id, 'Consulta Marcada',      '#8b5cf6', 5),  -- violeta
    (p_clinic_id, 'Compareceu',            '#06b6d4', 6),  -- ciano
    (p_clinic_id, 'Venda Realizada',       '#22c55e', 7),  -- verde
    (p_clinic_id, 'Perdido',               '#ef4444', 8);  -- vermelho
END;
$$;
