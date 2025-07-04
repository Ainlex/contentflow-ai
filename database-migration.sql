-- Migración para agregar nuevos campos de onboarding a la tabla profiles
-- Ejecutar este SQL en el SQL Editor de Supabase

-- Agregar nuevos campos para onboarding avanzado
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_goals TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_voice_tone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_examples TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS key_messages TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS words_to_avoid TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_types TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posting_frequency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_themes TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_accounts JSONB;

-- Actualizar función de creación de usuario para incluir onboarding_completed
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
  INSERT INTO public.subscriptions (user_id, plan_type, status, trial_ends_at, created_at)
  VALUES (
    new.id,
    'trial',
    'active',
    (now() + interval '14 days'),
    now()
  );
  
  -- Crear registro de uso inicial
  INSERT INTO public.usage_tracking (user_id, month_year, ai_generations_used, social_accounts_connected, created_at)
  VALUES (
    new.id,
    to_char(now(), 'YYYY-MM'),
    0,
    0,
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la migración se aplicó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 