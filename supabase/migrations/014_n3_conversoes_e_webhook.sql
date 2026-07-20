-- 014 — N3 (faturamento) + campo de webhook de integração (Tintim/Trinks/sistema clínico)
-- Aplicada em produção 20/07/2026. Idempotente.

-- Conversões: "quem comprou e por quanto" (N3). Fonte: webhook externo OU manual.
CREATE TABLE IF NOT EXISTS conversions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id        uuid REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id    uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  source         text NOT NULL DEFAULT 'manual',  -- 'manual' | 'trinks' | 'tintim' | 'webhook' ...
  external_id    text,                             -- id do evento na origem (dedup)
  value          numeric NOT NULL DEFAULT 0,       -- valor da venda/comanda
  description    text,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  raw            jsonb,                            -- payload original (debug)
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversions_clinic   ON conversions (clinic_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_campaign ON conversions (campaign_id) WHERE campaign_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversions_dedup ON conversions (clinic_id, external_id) WHERE external_id IS NOT NULL;

ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversoes: ver da própria clínica" ON conversions;
CREATE POLICY "conversoes: ver da própria clínica" ON conversions
  FOR SELECT USING (clinic_id = get_user_clinic_id());

-- Campo de webhook de integração por clínica (o cliente pluga Tintim/Trinks/sistema)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS webhook_in_token   text;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS webhook_out_url    text;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS webhook_out_secret text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_webhook_in_token ON clinics (webhook_in_token) WHERE webhook_in_token IS NOT NULL;
