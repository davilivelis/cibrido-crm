-- 017 — modelo comercial por assentos: limite de membros por clínica
-- Aplicada em produção 20/07/2026. Idempotente.
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS seat_limit int NOT NULL DEFAULT 3;
