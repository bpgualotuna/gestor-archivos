# Configuración Específica para Azure PostgreSQL

## 🔧 Diferencias con PostgreSQL Estándar

Azure PostgreSQL tiene algunas restricciones que requieren ajustes en el código:

### 1. Extensiones No Permitidas

Azure PostgreSQL no permite usar ciertas extensiones sin aprobación previa:
- ❌ `uuid-ossp` - NO permitida por defecto
- ❌ `pgcrypto` - NO permitida por defecto

### 2. Soluciones Implementadas

✅ **Para UUIDs**: Usamos `gen_random_uuid()` que está disponible por defecto en PostgreSQL 13+

```sql
-- Antes (no funciona en Azure)
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- Ahora (funciona en Azure)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

✅ **Para Hashing de Contraseñas**: Usamos bcrypt en la capa de aplicación (Node.js)

```javascript
// En lugar de usar crypt() en PostgreSQL
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash(password, 10);
```

## 📝 Pasos de Configuración

### 1. Verificar Conexión

```bash
npm run db:test
```

Este comando verificará:
- ✅ Conexión a PostgreSQL
- ✅ Versión de PostgreSQL
- ✅ Tablas existentes
- ✅ Conexión a Azure Blob Storage
- ✅ Contenedor de archivos

### 2. Ejecutar Schema

**Opción A: Desde psql**
```bash
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require" -f database/schema.sql
```

**Opción B: Desde pgAdmin o Azure Data Studio**
- Conecta al servidor
- Abre `database/schema.sql`
- Ejecuta el script completo

### 3. Insertar Datos Iniciales

```bash
npm run db:seed
```

Este comando:
- Crea 6 usuarios con contraseñas hasheadas con bcrypt
- Crea el workflow template por defecto
- Crea los 4 pasos del workflow

## 🔐 Configuración de Firewall en Azure

Si tienes problemas de conexión, asegúrate de que tu IP esté permitida:

1. Ve a Azure Portal
2. Busca tu servidor PostgreSQL: `data-base-src`
3. Ve a "Connection security" o "Seguridad de conexión"
4. Agrega tu IP actual en "Firewall rules"
5. Guarda los cambios

## 🔒 SSL/TLS

Azure PostgreSQL requiere SSL por defecto. La configuración ya está incluida:

```javascript
const pool = new Pool({
  // ... otras opciones
  ssl: {
    rejectUnauthorized: false
  }
});
```

Para producción, considera usar certificados verificados:

```javascript
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
}
```

## 📦 Azure Blob Storage

### Verificar Contenedor

El contenedor `archivos-gestion-comware` debe existir. Si no existe:

**Opción 1: Crear desde Azure Portal**
1. Ve a tu cuenta de storage: `bsistemariesgos`
2. Ve a "Containers"
3. Crea un nuevo contenedor: `archivos-gestion-comware`
4. Nivel de acceso: Private

**Opción 2: El sistema lo creará automáticamente**
Al subir el primer archivo, el sistema intentará crear el contenedor automáticamente.

### Estructura de Archivos

```
archivos-gestion-comware/
├── case-{uuid}/
│   ├── v1/
│   │   └── documento.pdf
│   ├── v2/
│   │   └── documento.pdf
│   └── final/
│       └── documento_firmado.pdf
```

## 🧪 Verificación Completa

### 1. Test de Conexión
```bash
npm run db:test
```

Salida esperada:
```
✅ Conexión exitosa a PostgreSQL
   Versión: PostgreSQL 14.x
   Base de datos: gestion_archivos_db
   Tablas encontradas: 11
   Usuarios en la BD: 6

✅ Conexión exitosa a Azure Blob Storage
   Cuenta: bsistemariesgos
   Contenedor 'archivos-gestion-comware': Existe
```

### 2. Verificar Tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver:
- audit_log
- case_workflows
- cases
- comments
- files
- notifications
- users
- workflow_step_progress
- workflow_steps
- workflow_templates

### 3. Verificar Usuarios
```sql
SELECT email, role FROM users;
```

Deberías ver 6 usuarios con diferentes roles.

## 🚨 Problemas Comunes

### Error: "password authentication failed"

**Causa**: Contraseña incorrecta o usuario no existe

**Solución**:
1. Verifica que la contraseña en `.env.local` sea correcta
2. Nota que el `#` en la contraseña debe estar sin codificar en `.env.local`
3. En la URL de conexión, el `#` debe estar codificado como `%23`

### Error: "no pg_hba.conf entry for host"

**Causa**: Tu IP no está permitida en el firewall de Azure

**Solución**:
1. Ve a Azure Portal
2. Agrega tu IP en las reglas de firewall
3. Espera 1-2 minutos para que se aplique

### Error: "database does not exist"

**Causa**: La base de datos `gestion_archivos_db` no existe

**Solución**:
```bash
# Conectar al servidor (base de datos postgres por defecto)
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/postgres?sslmode=require"

# Crear la base de datos
CREATE DATABASE gestion_archivos_db;
```

### Error: "Container not found" en Azure Blob

**Causa**: El contenedor no existe

**Solución**:
1. Crea el contenedor manualmente en Azure Portal
2. O espera a que el sistema lo cree al subir el primer archivo

## 📊 Monitoreo en Azure

### PostgreSQL
- Ve a Azure Portal → Tu servidor PostgreSQL
- Revisa "Metrics" para ver:
  - Conexiones activas
  - CPU usage
  - Storage usage
  - Query performance

### Blob Storage
- Ve a Azure Portal → Tu cuenta de storage
- Revisa "Metrics" para ver:
  - Transactions
  - Ingress/Egress
  - Availability

## 🔄 Backup y Recuperación

### PostgreSQL
Azure PostgreSQL hace backups automáticos. Para restaurar:
1. Ve a Azure Portal → Tu servidor
2. Ve a "Backup and restore"
3. Selecciona un punto de restauración

### Blob Storage
Considera habilitar:
- Soft delete para blobs
- Versioning
- Replication (GRS o RA-GRS)

## 📝 Notas de Producción

1. **Cambiar contraseñas**: Los usuarios de prueba tienen contraseñas simples
2. **Habilitar SSL verificado**: Usa certificados CA verificados
3. **Configurar backups**: Verifica la política de backup
4. **Monitoreo**: Configura alertas en Azure Monitor
5. **Escalado**: Considera el tier de PostgreSQL según carga esperada
6. **Networking**: Usa Private Endpoints para mayor seguridad

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa los logs de Azure Portal
2. Ejecuta `npm run db:test` para diagnóstico
3. Verifica las reglas de firewall
4. Consulta la documentación de Azure PostgreSQL
