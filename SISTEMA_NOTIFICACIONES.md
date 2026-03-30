# Sistema de Notificaciones

## Resumen

Se ha implementado un sistema completo de notificaciones en tiempo real para alertar a los usuarios sobre cambios importantes en sus casos.

## 🎯 Tipos de Notificaciones

### Para Usuarios Normales (USER)
1. **CASE_RETURNED** - Caso devuelto para correcciones
   - Se envía cuando un área devuelve el caso
   - Incluye el motivo de la devolución

2. **CASE_APPROVED** - Caso aprobado por un área
   - Se envía cuando un área aprueba el caso
   - Indica qué área lo aprobó

3. **CASE_REJECTED** - Caso rechazado
   - Se envía cuando un área rechaza el caso
   - Incluye el motivo del rechazo

4. **CASE_COMPLETED** - Caso completado
   - Se envía cuando el caso es aprobado por todas las áreas
   - Indica que el proceso ha finalizado exitosamente

### Para Usuarios de Área (AREA_USER)
1. **CASE_SUBMITTED** - Nuevo caso para revisión
   - Se envía cuando un usuario envía un caso nuevo
   - Notifica a todos los usuarios del área asignada

2. **CASE_RESUBMITTED** - Caso reenviado con correcciones
   - Se envía cuando un usuario reenvía un caso devuelto
   - Notifica a todos los usuarios del área que lo devolvió

## 📊 Estructura de Base de Datos

### Tabla: `notifications`
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- case_id: UUID (FK -> cases)
- type: notification_type (ENUM)
- title: VARCHAR(255)
- message: TEXT
- is_read: BOOLEAN
- read_at: TIMESTAMP
- created_at: TIMESTAMP
```

### Funciones de Base de Datos
1. `get_user_notifications(user_id, unread_only, limit)` - Obtiene notificaciones
2. `count_unread_notifications(user_id)` - Cuenta notificaciones no leídas
3. `mark_notification_read(notification_id)` - Marca como leída
4. `mark_all_notifications_read(user_id)` - Marca todas como leídas
5. `create_notification(...)` - Crea nueva notificación

## 🔧 Implementación Técnica

### Backend

#### Servicios
- **`NotificationService`** (`services/notification.service.ts`)
  - Gestiona todas las operaciones de notificaciones
  - Métodos para crear notificaciones específicas por tipo
  - Integración con la base de datos

#### APIs
- **GET `/api/notifications`** - Obtiene notificaciones del usuario
  - Query params: `unreadOnly`, `limit`
  - Refrescado automático cada 30 segundos

- **PATCH `/api/notifications`** - Marca todas como leídas

- **PATCH `/api/notifications/:id`** - Marca una notificación como leída

- **GET `/api/notifications/unread-count`** - Obtiene contador de no leídas

#### Integración con Flujo de Trabajo
Las notificaciones se crean automáticamente en:
- **`FlowService.approveStep()`** - Al aprobar un paso
- **`FlowService.returnCase()`** - Al devolver un caso
- **`FlowService.resubmitCase()`** - Al reenviar un caso
- **`CaseService.submitCase()`** - Al enviar un caso nuevo

### Frontend

#### Componentes
- **`NotificationBell`** (`components/shared/NotificationBell.tsx`)
  - Icono de campana con contador de no leídas
  - Dropdown con lista de notificaciones
  - Indicador visual para notificaciones no leídas
  - Click en notificación navega al caso y marca como leída
  - Botón para marcar todas como leídas

#### Hooks
- **`useNotifications(unreadOnly)`** - Obtiene lista de notificaciones
- **`useUnreadCount()`** - Obtiene contador de no leídas
- **`useMarkAsRead()`** - Marca notificación como leída
- **`useMarkAllAsRead()`** - Marca todas como leídas

#### Características
- ✅ Actualización automática cada 30 segundos
- ✅ Contador en tiempo real de notificaciones no leídas
- ✅ Indicador visual (punto azul) para notificaciones nuevas
- ✅ Formato de fecha relativo (hace X minutos/horas/días)
- ✅ Iconos emoji según tipo de notificación
- ✅ Click en notificación navega al caso
- ✅ Cierre automático al hacer click fuera

## 🚀 Uso

### Para Desarrolladores

#### Crear una notificación manualmente
```typescript
import { NotificationService } from '@/services/notification.service';

