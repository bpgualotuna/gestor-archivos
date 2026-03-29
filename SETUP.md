# Guía de Configuración Inicial

## 📋 Prerrequisitos

- Node.js 20+
- Acceso a la base de datos PostgreSQL en Azure
- Acceso al Azure Blob Storage

## 🚀 Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configuración de Variables de Entorno

El archivo `.env.local` ya está configurado con tus credenciales de Azure. **IMPORTANTE**: Este archivo contiene información sensible y NO debe ser commiteado a Git.

Verifica que el archivo `.env.local` contenga:

```env
DB_HOST=data-base-src.postgres.database.azure.com
DB_PORT=5432
DB_NAME=gestion_archivos_db
DB_USER=azureuser
DB_PASSWORD=tu-contraseña

AZURE_STORAGE_ACCOUNT=tu-cuenta-azure
AZURE_STORAGE_KEY=tu-key-aqui
AZURE_CONTAINER_NAME=tu-contenedor

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui
```

### 3. Generar NEXTAUTH_SECRET

Genera un secret aleatorio para NextAuth:

```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copia el resultado y reemplaza `genera-un-secret-aleatorio-aqui` en `.env.local`

### 4. Configurar la Base de Datos

**IMPORTANTE**: Antes de ejecutar los scripts, asegúrate de que la base de datos `gestion_archivos_db` existe en tu servidor PostgreSQL de Azure.

#### Opción A: Usando el Script Node.js (Recomendado para Azure)

Este método usa bcrypt para hashear las contraseñas de forma segura:

```bash
# Asegúrate de tener las dependencias instaladas
npm install

# Ejecutar el schema SQL primero
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require" -f database/schema.sql

# Luego ejecutar el seed con Node.js
node database/seed-with-bcrypt.js
```

#### Opción B: Usando psql (Desarrollo rápido)

**Nota**: Este método usa MD5 para las contraseñas (menos seguro, solo para desarrollo).

```bash
# Conectar a la base de datos
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require"

# Una vez conectado, ejecutar:
\i database/schema.sql
\i database/seed.sql
```

#### Opción C: Usando pgAdmin

1. Abre pgAdmin
2. Conecta al servidor:
   - Host: `data-base-src.postgres.database.azure.com`
   - Port: `5432`
   - Database: `gestion_archivos_db`
   - Username: `azureuser`
   - Password: `EnyOcyBZ#`
   - SSL Mode: `require`
3. Abre Query Tool
4. Copia y pega el contenido de `database/schema.sql`
5. Ejecuta
6. Luego ejecuta el seed:
   - **Opción 1**: Copia y pega `database/seed.sql` (usa MD5)
   - **Opción 2**: Ejecuta `node database/seed-with-bcrypt.js` desde la terminal (usa bcrypt - recomendado)

#### Opción D: Usando Azure Data Studio

1. Conecta al servidor con los mismos datos
2. Abre un nuevo Query
3. Ejecuta `database/schema.sql`
4. Luego ejecuta el seed con Node.js: `node database/seed-with-bcrypt.js`

### 5. Verificar Conexión a Azure Blob Storage

El contenedor `archivos-gestion-comware` debe existir en tu cuenta de Azure Storage. Si no existe, el sistema lo creará automáticamente al subir el primer archivo.

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Usuarios de Prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

| Email | Password | Rol |
|-------|----------|-----|
| admin@sistema.com | Admin123! | ADMIN |
| comercial@sistema.com | Comercial123! | COMERCIAL |
| tecnica@sistema.com | Tecnica123! | TECNICA |
| financiera@sistema.com | Financiera123! | FINANCIERA |
| legal@sistema.com | Legal123! | LEGAL |
| usuario@sistema.com | Usuario123! | USER |

**IMPORTANTE**: Cambia estas contraseñas en producción.

## ✅ Verificación

### 1. Verificar Base de Datos

```sql
-- Conectar a la base de datos y ejecutar:
SELECT COUNT(*) FROM users;
-- Debe retornar 6

SELECT COUNT(*) FROM workflow_templates;
-- Debe retornar 1

SELECT COUNT(*) FROM workflow_steps;
-- Debe retornar 4
```

### 2. Verificar Azure Blob Storage

El sistema verificará automáticamente la conexión al iniciar. Revisa la consola para ver si hay errores.

### 3. Probar la Aplicación

1. Abre `http://localhost:3000`
2. Deberías ver el dashboard
3. Intenta crear un caso nuevo
4. Sube un archivo de prueba

## 🐛 Solución de Problemas

### Error: extension "uuid-ossp" is not allow-listed

```
ERROR: extension "uuid-ossp" is not allow-listed for users in Azure Database for PostgreSQL
```

**Solución**: Ya está resuelto. El schema actualizado usa `gen_random_uuid()` que está disponible por defecto en PostgreSQL 13+ y no requiere extensiones adicionales.

### Error: extension "pgcrypto" is not allow-listed

```
ERROR: extension "pgcrypto" is not allow-listed
```

**Solución**: Usa el script `seed-with-bcrypt.js` en lugar de `seed.sql`. El script de Node.js usa bcrypt en la capa de aplicación en lugar de la extensión de PostgreSQL.

### Error de Conexión a PostgreSQL

```
Error: connect ECONNREFUSED
```

**Solución**: Verifica que:
- Las credenciales en `.env.local` sean correctas
- El firewall de Azure permita tu IP
- La base de datos `gestion_archivos_db` existe

### Error de Azure Blob Storage

```
Error: Azure Storage credentials no configuradas
```

**Solución**: Verifica que `AZURE_STORAGE_ACCOUNT` y `AZURE_STORAGE_KEY` estén en `.env.local`

### Error al Subir Archivos

```
Error: Container not found
```

**Solución**: El contenedor `archivos-gestion-comware` debe existir. El sistema intentará crearlo automáticamente, pero puedes crearlo manualmente en Azure Portal.

## 📝 Notas Importantes

1. **Seguridad**: El archivo `.env.local` está en `.gitignore` y NO debe ser commiteado
2. **SSL**: La conexión a PostgreSQL usa SSL por defecto (requerido por Azure)
3. **Timeouts**: Los timeouts de conexión están configurados para Azure
4. **Contenedor**: El nombre del contenedor es `archivos-gestion-comware` (no `archivos-gestion-riesgos`)

## 🚀 Siguiente Paso

Una vez que todo funcione en desarrollo, revisa `RECOMENDACIONES.md` para implementar:
- Autenticación completa con NextAuth
- Rate limiting
- Monitoreo
- Tests

## 📞 Soporte

Si encuentras problemas, revisa:
1. Los logs de la consola
2. Los logs de PostgreSQL
3. Los logs de Azure Storage en Azure Portal
