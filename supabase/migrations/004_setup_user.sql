-- ============================================================
-- CibridoCRM — Setup de usuário sem clínica vinculada
-- Versão: 004
-- Resolve o caso em que o trigger handle_new_user falhou
-- na criação da clínica + perfil do usuário
-- ============================================================

-- Função SECURITY DEFINER: roda como superuser, bypassa RLS
-- Cria clinic + user profile + pipeline stages em uma única chamada
CREATE OR REPLACE FUNCTION setup_first_user(
  p_user_id    UUID,
  p_user_email TEXT,
  p_user_name  TEXT DEFAULT 'Usuário'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  -- Se usuário já tem perfil com clínica, apenas retorna o clinic_id
  SELECT clinic_id INTO v_clinic_id
  FROM public.users
  WHERE id = p_user_id;

  IF v_clinic_id IS NOT NULL THEN
    RETURN v_clinic_id;
  END IF;

  -- Cria a clínica com nome padrão
  INSERT INTO public.clinics (name, slug, plan, is_active)
  VALUES (
    'Minha Clínica',
    'clinica-' || substr(p_user_id::text, 1, 8),
    'trial',
    true
  )
  RETURNING id INTO v_clinic_id;

  -- Cria o perfil do usuário como owner
  INSERT INTO public.users (id, clinic_id, name, email, role, is_active)
  VALUES (p_user_id, v_clinic_id, p_user_name, p_user_email, 'owner', true)
  ON CONFLICT (id) DO UPDATE SET clinic_id = v_clinic_id;

  -- Cria as 8 etapas padrão do pipeline
  PERFORM create_default_pipeline_stages(v_clinic_id);

  RETURN v_clinic_id;
END;
$$;

-- Garante que qualquer usuário autenticado pode chamar essa função
GRANT EXECUTE ON FUNCTION setup_first_user(UUID, TEXT, TEXT) TO authenticated;
