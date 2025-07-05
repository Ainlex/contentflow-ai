-- ContentFlow Settings Storage Configuration
-- Ejecutar este SQL en el SQL Editor de Supabase después del schema principal

-- Crear bucket para imágenes de perfil
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Política para permitir que los usuarios suban sus propias imágenes de perfil
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que los usuarios vean sus propias imágenes de perfil
CREATE POLICY "Users can view their own profile pictures" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que los usuarios actualicen sus propias imágenes de perfil
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que los usuarios eliminen sus propias imágenes de perfil
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Función para obtener la URL pública de una imagen de perfil
CREATE OR REPLACE FUNCTION get_profile_picture_url(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT 
      'https://your-supabase-url.supabase.co/storage/v1/object/public/profile-pictures/' || user_id || '/profile-picture.jpg'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpiar las imágenes de perfil cuando se elimina un usuario
CREATE OR REPLACE FUNCTION cleanup_profile_pictures()
RETURNS TRIGGER AS $$
BEGIN
  -- Eliminar todas las imágenes de perfil del usuario
  DELETE FROM storage.objects 
  WHERE bucket_id = 'profile-pictures' 
  AND name LIKE OLD.id::text || '/%';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para limpiar automáticamente
CREATE TRIGGER cleanup_profile_pictures_trigger
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_profile_pictures();

-- Índices adicionales para optimizar las consultas de configuración
CREATE INDEX IF NOT EXISTS idx_profiles_brand_voice_tone ON profiles(brand_voice_tone);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_company_size ON profiles(company_size);

-- Función para validar URLs
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar y validar datos de configuración
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar URL del sitio web
  IF NEW.website_url IS NOT NULL AND NEW.website_url != '' THEN
    IF NOT is_valid_url(NEW.website_url) THEN
      RAISE EXCEPTION 'Invalid website URL format';
    END IF;
  END IF;
  
  -- Limpiar espacios en blanco
  NEW.company_name = TRIM(NEW.company_name);
  NEW.industry = TRIM(NEW.industry);
  NEW.target_audience = TRIM(NEW.target_audience);
  NEW.key_messages = TRIM(NEW.key_messages);
  NEW.words_to_avoid = TRIM(NEW.words_to_avoid);
  
  -- Actualizar timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validación
CREATE TRIGGER validate_profile_data_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();

-- Vista para estadísticas de configuración
CREATE OR REPLACE VIEW profile_completion_stats AS
SELECT 
  id,
  email,
  company_name,
  CASE 
    WHEN company_name IS NOT NULL AND company_name != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN industry IS NOT NULL AND industry != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN company_size IS NOT NULL AND company_size != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN website_url IS NOT NULL AND website_url != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN target_audience IS NOT NULL AND target_audience != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN brand_voice_tone IS NOT NULL AND brand_voice_tone != '' THEN 1 ELSE 0 
  END +
  CASE 
    WHEN business_goals IS NOT NULL AND array_length(business_goals, 1) > 0 THEN 1 ELSE 0 
  END AS completion_score,
  ROUND(
    (CASE 
      WHEN company_name IS NOT NULL AND company_name != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN industry IS NOT NULL AND industry != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN company_size IS NOT NULL AND company_size != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN website_url IS NOT NULL AND website_url != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN target_audience IS NOT NULL AND target_audience != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN brand_voice_tone IS NOT NULL AND brand_voice_tone != '' THEN 1 ELSE 0 
    END +
    CASE 
      WHEN business_goals IS NOT NULL AND array_length(business_goals, 1) > 0 THEN 1 ELSE 0 
    END) * 100.0 / 7.0, 2
  ) AS completion_percentage
FROM profiles; 