# Sistema de Gestión de Archivos

Sistema completo de gestión de documentos con flujo de aprobación multi-área, autenticación basada en roles y almacenamiento en Azure Blob Storage.

## 🚀 Características

- ✅ Autenticación y autorización basada en roles (RBAC)
- ✅ Flujo de aprobación por múltiples áreas
- ✅ Gestión de archivos con versionado
- ✅ Almacenamiento en Azure Blob Storage
- ✅ Historial completo de acciones (audit trail)
- ✅ Sistema de comentarios y devoluciones
- ✅ Dashboard personalizado por rol
- ✅ Notificaciones de estado

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Azure)
- **Almacenamiento**: Azure Blob Storage
- **Autenticación**: NextAuth.js con JWT
- **Validación**: Zod
- **Estado**: React Query (TanStack Query)

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL (Azure o local)
- Cuenta de Azure Storage
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd gestor-archivos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env.local` y configura las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Database
DB_HOST=tu-servidor.postgres.database.azure.com
DB_PORT=5432
DB_NAME=gestion_archivos_db
DB_USER=tu-usuario
DB_PASSWORD='tu-contraseña'

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secreto-aleatorio

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=tu-cuenta
AZURE_STORAGE_KEY=tu-key
AZURE_CONTAINER_NAME=archivos-gestion
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. **Configurar la base de datos**

Ejecuta los scripts en orden:

```bash
# 1. Crear esquema
psql -h <host> -U <user> -d <database> -f database/schema.sql

# 2. Ejecutar migración de autenticación
psql -h <host> -U <user> -d <database> -f database/migration-auth.sql

# 3. Crear usuarios de prueba
npm run db:seed

# 4. (Opcional) Crear datos de demostración
npm run db:demo
```

O usa los scripts de Node.js:

```bash
# Verificar conexión
npm run db:test

# Crear usuarios
npm run db:seed

# Datos de prueba
npm run db:demo
```

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👥 Usuarios de Prueba

Todos los usuarios tienen la contraseña: `password123`

| Email | Rol | Descripción |
|-------|-----|-------------|
| `usuario@sistema.com` | USER | Usuario normal - Crea casos |
| `comercial@sistema.com` | COMERCIAL | Área comercial - Revisa documentos comerciales |
| `tecnica@sistema.com` | TECNICA | Área técnica - Revisa aspectos técnicos |
| `financiera@sistema.com` | FINANCIERA | Área financiera - Revisa aspectos financieros |
| `legal@sistema.com` | LEGAL | Área legal - Revisa aspectos legales |
| `admin@sistema.com` | ADMIN | Administrador - Acceso total |

## 📖 Flujo de Trabajo

### Para Usuarios Normales

1. **Crear Caso**: Ir a "Mis Casos" → "Nuevo Caso"
2. **Subir Archivos**: Agregar documentos necesarios
3. **Enviar para Revisión**: Click en "Enviar para Revisión"
4. **Seguimiento**: Ver el progreso en el flujo de aprobación
5. **Correcciones**: Si es devuelto, corregir y reenviar

### Para Áreas de Revisión

1. **Ver Casos Pendientes**: Ir a "Revisar"
2. **Abrir Caso**: Click en un caso asignado
3. **Revisar Documentos**: Ver archivos en la pestaña "Archivos"
4. **Tomar Acción**:
   - **Aprobar**: Avanza al siguiente paso
   - **Devolver**: Regresa al usuario con comentarios

### Flujo de Aprobación

```
Usuario → Comercial → Técnica → Financiera → Legal → Aprobado
           ↓           ↓          ↓           ↓
        Devolver    Devolver   Devolver   Devolver
           ↓           ↓          ↓           ↓
        Usuario ← ← ← ← ← ← ← ← ← ← ← ← ← Usuario
```

## 🗂️ Estructura del Proyecto

```
gestor-archivos/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Rutas protegidas
│   │   ├── cases/          # Gestión de casos
│   │   ├── review/         # Revisión de casos
│   │   └── admin/          # Administración
│   ├── api/                # API Routes
│   │   ├── auth/           # Autenticación
│   │   ├── cases/          # CRUD de casos
│   │   ├── files/          # Gestión de archivos
│   │   └── flow/           # Flujo de aprobación
│   └── login/              # Página de login
├── components/              # Componentes React
│   ├── cases/              # Componentes de casos
│   ├── files/              # Componentes de archivos
│   ├── flow/               # Componentes de flujo
│   ├── history/            # Componentes de historial
│   └── shared/             # Componentes compartidos
├── database/                # Scripts de base de datos
│   ├── schema.sql          # Esquema completo
│   ├── migration-auth.sql  # Migración de autenticación
│   ├── seed-with-bcrypt.js # Usuarios de prueba
│   └── seed-demo-data.js   # Datos de demostración
├── hooks/                   # Custom React Hooks
├── lib/                     # Utilidades y configuración
│   ├── auth/               # Configuración de autenticación
│   ├── azure/              # Cliente de Azure Blob
│   ├── db/                 # Cliente de PostgreSQL
│   ├── utils/              # Utilidades generales
│   └── validations/        # Esquemas de validación Zod
├── services/                # Lógica de negocio
├── types/                   # Definiciones de TypeScript
└── middleware.ts            # Middleware de Next.js
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Sesiones JWT firmadas con secret seguro
- Timeout de sesión de 8 horas
- Validación de permisos en cada endpoint
- Protección contra acceso no autorizado
- Audit trail completo de acciones

## 📊 Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema
- `cases` - Casos/expedientes
- `files` - Archivos subidos
- `workflow_templates` - Plantillas de flujo
- `workflow_steps` - Pasos del flujo
- `case_workflows` - Instancias de flujo
- `workflow_step_progress` - Progreso de cada paso
- `comments` - Comentarios en casos
- `audit_log` - Registro de auditoría
- `notifications` - Notificaciones
- `user_sessions` - Sesiones activas

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter

# Base de datos
npm run db:test          # Verificar conexión
npm run db:seed          # Crear usuarios de prueba
npm run db:demo          # Crear datos de demostración
npm run db:migrate       # Ejecutar migración de autenticación

# Utilidades
npm run check            # Verificar configuración
```

## 📝 Documentación Adicional

- [AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md) - Guía de configuración de autenticación
- [FASE2_COMPLETADA.md](./FASE2_COMPLETADA.md) - Resumen de la Fase 2
- [AZURE_SETUP.md](./AZURE_SETUP.md) - Configuración de Azure
- [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) - Guía de inicio rápido

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

```bash
# Verificar conexión
npm run db:test

# Verificar que la contraseña esté entre comillas en .env.local
DB_PASSWORD='tu-contraseña'
```

### Error de autenticación

```bash
# Verificar que NEXTAUTH_SECRET esté configurado
# Generar nuevo secret
openssl rand -base64 32
```

### Archivos no se suben

- Verificar credenciales de Azure Storage
- Verificar que el contenedor exista
- Verificar permisos de escritura

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Autor

Desarrollado para Comware

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo.
