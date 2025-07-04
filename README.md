# ContentFlow

Una aplicación moderna para gestión de contenido construida con Next.js 14, TypeScript y Tailwind CSS con autenticación completa usando Supabase.

## 🚀 Tech Stack

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript estricto
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Autenticación**: Supabase Auth
- **Base de Datos**: Supabase (PostgreSQL)
- **Linting**: ESLint + Prettier

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── auth/
│   │   ├── login/           # Página de login
│   │   ├── signup/          # Página de registro
│   │   ├── reset-password/  # Restablecer contraseña
│   │   ├── callback/        # Callback OAuth
│   │   └── auth-code-error/ # Página de error OAuth
│   ├── dashboard/           # Dashboard principal
│   ├── onboarding/          # Onboarding de usuarios
│   ├── layout.tsx           # Layout raíz con metadata
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globales
├── components/
│   ├── auth/                # Componentes de autenticación
│   └── ui/                  # Componentes shadcn/ui
├── lib/
│   ├── auth.ts              # Cliente de autenticación
│   ├── auth-server.ts       # Autenticación servidor
│   ├── supabase.ts          # Cliente Supabase
│   ├── database.types.ts    # Tipos de base de datos
│   └── utils.ts             # Utilidades
└── types/
    └── index.ts             # Tipos globales
```

## 🛠️ Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
   ```

3. **Configurar base de datos**:
   - Ejecutar `database-schema.sql` en tu proyecto Supabase
   - Ejecutar `database-triggers.sql` para triggers automáticos
   - Configurar políticas RLS según `SUPABASE_SETUP.md`

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 🔐 Sistema de Autenticación

### Funcionalidades Implementadas:
- ✅ Autenticación por email/contraseña
- ✅ OAuth con Google y LinkedIn
- ✅ Verificación de email
- ✅ Restablecimiento de contraseña
- ✅ Redirección automática post-login
- ✅ Creación automática de perfil y suscripción trial
- ✅ Validación de formularios
- ✅ Manejo de errores y estados de carga
- ✅ Middleware de protección de rutas
- ✅ Hook personalizado para autenticación

### Flujo de Usuario:
1. **Nuevo usuario**: Registro → Verificación email → Onboarding → Dashboard
2. **Usuario existente**: Login → Dashboard (si onboarding completo) o Onboarding

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar ESLint
- `npm run type-check` - Verificar tipos TypeScript

## 🎨 Configuración de shadcn/ui

El proyecto está configurado con shadcn/ui. Para agregar nuevos componentes:

```bash
npx shadcn-ui@latest add button
```

## 🔧 Configuraciones

- **TypeScript**: Configuración estricta con paths aliases
- **Tailwind**: Configurado con preset de shadcn/ui
- **ESLint**: Reglas estrictas para TypeScript
- **Prettier**: Formateo automático con plugin de Tailwind
- **Supabase**: Cliente singleton para evitar múltiples instancias

## 📦 Dependencias Principales

- `next@14.0.4` - Framework React
- `react@18.2.0` - Biblioteca React
- `typescript@5.3.3` - TypeScript
- `tailwindcss@3.4.0` - Framework CSS
- `@supabase/supabase-js` - Cliente Supabase
- `@radix-ui/react-slot` - Componentes de UI
- `class-variance-authority` - Utilidades de clases
- `clsx` - Utilidades de clases condicionales
- `tailwind-merge` - Merge de clases Tailwind
- `react-hook-form` - Manejo de formularios
- `zod` - Validación de esquemas

## 📚 Documentación

- `SUPABASE_SETUP.md` - Configuración completa de Supabase
- `database-schema.sql` - Esquema de base de datos
- `database-triggers.sql` - Triggers automáticos

## 🎯 Próximos Pasos

1. ✅ Sistema de autenticación completo
2. 🔄 Implementar gestión de contenido
3. 🔄 Crear dashboard de administración
4. 🔄 Configurar testing
5. 🔄 Desplegar aplicación

---

Desarrollado con ❤️ usando Next.js 14 y Supabase
