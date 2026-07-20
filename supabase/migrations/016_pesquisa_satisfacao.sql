-- 016 — Pesquisa de satisfação interna (nota do profissional + recepção + relatório)
-- Aplicada em produção 20/07/2026. Idempotente.

CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id      uuid REFERENCES appointments(id) ON DELETE SET NULL,
  lead_id             uuid REFERENCES leads(id) ON DELETE SET NULL,
  token               text NOT NULL UNIQUE,
  professional        text,          -- quem atendeu (copiado da consulta)
  reception_rating    int,           -- nota da recepção (1-5)
  professional_rating int,           -- nota do profissional (1-5)
  comment             text,
  status              text NOT NULL DEFAULT 'pending',  -- pending | responded
  sent_at             timestamptz,
  responded_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_surveys_clinic ON satisfaction_surveys (clinic_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_surveys_appointment ON satisfaction_surveys (appointment_id) WHERE appointment_id IS NOT NULL;

ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "surveys: ver da própria clínica" ON satisfaction_surveys;
CREATE POLICY "surveys: ver da própria clínica" ON satisfaction_surveys
  FOR SELECT USING (clinic_id = get_user_clinic_id());

-- Quem atende a consulta (pra agrupar a nota por profissional) — opcional
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS professional text;
