# 🔧 Solución: Página por Defecto de Next.js

## 🎯 Problema

Ves la página por defecto de Next.js que dice "To get started, edit the page.tsx file" en lugar del dashboard del sistema.

## ✅ Solución Rápida

### Paso 1: Detener el Servidor
Presiona `Ctrl + C` en la terminal donde está corriendo `npm run dev`

### Paso 2: Eliminar Caché de Next.js

**En Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force .next
```

**En Windows CMD:**
```cmd
rmdir /s /q .next
```

**En Linux/Mac:**
```bash
rm -rf .next
```

### Paso 3: Verificar Configuración
```bash
npm run check
```

Este comando verificará:
- ✅ Archivos del proyecto
- ✅ Dependencias instaladas
- ✅ Variables de entorno

### Paso 4: Reinstalar Dependencias (si es necesario)

Si `npm run check` muestra dependencias faltantes:

```bash
npm install
```

### Paso 5: Iniciar de Nuevo
```bash
npm run dev
```

### Paso 6: Abrir en el Navegador
Abre http://localhost:3000

## 🎨 Qué Deberías Ver Ahora

### Dashboard Principal
- Header con "Sistema de Gestión de Archivos"
- Sidebar con menú de navegación
- 4 tarjetas de estadísticas:
  - Total de Casos
  - En Revisión
  - Aprobados
  - Devueltos
- Botón "Nuevo Caso"
- Sección "Casos Recientes"

### Navegación
- **Dashboard** (/)
- **Mis Casos** (/cases)
- **Revisar** (/review)
- **Administración** (/admin)

## 🐛 Si Aún No Funciona

### Problema 1: Error de Módulos

```
Error: Cannot find module '@tanstack/react-query'
```

**Solución:**
```bash
npm install
```

### Problema 2: Error de Base de Datos

```
Error: connect ECONNREFUSED
```

**Solución:**
```bash
# Verifica la conexión
npm run db:test

# Revisa .env.local
# Asegúrate de que las credenciales sean correctas
```

### Problema 3: Página en Blanco

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Si hay errores de importación, ejecuta:
   ```bash
   npm install
   rm -rf .next
   npm run dev
   ```

### Problema 4: Estilos No Se Cargan

**Solución:**
```bash
# Verifica que Tailwind esté instalado
npm install -D tailwindcss postcss autoprefixer

# Limpia y reinicia
rm -rf .next
npm run dev
```

## 📁 Verificar Estructura de Archivos

Ejecuta este comando para ver la estructura:

```bash
npm run check
```

Deberías ver:
```
✓ app/(dashboard)/page.tsx
✓ app/(dashboard)/layout.tsx
✓ app/providers.tsx
✓ components/cases/CaseCard.tsx
✓ hooks/useCases.ts
✓ services/case.service.ts
✓ lib/db/index.ts
✓ .env.local
✓ package.json
```

## 🔍 Verificar en el Navegador

1. Abre http://localhost:3000
2. Deberías ver el dashboard con:
   - Fondo gris claro
   - Header blanco con título
   - Sidebar blanco a la izquierda
   - Contenido principal con estadísticas

## 📸 Captura de Pantalla Esperada

```
┌─────────────────────────────────────────────────────┐
│ Sistema de Gestión de Archivos    Usuario Demo     │
├──────────┬──────────────────────────────────────────┤
│ 🏠 Dash  │  Dashboard                    [+ Nuevo] │
│ 📁 Casos │                                          │
│ ✓ Review │  [Total] [Revisión] [Aprobados] [Dev.]  │
│ ⚙ Admin  │                                          │
│          │  Casos Recientes                         │
│          │  ┌──────┐ ┌──────┐ ┌──────┐             │
│          │  │ Caso │ │ Caso │ │ Caso │             │
│          │  └──────┘ └──────┘ └──────┘             │
└──────────┴──────────────────────────────────────────┘
```

## 🆘 Último Recurso

Si nada funciona:

```bash
# 1. Limpia todo
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 2. Reinstala
npm install

# 3. Verifica
npm run check

# 4. Inicia
npm run dev
```

## 📞 Siguiente Paso

Una vez que veas el dashboard:
1. Haz clic en "Nuevo Caso"
2. Llena el formulario
3. Crea tu primer caso

## ✨ Funcionalidades Disponibles

- ✅ Crear casos
- ✅ Listar casos
- ✅ Ver detalle de caso
- ✅ Subir archivos
- ✅ Ver flujo de aprobación
- ✅ Ver historial
- ⏳ Aprobar/Rechazar (requiere autenticación)
- ⏳ Devolver casos (requiere autenticación)

## 🔐 Nota sobre Autenticación

Actualmente el sistema NO tiene autenticación implementada. Los endpoints de API funcionan pero no validan usuarios. Para implementar autenticación completa, revisa `RECOMENDACIONES.md`.
