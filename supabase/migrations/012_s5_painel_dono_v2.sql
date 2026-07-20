-- 012 — S5: painel do dono v2 (motivo de bloqueio + visão de uso por clínica)
-- Exportada pro repo em 20/07/2026 (estava só no banco de produção).

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS blocked_reason text;

-- Uso por clínica (último acesso/atividade + volumes) — lida só pelo admin
CREATE OR REPLACE VIEW admin_clinic_usage WITH (security_invoker = true) AS
SELECT c.id AS clinic_id,
  (SELECT count(*) FROM leads l         WHERE l.clinic_id  = c.id) AS leads_count,
  (SELECT count(*) FROM appointments a  WHERE a.clinic_id  = c.id) AS appointments_count,
  (SELECT count(*) FROM conversations cv WHERE cv.clinic_id = c.id) AS conversations_count,
  GREATEST(
    (SELECT max(created_at) FROM leads l         WHERE l.clinic_id  = c.id),
    (SELECT max(created_at) FROM appointments a  WHERE a.clinic_id  = c.id),
    (SELECT max(created_at) FROM conversations cv WHERE cv.clinic_id = c.id)
  ) AS last_activity
FROM clinics c;
