# 🚀 Inicio Rápido

## ⚠️ Problema Actual

Si ves la página por defecto de Next.js, sigue estos pasos:

## 📦 Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- @tanstack/react-query
- @azure/storage-blob
- pg
- zod
- bcryptjs
- next-auth
- date-fns
- clsx
- lucide-react

## 🗄️ Paso 2: Configurar Base de Datos

### Opción A: Verificar Conexión
```bash
npm run db:test
```

### Opción B: Ejecutar Schema
```bash
# Desde psql
psql "postgresql://azureuser:EnyOcyBZ%23@data-base-src.postgres.database.azure.com:5432/gestion_archivos_db?sslmode=require" -f database/schema.sql
```

### Opción C: Insertar Datos
```bash
npm run db:seed
```

## 🎯 Paso 3: Iniciar Aplicación

```bash
npm run dev
```

Abre http://localhost:3000

## ✅ Qué Deberías Ver

1. **Dashboard** con:
   - Estadísticas de casos
   - Botón "Nuevo Caso"
   - Lista de casos recientes

2. **Sidebar** con:
   - Dashboard
   - Mis Casos
   - Revisar
   - Administración

## 🐛 Si Aún Ves la Página por Defecto

1. Detén el servidor (Ctrl+C)
2. Elimina la carpeta `.next`:
   ```bash
   rm -rf .next
   # En Windows PowerShell:
   Remove-Item -Recurse -Force .next
   ```
3. Vuelve a iniciar:
   ```bash
   npm run dev
   ```

## 📁 Estructura de Rutas

- `/` → Dashboard principal
- `/cases` → Lista de casos
- `/cases/new` → Crear nuevo caso
- `/cases/[id]` → Detalle de caso
- `/review` → Vista de revisión
- `/admin` → Panel de administración

## 🔍 Verificar Archivos

Asegúrate de que existen estos archivos:

```
app/
├── (dashboard)/
│   ├── layout.tsx ✓
│   ├── page.tsx ✓
│   └── cases/
│       ├── page.tsx ✓
│       ├── new/page.tsx ✓
│       └── [id]/page.tsx ✓
├── api/ ✓
├── layout.tsx ✓
└── providers.tsx ✓

components/
├── cases/ ✓
├── files/ ✓
├── flow/ ✓
├── history/ ✓
└── shared/ ✓

hooks/ ✓
services/ ✓
types/ ✓
lib/ ✓
```

## 🆘 Errores Comunes

### Error: Cannot find module '@tanstack/react-query'
**Solución**: `npm install`

### Error: Module not found: Can't resolve 'date-fns/locale/es'
**Solución**: Ya está corregido en el código

### Error: Database connection failed
**Solución**: 
1. Verifica `.env.local`
2. Ejecuta `npm run db:test`
3. Revisa firewall de Azure

### La página se ve sin estilos
**Solución**: Verifica que `tailwindcss` esté instalado:
```bash
npm install -D tailwindcss
```

## 📞 Siguiente Paso

Una vez que veas el dashboard:
1. Crea un caso de prueba
2. Sube un archivo
3. Revisa el historial

## 🎨 Personalización

Para cambiar colores o estilos, edita:
- `app/globals.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind
- Componentes individuales - Clases de Tailwind