await NotificationService.createNotification({
  userId: 'user-uuid',
  caseId: 'case-uuid',
  type: 'CASE_APPROVED',
  title: 'Caso aprobado',
  message: 'Tu caso ha sido aprobado por el área Técnica',
});
```

#### Notificaciones automáticas
Las notificaciones se crean automáticamente cuando:
1. Un usuario envía un caso → Notifica al área asignada
2. Un área aprueba un caso → Notifica al creador y al área siguiente
3. Un área devuelve un caso → Notifica al creador
4. Un usuario reenvía un caso → Notifica al área que lo devolvió
5. Un caso se completa → Notifica al creador

### Para Usuarios

#### Ver notificaciones
1. Click en el icono de campana en el header
2. Las notificaciones no leídas tienen fondo azul y un punto azul
3. Click en una notificación para ir al caso

#### Marcar como leídas
- Click en una notificación la marca automáticamente como leída
- Click en "Marcar todas" para marcar todas como leídas

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
```
database/
  ├── migration-notifications.sql
  ├── run-notifications-migration.js
  ├── reset-notifications.js
  ├── drop-notifications.sql
  └── verify-notifications.js

types/
  └── notification.types.ts

services/
  └── notification.service.ts

hooks/
  └── useNotifications.ts

components/shared/
  └── NotificationBell.tsx

app/api/notifications/
  ├── route.ts
  ├── [id]/route.ts
  └── unread-count/route.ts
```

### Archivos Modificados
```
services/
  ├── flow.service.ts (agregadas notificaciones)
  └── case.service.ts (agregadas notificaciones)

app/(dashboard)/
  └── layout.tsx (agregado NotificationBell)
```

## 🔄 Migración

### Ejecutar migración
```bash
node database/reset-notifications.js
```

### Verificar migración
```bash
node database/verify-notifications.js
```

## 🎨 Personalización

### Cambiar frecuencia de actualización
En `hooks/useNotifications.ts`, modificar `refetchInterval`:
```typescript
refetchInterval: 30000, // 30 segundos (30000ms)
```

### Agregar nuevos tipos de notificación
1. Agregar tipo en `database/migration-notifications.sql`:
```sql
CREATE TYPE notification_type AS ENUM (
  ...,
  'NEW_TYPE'
);
```

2. Agregar tipo en `types/notification.types.ts`:
```typescript
export type NotificationType =
  | ...
  | 'NEW_TYPE';
```

3. Crear método en `NotificationService`:
```typescript
static async notifyNewType(...) {
  await this.createNotification({
    type: 'NEW_TYPE',
    ...
  });
}
```

4. Agregar icono en `NotificationBell.tsx`:
```typescript
case 'NEW_TYPE':
  return '🆕';
```

## ✅ Testing

### Probar notificaciones
1. Inicia sesión como usuario normal
2. Crea un caso y envíalo
3. Inicia sesión como usuario de área
4. Verifica que aparezca la notificación
5. Aprueba o devuelve el caso
6. Inicia sesión como usuario normal
7. Verifica que aparezca la notificación correspondiente

## 📝 Notas

- Las notificaciones se refrescan automáticamente cada 30 segundos
- El contador de no leídas se actualiza en tiempo real
- Las notificaciones antiguas no se eliminan automáticamente
- Se puede implementar un job para limpiar notificaciones antiguas
- Las notificaciones se eliminan en cascada si se elimina el caso o usuario

## 🔮 Mejoras Futuras

- [ ] Notificaciones push con WebSockets
- [ ] Notificaciones por email
- [ ] Página dedicada para ver todas las notificaciones
- [ ] Filtros por tipo de notificación
- [ ] Búsqueda en notificaciones
- [ ] Limpieza automática de notificaciones antiguas
- [ ] Preferencias de notificación por usuario
- [ ] Notificaciones de comentarios en casos
- [ ] Sonido al recibir notificación nueva

---

**Fecha de implementación**: $(date)
**Versión**: 1.0.0
**Estado**: ✅ Completado y probado
