# Configuración de Supabase para ContentFlow

## Pasos para completar la integración

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL y las claves API

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

### 3. Ejecutar el schema de la base de datos
1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `database-schema.sql`
3. Ejecuta el script

### 4. Verificar la configuración
Los siguientes archivos ya están creados y configurados:

- ✅ `lib/supabase.ts` - Cliente de Supabase
- ✅ `lib/database.types.ts` - Tipos TypeScript
- ✅ `lib/auth.ts` - Helpers de autenticación
- ✅ `middleware.ts` - Middleware de autenticación
- ✅ `database-schema.sql` - Schema de la base de datos

### 5. Funcionalidades disponibles

#### Autenticación
```typescript
import { getCurrentUser, getCurrentProfile } from '@/lib/auth'

// En Server Components
const user = await getCurrentUser()
const profile = await getCurrentProfile()
```

#### Cliente de Supabase
```typescript
import { supabase } from '@/lib/supabase'

// En Client Components
const { data, error } = await supabase
  .from('profiles')
  .select('*')
```

#### Helpers de perfil
```typescript
import { upsertProfile, getUserSubscription, getUserUsage } from '@/lib/auth'

// Crear/actualizar perfil
await upsertProfile({
  id: user.id,
  email: user.email,
  company_name: 'Mi Empresa',
  industry: 'Tecnología',
  brand_voice: 'Profesional'
})

// Obtener suscripción
const subscription = await getUserSubscription()

// Obtener uso del mes
const usage = await getUserUsage()
```

### 6. Estructura de la base de datos

#### Tabla `profiles`
- Extiende `auth.users` de Supabase
- Almacena información adicional del usuario
- Se crea automáticamente al registrarse

#### Tabla `subscriptions`
- Gestiona planes de suscripción
- Tipos: trial, starter, professional, enterprise
- Estados: active, cancelled, past_due

#### Tabla `usage_tracking`
- Rastrea el uso mensual
- Generaciones de AI y cuentas sociales conectadas
- Formato de mes: '2024-01'

### 7. Seguridad
- Row Level Security (RLS) habilitado
- Políticas para que usuarios solo vean sus propios datos
- Trigger automático para crear perfiles

### 8. Próximos pasos
1. Configurar autenticación en la UI
2. Crear componentes de login/registro
3. Implementar gestión de suscripciones
4. Agregar tracking de uso

## Solución de problemas

### Error de tipos TypeScript
Si ves errores de tipos, asegúrate de que:
1. El archivo `lib/database.types.ts` existe
2. Las variables de entorno están configuradas
3. El schema se ejecutó correctamente en Supabase

### Error de conexión
Verifica que:
1. Las variables de entorno son correctas
2. El proyecto de Supabase está activo
3. Las claves API son válidas 