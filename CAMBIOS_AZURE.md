# Resumen de Cambios para Azure PostgreSQL

## ✅ Problema Resuelto

**Error original:**
```
ERROR: extension "uuid-ossp" is not allow-listed for users in Azure Database for PostgreSQL
```

## 🔧 Cambios Realizados

### 1. Schema SQL (`database/schema.sql`)

**Antes:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ...
);
```

**Ahora:**
```sql
-- No requiere extensiones

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ...
);
```

✅ `gen_random_uuid()` está disponible por defecto en PostgreSQL 13+

### 2. Seed de Usuarios (`database/seed.sql`)

**Antes:**
```sql
INSERT INTO users (email, password_hash, ...)
VALUES ('admin@sistema.com', crypt('Admin123!', gen_salt('bf')), ...);
```

**Ahora:**
```sql
INSERT INTO users (email, password_hash, ...)
VALUES ('admin@sistema.com', md5('Admin123!'), ...);
```

⚠️ MD5 es solo para desarrollo rápido. Para producción usa el script de Node.js.

### 3. Nuevo Script con Bcrypt (`database/seed-with-bcrypt.js`)

Script de Node.js que usa bcrypt para hashear contraseñas de forma segura:

```bash
npm run db:seed
```

Este es el método **RECOMENDADO** para producción.

### 4. Script de Verificación (`database/test-connection.js`)

Verifica conexiones a PostgreSQL y Azure Blob:

```bash
npm run db:test
```

## 📋 Pasos para Ejecutar

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Verificar conexión
```bash
npm run db:test
```

### Paso 3: Ejecutar schema
```bash
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require" -f database/schema.sql
```

### Paso 4: Insertar datos iniciales
```bash
npm run db:seed
```

### Paso 5: Iniciar aplicación
```bash
npm run dev
```

## 📚 Documentación Adicional

- **AZURE_SETUP.md**: Guía completa específica para Azure
- **SETUP.md**: Guía general de instalación
- **RECOMENDACIONES.md**: Mejores prácticas y seguridad

## 🎯 Comandos Útiles

```bash
# Verificar todo
npm run db:test

# Insertar usuarios con bcrypt
npm run db:seed

# Iniciar desarrollo
npm run dev

# Conectar a PostgreSQL
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require"
```

## ✨ Resultado

Ahora el sistema es 100% compatible con Azure PostgreSQL sin necesidad de extensiones adicionales.
