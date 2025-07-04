# Configuración Completa de Supabase para ContentFlow

## 🚀 **Funcionalidades Implementadas**

### ✅ **Autenticación Completa**
- [x] Login con email/contraseña
- [x] Registro con email/contraseña
- [x] OAuth con Google y LinkedIn
- [x] Restablecimiento de contraseña
- [x] Verificación de email
- [x] Manejo de errores de autenticación

### ✅ **Páginas y Componentes**
- [x] Página de login (`/auth/login`)
- [x] Página de registro (`/auth/signup`)
- [x] Página de reset password (`/auth/reset-password`)
- [x] Página de error (`/auth/auth-code-error`)
- [x] Callback OAuth (`/auth/callback`)
- [x] Dashboard protegido (`/dashboard`)
- [x] Onboarding (`/onboarding`)

### ✅ **Funcionalidades Avanzadas**
- [x] Creación automática de perfil
- [x] Suscripción trial automática
- [x] Tracking de uso
- [x] Redirección post-login
- [x] Middleware de protección
- [x] Validación de formularios con Zod

## 📋 **Configuración de Supabase**

### 1. **Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 2. **Configuración de Autenticación**

#### **A. Habilitar Proveedores**
1. Ve a **Authentication > Providers**
2. Habilita **Email** y **OAuth providers**
3. Para OAuth, configura Google y LinkedIn

#### **B. Configurar URLs de Redirección**
```
# URLs de redirección para OAuth
https://tu-dominio.com/auth/callback
http://localhost:3000/auth/callback
```

#### **C. Configurar Email Templates**
1. Ve a **Authentication > Email Templates**
2. Personaliza los templates de:
   - Confirmación de email
   - Restablecimiento de contraseña
   - Invitación

### 3. **Base de Datos**

#### **A. Ejecutar Schema**
```sql
-- Ejecuta el contenido de database-schema.sql
-- Esto creará todas las tablas necesarias
```

#### **B. Configurar RLS (Row Level Security)**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);
```

#### **C. Ejecutar Triggers**
```sql
-- Ejecuta el contenido de database-triggers.sql
-- Esto creará los triggers automáticos
```

### 4. **Configuración de OAuth**

#### **A. Google OAuth**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto y habilita Google+ API
3. Crea credenciales OAuth 2.0
4. Agrega las URLs de redirección autorizadas
5. Copia Client ID y Client Secret a Supabase

#### **B. LinkedIn OAuth**
1. Ve a [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Crea una aplicación
3. Configura las URLs de redirección
4. Copia Client ID y Client Secret a Supabase

## 🔧 **Configuración de Next.js**

### 1. **Middleware**
El middleware está configurado para:
- Proteger rutas `/dashboard` y `/onboarding`
- Redirigir usuarios autenticados desde rutas de auth
- Manejar errores de sesión

### 2. **Componentes**
- `AuthButton`: Botón de login/logout
- `LoginForm`: Formulario de login
- `SignupForm`: Formulario de registro
- `ResetPasswordForm`: Formulario de reset
- `AuthRedirectProvider`: Hook global para redirecciones

### 3. **Hooks**
- `useAuth`: Hook para manejo de autenticación
- `useAuthRedirect`: Hook para redirecciones automáticas

## 🧪 **Testing**

### 1. **Flujo de Registro**
1. Ve a `/auth/signup`
2. Completa el formulario
3. Verifica que se cree el usuario en Supabase
4. Verifica que se cree el perfil automáticamente
5. Verifica que se cree la suscripción trial

### 2. **Flujo de Login**
1. Ve a `/auth/login`
2. Inicia sesión
3. Verifica redirección al dashboard
4. Verifica que aparezca el botón de logout

### 3. **Flujo OAuth**
1. Haz clic en Google/LinkedIn
2. Completa la autenticación
3. Verifica redirección al callback
4. Verifica redirección al dashboard

### 4. **Flujo de Reset Password**
1. Ve a `/auth/login`
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Verifica que llegue el email
5. Haz clic en el enlace
6. Cambia la contraseña

## 🚨 **Solución de Problemas**

### **Error: AuthSessionMissingError**
- Verifica que no haya llamadas a `getCurrentUser()` en Server Components
- Asegúrate de que las páginas públicas no usen autenticación

### **Error: OAuth no funciona**
- Verifica las URLs de redirección en Supabase
- Verifica las credenciales OAuth
- Verifica que los dominios estén autorizados

### **Error: Triggers no funcionan**
- Verifica que los triggers estén ejecutados en Supabase
- Verifica los permisos de las funciones
- Revisa los logs de Supabase

### **Error: RLS bloquea acceso**
- Verifica que las políticas estén correctamente configuradas
- Verifica que el usuario esté autenticado
- Revisa los logs de Supabase

## 📞 **Soporte**

Si encuentras problemas:
1. Revisa los logs de Supabase
2. Verifica la configuración de variables de entorno
3. Asegúrate de que todos los archivos estén en su lugar
4. Contacta al equipo de desarrollo

---

**¡ContentFlow está listo para usar! 🎉** 