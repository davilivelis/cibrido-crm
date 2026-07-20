-- 009 — S3: conversas vivas (webhook de entrada + chat realtime)
-- Exportada pro repo em 20/07/2026 (estava só no banco de produção — base sólida).
-- Idempotente: segura rodar contra banco existente E provisiona banco novo.

-- Instância Evolution -> clínica (multi-tenant do webhook de entrada)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_instance text;

-- Índices de leitura do chat
CREATE INDEX IF NOT EXISTS idx_conversations_lead_created ON conversations (lead_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_clinic_created ON conversations (clinic_id, created_at DESC);

-- Dedup de mensagens do webhook (Evolution pode reenviar o mesmo evento)
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_external_id ON conversations (external_id) WHERE external_id IS NOT NULL;

-- Realtime: o painel escuta INSERTs de conversas
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;
END $$;
