-- ============================================================
-- CibridoCRM — Módulo de Recall
-- Versão: 003
-- Recall = paciente que precisa retornar à clínica
-- ============================================================

CREATE TABLE recalls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id     UUID NOT NULL REFERENCES leads(id)   ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id)            ON DELETE SET NULL,

  recall_date DATE NOT NULL,                        -- Data prevista para o retorno
  reason      TEXT NOT NULL,                        -- Ex: "Limpeza semestral", "Revisão pós-procedimento"
  notes       TEXT,                                 -- Observações livres

  -- Status do ciclo de recall
  status      TEXT NOT NULL DEFAULT 'pending',      -- pending | contacted | scheduled | done | cancelled

  contacted_at  TIMESTAMPTZ,                        -- Quando fez o primeiro contato
  resolved_at   TIMESTAMPTZ,                        -- Quando foi marcado como feito/cancelado

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recalls_clinic_id   ON recalls(clinic_id);
CREATE INDEX idx_recalls_lead_id     ON recalls(lead_id);
CREATE INDEX idx_recalls_recall_date ON recalls(recall_date);
CREATE INDEX idx_recalls_status      ON recalls(status);

-- RLS
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recalls: ver da própria clínica"
  ON recalls FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "recalls: criar na própria clínica"
  ON recalls FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "recalls: editar da própria clínica"
  ON recalls FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "recalls: deletar da própria clínica"
  ON recalls FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- Trigger updated_at
CREATE TRIGGER set_recalls_updated_at
  BEFORE UPDATE ON recalls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
