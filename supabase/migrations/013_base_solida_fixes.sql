-- 013 — base sólida: match de telefone robusto + threads da caixa de entrada
-- Suporte aos fixes dos bugs da revisão (20/07/2026). Idempotente.

-- Telefone normalizado (só dígitos) pra casar o webhook de entrada com o lead,
-- sem tocar no telefone de exibição (que pode estar formatado, ex.: "(11) 99999-8888").
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_digits text
  GENERATED ALWAYS AS (regexp_replace(coalesce(phone, ''), '\D', '', 'g')) STORED;
CREATE INDEX IF NOT EXISTS idx_leads_phone_digits ON leads (clinic_id, phone_digits);

-- Caixa de entrada: última mensagem POR lead (não perde paciente antigo além das N recentes)
CREATE OR REPLACE VIEW conversation_threads WITH (security_invoker = true) AS
SELECT DISTINCT ON (c.lead_id)
  c.lead_id, c.clinic_id, c.content, c.direction, c.created_at,
  count(*) OVER (PARTITION BY c.lead_id) AS msg_count,
  l.name  AS lead_name,
  l.phone AS lead_phone
FROM conversations c
JOIN leads l ON l.id = c.lead_id
ORDER BY c.lead_id, c.created_at DESC;
