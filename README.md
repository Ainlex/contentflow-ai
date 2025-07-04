# ContentFlow

Una aplicación moderna para gestión de contenido construida con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript estricto
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Linting**: ESLint + Prettier

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx      # Layout raíz con metadata
│   ├── page.tsx        # Página principal
│   └── globals.css     # Estilos globales
├── components/
│   └── ui/             # Componentes shadcn/ui
├── lib/
│   └── utils.ts        # Utilidades shadcn
└── types/
    └── index.ts        # Tipos globales
```

## 🛠️ Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

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

## 📦 Dependencias Principales

- `next@14.0.4` - Framework React
- `react@18.2.0` - Biblioteca React
- `typescript@5.3.3` - TypeScript
- `tailwindcss@3.4.0` - Framework CSS
- `@radix-ui/react-slot` - Componentes de UI
- `class-variance-authority` - Utilidades de clases
- `clsx` - Utilidades de clases condicionales
- `tailwind-merge` - Merge de clases Tailwind

## 🎯 Próximos Pasos

1. Configurar autenticación
2. Implementar base de datos
3. Crear componentes específicos
4. Configurar testing
5. Desplegar aplicación

---

Desarrollado con ❤️ usando Next.js 14
