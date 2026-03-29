# Instrucciones para Subir a Git

## ✅ Verificación Pre-Commit

Antes de hacer commit, verifica que:

1. ✅ `.env.local` NO está en la lista de archivos (debe estar ignorado)
2. ✅ `node_modules/` NO está en la lista (debe estar ignorado)
3. ✅ `.next/` NO está en la lista (debe estar ignorado)

## 📝 Comandos para Commit

```bash
# 1. Ver estado actual
git status

# 2. Agregar todos los archivos
git add .

# 3. Verificar qué se va a commitear
git status

# 4. Hacer commit con mensaje descriptivo
git commit -m "feat: Sistema completo de gestión de archivos v1.0.0

- Sistema de autenticación con NextAuth.js y RBAC
- Flujo de aprobación multi-área (Comercial → Técnica → Financiera → Legal)
- Gestión de archivos con Azure Blob Storage
- Dashboard personalizado por rol
- Historial completo de acciones (audit trail)
- Base de datos PostgreSQL con 14 tablas
- Documentación completa incluida"

# 5. Subir a GitHub
git push origin main
```

## 🔍 Verificación Post-Push

Después de hacer push, verifica en GitHub que:

1. ❌ NO se subió `.env.local`
2. ❌ NO se subió `node_modules/`
3. ❌ NO se subió `.next/`
4. ✅ SÍ se subió `.env.example`
5. ✅ SÍ se subió `.gitignore`
6. ✅ SÍ se subió `README.md`

## 🚨 Si Subiste Archivos Sensibles por Error

Si accidentalmente subiste `.env.local` u otros archivos sensibles:

```bash
# 1. Remover del repositorio (pero mantener local)
git rm --cached .env.local

# 2. Commit del cambio
git commit -m "fix: Remover archivo sensible"

# 3. Push
git push origin main

# 4. Cambiar TODAS las credenciales que estaban en el archivo
# - Generar nuevo NEXTAUTH_SECRET
# - Cambiar contraseñas de base de datos
# - Rotar keys de Azure Storage
```

## 📋 Estructura de Commits Recomendada

Usa prefijos para commits claros:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: Agregar sistema de notificaciones"
git commit -m "fix: Corregir error en flujo de aprobación"
git commit -m "docs: Actualizar README con nuevas instrucciones"
```

## 🌿 Branches Recomendadas

Para desarrollo futuro:

```bash
# Crear branch para nueva feature
git checkout -b feature/nombre-feature

# Trabajar en la feature...
git add .
git commit -m "feat: Descripción"

# Subir branch
git push origin feature/nombre-feature

# Crear Pull Request en GitHub
# Después de aprobar, merge a main
```

## 📦 Tags para Versiones

```bash
# Crear tag para versión
git tag -a v1.0.0 -m "Versión 1.0.0 - Sistema completo"

# Subir tag
git push origin v1.0.0

# Ver tags
git tag -l
```

## 🔄 Actualizar desde Remoto

```bash
# Traer cambios
git pull origin main

# Si hay conflictos, resolverlos y luego:
git add .
git commit -m "merge: Resolver conflictos"
git push origin main
```

## 📞 Ayuda

Si tienes problemas con Git:

```bash
# Ver historial
git log --oneline

# Ver cambios no commiteados
git diff

# Deshacer cambios locales (CUIDADO)
git checkout -- archivo.txt

# Ver archivos ignorados
git status --ignored
```

---

**¡Listo para subir!** 🚀

Ejecuta los comandos en orden y verifica que todo esté correcto.
