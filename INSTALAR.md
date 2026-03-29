# 📦 Instalación Completa

## ⚡ Instalación Rápida (3 comandos)

```bash
# 1. Instalar todas las dependencias
npm install

# 2. Verificar configuración
npm run check

# 3. Probar conexiones
npm run db:test
```

## 📋 Paso a Paso Detallado

### 1️⃣ Instalar Dependencias

```bash
npm install
```

Esto instalará:
- **Frontend**: React, Next.js, TanStack Query, Lucide Icons
- **Backend**: PostgreSQL client, Azure Blob Storage, Zod
- **Utilidades**: bcryptjs, date-fns, dotenv

**Tiempo estimado**: 2-3 minutos

### 2️⃣ Verificar Instalación

```bash
npm run check
```

Deberías ver:
```
✓ app/(dashboard)/page.tsx
✓ app/(dashboard)/layout.tsx
✓ node_modules existe
✓ @tanstack/react-query
✓ @azure/storage-blob
✓ pg
✓ zod
✓ bcryptjs
✓ date-fns
✓ lucide-react
✓ dotenv
```

### 3️⃣ Verificar Conexiones

```bash
npm run db:test
```

Esto verificará:
- ✅ Conexión a PostgreSQL en Azure
- ✅ Versión de PostgreSQL
- ✅ Tablas existentes
- ✅ Conexión a Azure Blob Storage
- ✅ Contenedor de archivos

**Salida esperada:**
```
🔍 Probando conexión a PostgreSQL...
✅ Conexión exitosa a PostgreSQL
   Versión: PostgreSQL 14.x
   Base de datos: gestion_archivos_db
   Tablas encontradas: 11
   Usuarios en la BD: 6

🔍 Probando conexión a Azure Blob Storage...
✅ Conexión exitosa a Azure Blob Storage
   Cuenta: bsistemariesgos
   Contenedor 'archivos-gestion-comware': Existe

🎉 ¡Todo está configurado correctamente!
   Puedes ejecutar: npm run dev
```

## 🗄️ Configurar Base de Datos

### Si las tablas NO existen:

#### Opción A: Ejecutar Schema SQL

```bash
# Desde psql
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require" -f database/schema.sql
```

#### Opción B: Desde pgAdmin

1. Conecta al servidor Azure
2. Abre Query Tool
3. Carga `database/schema.sql`
4. Ejecuta

### Insertar Datos Iniciales

```bash
npm run db:seed
```

Esto creará:
- 6 usuarios de prueba (con bcrypt)
- 1 workflow template
- 4 pasos de workflow

## 🚀 Iniciar Aplicación

```bash
npm run dev
```

Abre: http://localhost:3000

## ✅ Verificación Final

### 1. Verificar que el servidor inició
```
▲ Next.js 16.2.1
- Local:   http://localhost:3000
✓ Ready in 867ms
```

### 2. Abrir en el navegador
- Ve a http://localhost:3000
- Deberías ver el Dashboard

### 3. Probar funcionalidad
- Haz clic en "Nuevo Caso"
- Crea un caso de prueba
- Verifica que se guarde

## 🐛 Solución de Problemas

### Error: Cannot find module 'dotenv'

```bash
npm install
```

### Error: Cannot find module '@tanstack/react-query'

```bash
npm install
```

### Error: Database connection failed

1. Verifica `.env.local`:
```bash
# Debe tener estos valores:
DB_HOST=data-base-src.postgres.database.azure.com
DB_NAME=gestion_archivos_db
DB_USER=azureuser
DB_PASSWORD=EnyOcyBZ#
```

2. Verifica firewall de Azure:
   - Ve a Azure Portal
   - Busca tu servidor PostgreSQL
   - Agrega tu IP en "Connection security"

### Error: Azure Blob Storage connection failed

Verifica en `.env.local`:
```bash
AZURE_STORAGE_ACCOUNT=tu-cuenta-azure
AZURE_STORAGE_KEY=tu-key-aqui
AZURE_CONTAINER_NAME=tu-contenedor
```

### Página muestra contenido por defecto de Next.js

```bash
# Elimina el caché
Remove-Item -Recurse -Force .next

# Reinicia
npm run dev
```

## 📊 Comandos Útiles

```bash
# Verificar todo
npm run check

# Probar conexiones
npm run db:test

# Insertar datos
npm run db:seed

# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start
```

## 🎯 Orden Recomendado

1. ✅ `npm install`
2. ✅ `npm run check`
3. ✅ `npm run db:test`
4. ✅ Ejecutar `schema.sql` (si las tablas no existen)
5. ✅ `npm run db:seed`
6. ✅ `npm run dev`
7. ✅ Abrir http://localhost:3000

## 📞 Siguiente Paso

Una vez que todo funcione:
1. Lee `README_SISTEMA.md` para entender la arquitectura
2. Lee `RECOMENDACIONES.md` para mejores prácticas
3. Comienza a personalizar según tus necesidades

## 🆘 Si Nada Funciona

```bash
# Limpieza completa
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item package-lock.json

# Reinstalar todo
npm install

# Verificar
npm run check

# Iniciar
npm run dev
```

## ✨ ¡Listo!

Ahora tienes un sistema completo de gestión de archivos funcionando con:
- ✅ Frontend React/Next.js
- ✅ Backend con API Routes
- ✅ PostgreSQL en Azure
- ✅ Azure Blob Storage
- ✅ Flujo de aprobación
- ✅ Trazabilidad completa
