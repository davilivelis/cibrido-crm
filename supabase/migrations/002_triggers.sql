-- ============================================================
-- CibridoCRM — Triggers e automações do banco
-- Versão: 002
-- ============================================================

-- ============================================================
-- TRIGGER: cria perfil público quando usuário se cadastra no Auth
--
-- Quando alguém se cadastra via supabase.auth.signUp(), o Supabase
-- cria o registro em auth.users automaticamente.
-- Este trigger lê os metadados passados no signUp e cria o
-- registro correspondente em public.users + public.clinics.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id UUID;
  v_clinic_name TEXT;
  v_clinic_slug TEXT;
  v_user_name TEXT;
  v_user_role TEXT;
BEGIN
  -- Lê metadados passados no signUp (raw_user_meta_data)
  v_user_name   := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_user_role   := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
  v_clinic_id   := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
  v_clinic_name := NEW.raw_user_meta_data->>'clinic_name';

  -- Se foi passado um clinic_id existente, vincula a ele
  -- Se não, cria uma nova clínica
  IF v_clinic_id IS NULL THEN
    v_clinic_name := COALESCE(v_clinic_name, 'Minha Clínica');
    v_clinic_slug := lower(regexp_replace(v_clinic_name, '[^a-zA-Z0-9]', '-', 'g'))
                     || '-' || substr(gen_random_uuid()::text, 1, 6);

    INSERT INTO clinics (name, slug)
    VALUES (v_clinic_name, v_clinic_slug)
    RETURNING id INTO v_clinic_id;

    -- Cria as 8 etapas padrão do pipeline para esta clínica
    PERFORM create_default_pipeline_stages(v_clinic_id);
  END IF;

  -- Cria o perfil do usuário
  INSERT INTO users (id, clinic_id, name, email, role)
  VALUES (NEW.id, v_clinic_id, v_user_name, NEW.email, v_user_role);

  RETURN NEW;
END;
$$;

-- Vincula o trigger ao evento de criação em auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- Aplica em todas as tabelas que têm esse campo
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
