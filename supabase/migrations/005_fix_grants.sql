-- ============================================================
-- CibridoCRM — Fix de permissões (GRANTS)
-- Versão: 005
-- Motivo: service_role e authenticated sem GRANT nas tabelas
-- Aplicar via: Supabase Dashboard → SQL Editor
-- ============================================================

-- Garante USAGE no schema public para todos os roles relevantes
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grants completos para authenticated (usuários logados via app)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grants completos para service_role (admin, scripts, automações)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Garante que tabelas futuras também recebam os grants automaticamente
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
