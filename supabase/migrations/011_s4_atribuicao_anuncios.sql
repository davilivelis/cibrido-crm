-- 011 — S4: atribuição de anúncios (link rastreável -> WhatsApp -> lead -> venda)
-- Exportada pro repo em 20/07/2026 (estava só no banco de produção).
-- Idempotente.

-- Código de rastreio por campanha
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tracking_code text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_tracking_code ON campaigns (tracking_code) WHERE tracking_code IS NOT NULL;

-- Lead carimbado com a campanha de origem (N1)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads (campaign_id) WHERE campaign_id IS NOT NULL;

-- WhatsApp público da clínica (destino do redirect do link rastreável)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Log de cliques dos links rastreáveis
CREATE TABLE IF NOT EXISTS tracking_clicks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  user_agent   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tracking_clicks_campaign ON tracking_clicks (campaign_id, created_at);

ALTER TABLE tracking_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cliques: ver da própria clínica" ON tracking_clicks;
CREATE POLICY "cliques: ver da própria clínica" ON tracking_clicks
  FOR SELECT USING (clinic_id = get_user_clinic_id());

-- Backfill: código de rastreio pra campanhas existentes (no-op em banco novo)
UPDATE campaigns SET tracking_code = upper(substr(md5(id::text || clock_timestamp()::text), 1, 5))
WHERE tracking_code IS NULL;
