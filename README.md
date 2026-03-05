# 💧 Acueducto Manager

**Acueducto Manager** es un sistema integral de administración de pagos y gestión para acueductos rurales. Diseñado con una interfaz moderna, minimalista y profesional, facilita la gestión de usuarios, facturación mensual, registro de pagos y control de morosidad, optimizando el trabajo de administradores y cajeros.

## ✨ Características Principales

- **Dashboard Financiero:** Vista general del estado financiero, ingresos, pagos recientes y métricas clave.
- **Gestión de Usuarios:** Creación, lectura, actualización y eliminación (CRUD) de usuarios del acueducto y la gestión de sus direcciones.
- **Categorías Tarifarias:** Configuración y administración de diferentes tarifas y categorías de servicio residencial o comercial.
- **Facturación Mensual:** Generación automatizada y seguimiento de recibos o facturas del acueducto.
- **Registro de Pagos:** Registro rápido de pagos, seguimiento de facturas pagadas y control de usuarios en mora.
- **Roles y Accesos:** Control de acceso basado en roles (Administrador, Cajero) para garantizar la seguridad de los datos.
- **Autenticación Segura:** Sistema de login seguro e integración con Supabase.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con un stack tecnológico moderno para garantizar escalabilidad, rendimiento y una excelente experiencia de usuario:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Librería UI:** [React 18](https://react.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Backend / Auth:** [Supabase](https://supabase.com/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

## 📁 Estructura de Carpetas

El proyecto sigue una arquitectura modular y escalable basada en *Features* (características funcionales) para mantener un código limpio y separado por contextos de dominio:

```text
aqueducto-manager/
├── src/
│   ├── app/                # App Router de Next.js (páginas, ruteo y layouts)
│   │   ├── (dashboard)/    # Rutas protegidas del panel principal (usuarios, pagos, etc.)
│   │   ├── login/          # Página de autenticación
│   │   ├── globals.css     # Estilos globales e importación de Tailwind
│   │   └── layout.tsx      # Layout principal de la aplicación
│   ├── components/         # Componentes de presentación genéricos y reutilizables
│   │   ├── auth/           # Componentes visuales de autenticación
│   │   ├── layout/         # Componentes de estructura (Sidebar, Navbar, etc.)
│   │   └── ui/             # Componentes base de la interfaz (Botones, Inputs, Cards)
│   ├── features/           # Módulos funcionales y de negocio independientes
│   │   ├── auth/           # Lógica, servicios y estado de autenticación
│   │   ├── facturacion/    # Generación y administración de recibos
│   │   ├── pagos/          # Lógica para registro y seguimiento de pagos
│   │   ├── reportes/       # Lógica del dashboard y reportes financieros
│   │   └── usuarios/       # Gestión del CRUD de usuarios del acueducto
│   └── lib/                # Utilidades, helpers y clientes externos
│       ├── supabaseClient.ts # Cliente de Supabase para el navegador
│       ├── supabaseServer.ts # Cliente de Supabase para el servidor
│       └── utils.ts        # Funciones utilitarias generales
├── public/                 # Archivos e imágenes estáticas
├── package.json            # Dependencias y scripts del proyecto
├── middleware.ts           # Middleware de Next.js (protección de rutas y sesiones)
├── tailwind.config.ts      # Configuración y temas de Tailwind CSS
└── tsconfig.json           # Configuración de TypeScript
```

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- npm, yarn, pnpm o bun (gestores de paquetes)
- Una cuenta y proyecto en [Supabase](https://supabase.com/)

## 🛠️ Instalación y Configuración

1. **Navega al directorio del proyecto** (o clona el repositorio si aplica):
   ```bash
   cd aqueducto-manager
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura las variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de configuración de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación localmente.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Construye la aplicación optimizada para producción.
- `npm run start`: Inicia el servidor de producción (después de realizar el build).
- `npm run lint`: Ejecuta el linter (ESLint) para analizar y reportar problemas en el código.

---
*Diseñado y desarrollado para optimizar la gestión de acueductos rurales mediante tecnología ágil, moderna y accesible.*
