-- 015 — credenciais do WhatsApp Cloud API oficial por clínica (anti-banimento)
-- Aplicada em produção 20/07/2026. Idempotente.
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS wa_cloud_phone_id text;  -- Phone Number ID da conta Meta da clínica
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS wa_cloud_token    text;  -- token de acesso (permanente) da conta Meta
