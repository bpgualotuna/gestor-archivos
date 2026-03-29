# Sistema de Gestión de Archivos Basado en Casos

Sistema completo de gestión de archivos con flujo de aprobación multi-área, trazabilidad completa y almacenamiento en Azure Blob Storage.

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Tecnologías](#tecnologías)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Base de Datos](#base-de-datos)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [API Endpoints](#api-endpoints)
8. [Flujo del Sistema](#flujo-del-sistema)
9. [Componentes Principales](#componentes-principales)
10. [Despliegue](#despliegue)

## 🏗️ Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js App)          │
│  - React Components                     │
│  - React Query (Estado)                 │
│  - Tailwind CSS                         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      API Routes (Next.js Backend)       │
│  - Validación (Zod)                     │
│  - Manejo de Errores                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Capa de Servicios               │
│  - CaseService                          │
│  - FileService                          │
│  - FlowService                          │
│  - HistoryService                       │
└─────────────────────────────────────────┘
                    ↓
┌──────────────────┬──────────────────────┐
│   PostgreSQL     │   Azure Blob Storage │
│   (Metadata)     │   (Archivos)         │
└──────────────────┴──────────────────────┘
```

## 🛠️ Tecnologías

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

### Backend
- **Next.js API Routes** - Backend integrado
- **PostgreSQL** - Base de datos relacional
- **Azure Blob Storage** - Almacenamiento de archivos
- **Zod** - Validación de esquemas
- **bcryptjs** - Hash de contraseñas

## 📦 Instalación

### Prerrequisitos

- Node.js 20+
- PostgreSQL 14+
- Cuenta de Azure Storage
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd gestion-archivos-casos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_archivos
DB_USER=postgres
DB_PASSWORD=tu_password

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=tu_cuenta
AZURE_STORAGE_KEY=tu_key
AZURE_CONTAINER_NAME=gestion-archivos

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_secret_aleatorio
```

4. **Configurar la base de datos**
```bash
# Crear la base de datos
createdb gestion_archivos

# Ejecutar el schema
psql -d gestion_archivos -f database/schema.sql

# Insertar datos iniciales
psql -d gestion_archivos -f database/seed.sql
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Base de Datos PostgreSQL

El sistema utiliza PostgreSQL con las siguientes características:

- **Enums** para tipos de datos consistentes
- **Triggers** para auditoría automática
- **Vistas** para consultas optimizadas
- **Índices** para rendimiento
- **Transacciones** para integridad de datos

### Azure Blob Storage

Estructura de carpetas en Azure:
```
gestion-archivos/
├── case-{uuid}/
│   ├── v1/
│   │   └── archivo.pdf
│   ├── v2/
│   │   └── archivo.pdf
│   └── final/
│       └── archivo_firmado.pdf
```

## 🗄️ Base de Datos

### Tablas Principales

#### users
Usuarios del sistema con roles específicos.

#### cases
Casos principales con estado y metadata.

#### workflow_templates
Plantillas de flujo de aprobación configurables.

#### workflow_steps
Pasos individuales de cada workflow.

#### case_workflows
Instancia de workflow asignada a cada caso.

#### workflow_step_progress
Progreso de cada paso del workflow por caso.

#### files
Archivos con versionado y referencias a Azure Blob.

#### audit_log
Registro completo de auditoría del sistema.

#### comments
Comentarios y observaciones en los casos.

### Relaciones Clave

```
users ──┬─→ cases (created_by)
        ├─→ files (uploaded_by)
        ├─→ audit_log (user_id)
        └─→ comments (user_id)

cases ──┬─→ files (case_id)
        ├─→ case_workflows (case_id)
        ├─→ audit_log (case_id)
        └─→ comments (case_id)

workflow_templates ──→ workflow_steps
case_workflows ──→ workflow_step_progress
```

## 📁 Estructura del Proyecto

```
/
├── app/
│   ├── (dashboard)/          # Rutas protegidas
│   │   ├── layout.tsx        # Layout con sidebar
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── cases/
│   │   │   ├── page.tsx      # Lista de casos
│   │   │   ├── new/page.tsx  # Crear caso
│   │   │   └── [id]/page.tsx # Detalle de caso
│   │   ├── review/page.tsx   # Vista de revisión
│   │   └── admin/page.tsx    # Panel admin
│   ├── api/
│   │   ├── cases/
│   │   │   ├── route.ts      # GET, POST /api/cases
│   │   │   └── [id]/
│   │   │       ├── route.ts  # GET, PATCH /api/cases/:id
│   │   │       ├── files/route.ts
│   │   │       └── history/route.ts
│   │   ├── files/
│   │   │   └── upload/route.ts
│   │   └── flow/
│   │       ├── approve/route.ts
│   │       ├── return/route.ts
│   │       └── next/route.ts
│   ├── layout.tsx
│   ├── providers.tsx         # React Query Provider
│   └── globals.css
├── components/
│   ├── cases/
│   │   ├── CaseCard.tsx
│   │   ├── CaseDetail.tsx
│   │   └── CreateCaseForm.tsx
│   ├── files/
│   │   └── FileUploader.tsx
│   ├── flow/
│   │   └── FlowStepper.tsx
│   ├── history/
│   │   └── Timeline.tsx
│   └── shared/
│       └── StatusBadge.tsx
├── hooks/
│   ├── useCases.ts
│   ├── useCaseDetail.ts
│   ├── useUploadFile.ts
│   ├── useFlow.ts
│   └── useHistory.ts
├── lib/
│   ├── db/
│   │   └── index.ts          # Pool PostgreSQL
│   ├── azure/
│   │   └── blob-storage.ts   # Cliente Azure
│   ├── validations/
│   │   ├── case.schema.ts
│   │   ├── file.schema.ts
│   │   └── flow.schema.ts
│   └── utils/
│       ├── errors.ts
│       └── response.ts
├── services/
│   ├── case.service.ts
│   ├── file.service.ts
│   ├── flow.service.ts
│   └── history.service.ts
├── types/
│   ├── case.types.ts
│   ├── file.types.ts
│   ├── flow.types.ts
│   ├── history.types.ts
│   └── user.types.ts
├── database/
│   ├── schema.sql            # Schema completo
│   └── seed.sql              # Datos iniciales
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Casos

```
GET    /api/cases              # Obtener todos los casos
POST   /api/cases              # Crear nuevo caso
GET    /api/cases/:id          # Obtener caso por ID
PATCH  /api/cases/:id          # Actualizar caso
GET    /api/cases/:id/files    # Obtener archivos del caso
GET    /api/cases/:id/history  # Obtener historial del caso
```

### Archivos

```
POST   /api/files/upload       # Subir archivo
GET    /api/files/:id          # Obtener archivo
DELETE /api/files/:id          # Eliminar archivo
```

### Flujo de Aprobación

```
POST   /api/flow/next          # Obtener progreso del workflow
POST   /api/flow/approve       # Aprobar paso actual
POST   /api/flow/return        # Devolver caso para correcciones
```

### Ejemplo de Request

**POST /api/cases**
```json
{
  "title": "Contrato de Servicios 2024",
  "description": "Contrato anual de servicios de consultoría",
  "priority": 5
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "caseNumber": "2024-000001",
    "title": "Contrato de Servicios 2024",
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

## 🔄 Flujo del Sistema

### 1. Creación de Caso

```
Usuario → Crear Caso → Sistema asigna workflow → Estado: DRAFT
```

### 2. Subida de Archivos

```
Usuario → Sube archivos → Azure Blob Storage → BD guarda metadata
```

### 3. Envío para Revisión

```
Usuario → Enviar caso → Estado: SUBMITTED → Primer paso: IN_PROGRESS
```

### 4. Flujo de Aprobación

```
Comercial → Revisa → Aprueba/Rechaza/Devuelve
    ↓
Técnica → Revisa → Aprueba/Rechaza/Devuelve
    ↓
Financiera → Revisa → Aprueba/Rechaza/Devuelve
    ↓
Legal → Revisa → Aprueba/Rechaza/Devuelve → Sube archivo firmado
    ↓
Estado: COMPLETED
```

### 5. Devolución

```
Cualquier área → Devolver → Estado: RETURNED → Usuario corrige → Reenvía
```

## 🧩 Componentes Principales

### CaseCard
Tarjeta de caso con información resumida.

### FlowStepper
Visualización del progreso del workflow con indicadores visuales.

### Timeline
Historial completo de acciones en formato timeline.

### FileUploader
Componente de subida de archivos con drag & drop.

### StatusBadge
Badge de estado con colores según el estado del caso.

## 🚀 Despliegue

### Vercel (Recomendado para Next.js)

1. **Conectar repositorio a Vercel**
2. **Configurar variables de entorno**
3. **Configurar PostgreSQL** (Vercel Postgres o externo)
4. **Desplegar**

### Variables de Entorno en Producción

```env
DB_HOST=tu-db-host.com
DB_PORT=5432
DB_NAME=gestion_archivos_prod
DB_USER=prod_user
DB_PASSWORD=secure_password

AZURE_STORAGE_ACCOUNT=prod_account
AZURE_STORAGE_KEY=prod_key
AZURE_CONTAINER_NAME=gestion-archivos-prod

NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=secret_muy_seguro_aleatorio
NODE_ENV=production
```

### Consideraciones de Producción

1. **Seguridad**
   - Usar HTTPS
   - Implementar rate limiting
   - Validar todos los inputs
   - Sanitizar datos

2. **Performance**
   - Habilitar caché de React Query
   - Optimizar queries de BD
   - Usar CDN para assets estáticos
   - Implementar lazy loading

3. **Monitoreo**
   - Logs estructurados
   - Métricas de performance
   - Alertas de errores
   - Monitoreo de BD

4. **Backup**
   - Backup diario de PostgreSQL
   - Replicación de Azure Blob
   - Plan de recuperación

## 📝 Notas Importantes

### Autenticación

El sistema está preparado para NextAuth pero requiere configuración adicional:

1. Instalar y configurar NextAuth
2. Implementar providers (credentials, OAuth, etc.)
3. Proteger rutas con middleware
4. Obtener userId de la sesión en API routes

### Mejoras Futuras

- [ ] Implementar autenticación completa
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda avanzada de casos
- [ ] Exportación de reportes
- [ ] Dashboard de métricas
- [ ] Integración con firma electrónica
- [ ] App móvil

### Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** 2024
