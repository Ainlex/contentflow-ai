-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name, onboarding_completed, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'company_name', 'Mi Empresa'),
    FALSE,
    now(),
    now()
  );
  
  -- Crear suscripción trial
  INSERT INTO public.subscriptions (user_id, plan_type, status, trial_ends_at, created_at, updated_at)
  VALUES (
    new.id,
    'trial',
    'active',
    (now() + interval '14 days'),
    now(),
    now()
  );
  
  -- Crear registro de uso inicial
  INSERT INTO public.usage_tracking (user_id, month_year, ai_generations_used, social_accounts_connected, created_at, updated_at)
  VALUES (
    new.id,
    to_char(now(), 'YYYY-MM'),
    0,
    0,
    now(),
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de insertar un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para actualizar el perfil cuando se actualiza el usuario
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = new.email,
    updated_at = now()
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de actualizar un usuario
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update(); 