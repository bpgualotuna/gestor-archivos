# Migración: Separación de Roles y Áreas

## Resumen

Esta migración separa el concepto de "rol" (permisos del sistema) y "área" (departamento), permitiendo tener múltiples usuarios en cada área.

## Cambios Principales

### 1. Nuevos Roles Simplificados

**Antes:**
- USER, COMERCIAL, TECNICA, FINANCIERA, LEGAL, ADMIN

**Después:**
- `USER`: Usuario normal que crea casos
- `AREA_USER`: Usuario de área que revisa casos
- `ADMIN`: Administrador del sistema

### 2. Nuevo Campo: Área

Se agregó el campo `area` a la tabla `users`:
- `COMERCIAL`
- `TECNICA`
- `FINANCIERA`
- `LEGAL`

**Nota:** Solo los usuarios con rol `AREA_USER` tienen un área asignada.

### 3. Estructura de Datos

#### Tabla `users`
```sql
- role: user_role (USER, AREA_USER, ADMIN)
- area: user_area (COMERCIAL, TECNICA, FINANCIERA, LEGAL) -- Solo para AREA_USER
```

#### Tabla `cases`
```sql
- current_area: user_area -- Área actual donde está el caso
```

#### Tabla `workflow_steps`
```sql
- required_area: user_area -- Área requerida para aprobar
```

## Migración de Datos

La migración automáticamente convierte:

| Rol Anterior | Rol Nuevo | Área |
|--------------|-----------|------|
| USER | USER | - |
| ADMIN | ADMIN | - |
| COMERCIAL | AREA_USER | COMERCIAL |
| TECNICA | AREA_USER | TECNICA |
| FINANCIERA | AREA_USER | FINANCIERA |
| LEGAL | AREA_USER | LEGAL |

## Cómo Ejecutar la Migración

### Paso 1: Cerrar Conexiones de Base de Datos

Primero, necesitas liberar las conexiones de PostgreSQL. Elige una opción:

**Opción A: Reiniciar desde Azure Portal (RECOMENDADO)**
1. Ve a https://portal.azure.com
2. Busca tu servidor PostgreSQL
3. Haz clic en "Restart"
4. Espera 2-3 minutos

**Opción B: Cerrar conexiones manualmente**
1. Ve a Azure Portal → Query Editor
2. Ejecuta:
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();
```

### Paso 2: Ejecutar la Migración

```bash
node database/run-roles-areas-migration.js
```

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
```

## Cambios en el Código

### 1. Tipos TypeScript Actualizados

**types/user.types.ts**
```typescript
export type UserRole = 'USER' | 'AREA_USER' | 'ADMIN';
export type UserArea = 'COMERCIAL' | 'TECNICA' | 'FINANCIERA' | 'LEGAL';

export interface User {
  role: UserRole;
  area?: UserArea;  // Solo para AREA_USER
  // ...
}
```

**types/case.types.ts**
```typescript
export interface Case {
  currentArea?: UserArea;  // Cambiado de currentAreaRole
  // ...
}
```

**types/flow.types.ts**
```typescript
export interface WorkflowStep {
  requiredArea: UserArea;  // Cambiado de requiredRole
  // ...
}
```

### 2. Componente de Administración

El componente `UserManagement.tsx` ahora incluye:
- Campo "Área" en la tabla de usuarios
- Selector de área al crear/editar usuarios de área
- Validación: AREA_USER requiere área seleccionada
- Visualización de área en detalles del usuario

### 3. Función de Base de Datos

`get_cases_for_user` ahora acepta:
```sql
get_cases_for_user(
  p_user_id UUID,
  p_user_role user_role,
  p_user_area user_area,  -- NUEVO
  p_assigned_only BOOLEAN
)
```

## Próximos Pasos Necesarios

Después de ejecutar la migración, necesitas actualizar:

1. **Servicios** (`services/*.ts`):
   - Actualizar `CaseService.getAllCases()` para pasar `user.area`
   - Actualizar `FlowService` para usar `requiredArea` en lugar de `requiredRole`

2. **Auth** (`lib/auth/get-session.ts`):
   - Actualizar `canAccessCase()` para usar `user.area`
   - Actualizar `canInteractWithCase()` para comparar áreas

3. **APIs** (`app/api/**/*.ts`):
   - Actualizar todas las llamadas a servicios que usan roles/áreas

4. **Componentes** (`components/**/*.tsx`):
   - Actualizar referencias a `currentAreaRole` → `currentArea`
   - Actualizar lógica de permisos para usar `user.role` y `user.area`

## Beneficios

1. **Múltiples usuarios por área**: Ahora puedes tener varios usuarios en Comercial, Técnica, etc.
2. **Roles claros**: Separación clara entre permisos (rol) y departamento (área)
3. **Escalabilidad**: Fácil agregar nuevas áreas o roles sin afectar la estructura
4. **Administración mejorada**: Panel de admin con gestión completa de roles y áreas

## Verificación

Después de la migración, verifica:

```sql
-- Ver usuarios por rol y área
SELECT role, area, COUNT(*) as count
FROM users
GROUP BY role, area
ORDER BY role, area;

-- Ver casos por área actual
SELECT current_area, COUNT(*) as count
FROM cases
WHERE current_area IS NOT NULL
GROUP BY current_area;

-- Ver pasos de workflow por área requerida
SELECT required_area, COUNT(*) as count
FROM workflow_steps
GROUP BY required_area;
```

## Rollback (Si es necesario)

Si necesitas revertir la migración, contacta al equipo de desarrollo. El rollback requiere:
1. Backup de la base de datos
2. Script de reversión personalizado
3. Actualización del código a la versión anterior

## Soporte

Si encuentras problemas:
1. Revisa los logs de la migración
2. Verifica que todas las conexiones estén cerradas
3. Asegúrate de tener permisos de administrador en PostgreSQL
4. Contacta al equipo de desarrollo si persisten los errores
