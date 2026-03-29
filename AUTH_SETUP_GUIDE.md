# Guía de Configuración de Autenticación

## 🎯 Resumen de Cambios

Se ha implementado un sistema completo de autenticación y autorización basado en roles (RBAC) con las siguientes características:

### ✅ Completado

1. **Autenticación con NextAuth.js**
   - Login con email/password
   - Sesiones JWT (8 horas)
   - Protección de rutas con middleware

2. **Sistema de Roles**
   - USER: Usuario normal (solo ve sus casos)
   - ADMIN: Administrador (ve todo)
   - AREA_COMERCIAL: Área comercial
   - AREA_TECNICA: Área técnica
   - AREA_FINANCIERA: Área financiera
   - AREA_LEGAL: Área legal

3. **Control de Acceso**
   - Usuarios ven solo sus casos
   - Áreas ven casos asignados a su revisión
   - Admin ve todos los casos
   - Validación de permisos en API routes

4. **Base de Datos**
   - Nueva tabla `user_sessions` para tracking
   - Campo `current_area_role` en casos
   - Función `get_cases_for_user()` para filtrado
   - Vista `cases_by_area` para consultas
   - Trigger automático para actualizar área actual

5. **Frontend**
   - Página de login con botones de prueba
   - UserMenu con logout
   - SessionProvider configurado
   - Hook `useAuth()` para autenticación
   - Componente `ApprovalActions` para aprobar/devolver

6. **Backend**
   - Todos los endpoints protegidos con auth
   - Validación de roles en acciones de flujo
   - FlowService actualizado con permisos

---

## 🚀 Pasos para Activar el Sistema

### 1. Ejecutar la Migración de Base de Datos

```bash
npm run db:migrate
```

Esto agregará:
- Tabla `user_sessions`
- Campo `current_area_role` en `cases`
- Función `get_cases_for_user()`
- Vista `cases_by_area`
- Índices para optimización
- Trigger para actualizar área automáticamente

### 2. Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
# Base de datos
DB_HOST=data-base-src.postgres.database.azure.com
DB_PORT=5432
DB_NAME=gestion_archivos_db
DB_USER=azureuser
DB_PASSWORD='EnyOcyBZ#'

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui-cambiar-en-produccion

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=bsistemariesgos
AZURE_STORAGE_KEY=tu-key-aqui
AZURE_CONTAINER_NAME=archivos-gestion-comware
```

**IMPORTANTE**: Genera un `NEXTAUTH_SECRET` seguro:
```bash
openssl rand -base64 32
```

### 3. Iniciar el Servidor

```bash
npm run dev
```

---

## 🧪 Probar el Sistema

### Usuarios de Prueba

La base de datos ya tiene estos usuarios (password: `password123`):

1. **Admin**
   - Email: `admin@comware.com`
   - Rol: ADMIN
   - Ve: Todos los casos

2. **Usuario Normal**
   - Email: `usuario@comware.com`
   - Rol: USER
   - Ve: Solo sus propios casos

3. **Área Comercial**
   - Email: `comercial@comware.com`
   - Rol: AREA_COMERCIAL
   - Ve: Casos en revisión comercial

4. **Área Técnica**
   - Email: `tecnica@comware.com`
   - Rol: AREA_TECNICA
   - Ve: Casos en revisión técnica

5. **Área Financiera**
   - Email: `financiera@comware.com`
   - Rol: AREA_FINANCIERA
   - Ve: Casos en revisión financiera

6. **Área Legal**
   - Email: `legal@comware.com`
   - Rol: AREA_LEGAL
   - Ve: Casos en revisión legal

### Flujo de Prueba

1. **Login como Usuario Normal**
   - Ir a http://localhost:3000/login
   - Click en "Usuario Normal"
   - Verás solo tus casos

2. **Crear un Caso**
   - Ir a "Mis Casos" → "Nuevo Caso"
   - Llenar formulario y crear

3. **Login como Área Comercial**
   - Logout y login con `comercial@comware.com`
   - Verás el caso en tu dashboard
   - Puedes aprobar o devolver

4. **Aprobar Paso**
   - Abrir el caso
   - Click en "Aprobar"
   - El caso pasa a la siguiente área

5. **Login como Admin**
   - Logout y login con `admin@comware.com`
   - Verás TODOS los casos del sistema

---

## 📁 Archivos Modificados

### Backend
- `app/providers.tsx` - SessionProvider agregado
- `app/api/flow/approve/route.ts` - Auth + validación de rol
- `app/api/flow/return/route.ts` - Auth + validación de rol
- `app/api/flow/next/route.ts` - Auth agregado
- `app/api/files/upload/route.ts` - Auth + verificación de acceso
- `app/api/cases/[id]/files/route.ts` - Auth agregado
- `app/api/cases/[id]/history/route.ts` - Auth agregado
- `services/flow.service.ts` - Validación de roles en approve/reject/return

### Frontend
- `components/flow/ApprovalActions.tsx` - Nuevo componente para aprobar/devolver
- `hooks/useFlow.ts` - Hook combinado agregado

### Base de Datos
- `database/migration-auth.sql` - Migración completa
- `database/run-migration.js` - Script para ejecutar migración

### Configuración
- `package.json` - Script `db:migrate` agregado

---

## 🔒 Seguridad Implementada

1. **Autenticación**
   - Passwords hasheados con bcrypt
   - Sesiones JWT firmadas
   - Timeout de 8 horas

2. **Autorización**
   - Middleware protege rutas del dashboard
   - API routes validan sesión
   - Permisos por rol en acciones

3. **Validación de Acceso**
   - Usuarios solo ven sus datos
   - Áreas solo ven casos asignados
   - Admin tiene acceso completo

4. **Audit Trail**
   - Todas las acciones se registran
   - Se guarda quién hizo qué y cuándo

---

## 🎨 Próximos Pasos (Opcional)

1. **UI Mejorada**
   - Mostrar/ocultar menús según rol
   - Dashboard personalizado por rol
   - Notificaciones en tiempo real

2. **Funcionalidades Adicionales**
   - Reasignar casos
   - Comentarios internos (solo áreas)
   - Historial de cambios detallado
   - Exportar reportes

3. **Seguridad Avanzada**
   - 2FA (autenticación de dos factores)
   - Rate limiting
   - Logs de seguridad
   - Sesiones múltiples

---

## ❓ Troubleshooting

### Error: "password authentication failed"
- Verifica que la contraseña en `.env.local` esté entre comillas simples
- Ejecuta `npm run db:test` para verificar conexión

### Error: "NEXTAUTH_SECRET is not set"
- Genera un secreto: `openssl rand -base64 32`
- Agrégalo a `.env.local`

### Error: "function get_cases_for_user does not exist"
- Ejecuta la migración: `npm run db:migrate`

### No veo casos después de login
- Verifica que el usuario tenga casos asignados
- Ejecuta `npm run db:demo` para crear datos de prueba
- Revisa el rol del usuario en la base de datos

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor (`npm run dev`)
2. Verifica la consola del navegador
3. Ejecuta `npm run db:test` para verificar conexión
4. Revisa que la migración se haya ejecutado correctamente
