# Solución: Error de Conexiones de Base de Datos

## Problema
```
error: remaining connection slots are reserved for roles with privileges of the "pg_use_reserved_connections" role
```

Este error indica que Azure PostgreSQL ha alcanzado el límite máximo de conexiones disponibles.

## Solución Inmediata

### Opción 1: Cerrar Conexiones desde Azure Portal (RECOMENDADO)

1. Ve a Azure Portal: https://portal.azure.com
2. Navega a tu servidor PostgreSQL
3. En el menú izquierdo, busca "Query editor" o "Editor de consultas"
4. Conéctate con tus credenciales
5. Ejecuta el siguiente comando SQL:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();
```

6. Verifica que se cerraron las conexiones:

```sql
SELECT COUNT(*) as conexiones_activas
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();
```

### Opción 2: Reiniciar el Servidor PostgreSQL

1. Ve a Azure Portal
2. Navega a tu servidor PostgreSQL
3. Haz clic en "Restart" en la parte superior
4. Espera 2-3 minutos a que el servidor reinicie

### Opción 3: Aumentar el Límite de Conexiones (Si tienes un tier bajo)

1. Ve a Azure Portal
2. Navega a tu servidor PostgreSQL
3. Ve a "Server parameters"
4. Busca `max_connections`
5. Aumenta el valor (por ejemplo, de 50 a 100)
6. Guarda los cambios

## Cambios Realizados en el Código

He reducido la configuración del pool de conexiones en `lib/db/index.ts`:

```typescript
max: 5,           // Reducido de 20 a 5
min: 0,           // Reducido de 2 a 0
idleTimeoutMillis: 10000,  // Reducido de 30000 a 10000
allowExitOnIdle: true      // Nuevo: permite cerrar el pool cuando no hay actividad
```

## Prevención Futura

1. **Siempre cierra las conexiones**: El código ya usa `pool.query()` que libera automáticamente
2. **Usa transacciones correctamente**: El código ya usa `finally { client.release() }`
3. **Monitorea las conexiones**: Ejecuta periódicamente:
   ```sql
   SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database();
   ```

## Verificar el Tier de Azure PostgreSQL

Tu tier actual determina el límite de conexiones:
- **Basic**: 50-100 conexiones
- **General Purpose**: 100-500 conexiones
- **Memory Optimized**: 500+ conexiones

Para verificar tu tier:
1. Ve a Azure Portal
2. Navega a tu servidor PostgreSQL
3. Ve a "Pricing tier" o "Compute + storage"

## Después de Cerrar las Conexiones

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Verifica que la aplicación funciona correctamente

3. Si el problema persiste, considera aumentar el tier de Azure PostgreSQL

## Archivos Creados

- `database/close-connections.js`: Script para verificar conexiones activas
- `database/kill-connections.sql`: SQL para cerrar conexiones desde Azure Portal
- Este documento: `SOLUCION_CONEXIONES.md`
