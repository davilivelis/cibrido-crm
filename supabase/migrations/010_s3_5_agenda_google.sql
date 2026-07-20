-- 010 — S3.5: agenda Google mão única (CRM -> Google via Service Account)
-- Exportada pro repo em 20/07/2026 (estava só no banco de produção).

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_calendar_id text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id text;
