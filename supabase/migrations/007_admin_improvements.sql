-- ============================================================
-- CibridoCRM — Melhorias do Painel Admin
-- Versão: 007 | Data: 18/04/2026
-- Inclui: soft delete em convites, notas internas, notificações
-- ============================================================

-- Soft delete em convites (deletado = deleted_at preenchido)
ALTER TABLE invites ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================
-- TABELA: admin_notes
-- Anotações internas de Davi/Ricardo por clínica
-- Nunca exposta ao dentista
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_clinic ON admin_notes(clinic_id);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: admin_notifications
-- Notificações internas (ex: nova clínica ativou conta)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       TEXT NOT NULL,       -- 'clinic_activated' | 'payment_failed' etc.
  clinic_id  UUID REFERENCES clinics(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGER: notifica admin quando convite é marcado como 'used'
-- ============================================================
CREATE OR REPLACE FUNCTION notify_admin_on_invite_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'used' AND OLD.status != 'used' AND NEW.clinic_id IS NOT NULL THEN
    INSERT INTO admin_notifications (type, clinic_id, message)
    VALUES (
      'clinic_activated',
      NEW.clinic_id,
      'Nova clínica ativou a conta via convite (' || NEW.email || ')'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_invite_used ON invites;

CREATE TRIGGER trg_notify_admin_invite_used
  AFTER UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_invite_used();
