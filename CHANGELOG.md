# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.0.0] - 2026-03-28

### ✨ Características Principales

#### Sistema Base
- Sistema completo de gestión de documentos
- Arquitectura Next.js 16 + React 19
- Base de datos PostgreSQL en Azure
- Almacenamiento de archivos en Azure Blob Storage

#### Autenticación y Autorización
- Sistema de login con NextAuth.js
- Autenticación basada en JWT (sesiones de 8 horas)
- 6 roles de usuario: USER, ADMIN, COMERCIAL, TECNICA, FINANCIERA, LEGAL
- Control de acceso basado en roles (RBAC)
- Middleware de protección de rutas
- Validación de permisos en todos los endpoints

#### Gestión de Casos
- Creación de casos por usuarios
- Estados: DRAFT, SUBMITTED, IN_REVIEW, RETURNED, APPROVED, REJECTED
- Asignación automática a áreas según flujo
- Filtrado de casos por rol de usuario
- Dashboard personalizado por rol

#### Flujo de Aprobación
- Workflow configurable de 4 pasos: Comercial → Técnica → Financiera → Legal
- Aprobación por área con comentarios
- Devolución de casos al usuario con motivo
- Reenvío inteligente (vuelve al área que lo devolvió)
- Tracking completo del progreso
- Visualización de flujo con stepper

#### Gestión de Archivos
- Subida de archivos con validación de tipo y tamaño (máx 50MB)
- Almacenamiento en Azure Blob Storage
- Versionado de archivos
- Listado de archivos con información detallada
- Descarga de archivos
- Tipos soportados: PDF, DOC, DOCX, XLS, XLSX, imágenes

#### Historial y Auditoría
- Registro completo de todas las acciones (audit log)
- Timeline de eventos por caso
- Comentarios en casos
- Tracking de quién hizo qué y cuándo

#### Interfaz de Usuario
- Dashboard responsive con TailwindCSS
- Componentes reutilizables
- Badges de estado con colores
- Modales de confirmación
- Mensajes de éxito/error
- Navegación intuitiva por pestañas
- Menú de usuario con logout

### 🗄️ Base de Datos

#### Tablas Creadas
- `users` - Usuarios del sistema
- `cases` - Casos/expedientes
- `files` - Archivos subidos
- `workflow_templates` - Plantillas de flujo
- `workflow_steps` - Pasos del flujo
- `case_workflows` - Instancias de flujo por caso
- `workflow_step_progress` - Progreso de cada paso
- `comments` - Comentarios en casos
- `audit_log` - Registro de auditoría
- `notifications` - Sistema de notificaciones
- `user_sessions` - Sesiones activas

#### Vistas
- `cases_with_creator` - Casos con información del creador
- `workflow_progress_view` - Vista del progreso del workflow
- `cases_by_area` - Casos filtrados por área

#### Funciones
- `get_cases_for_user()` - Filtrado de casos según rol
- `cleanup_expired_sessions()` - Limpieza de sesiones expiradas
- `update_case_current_area()` - Actualización automática de área

#### Triggers
- `trigger_update_case_area` - Actualiza área al cambiar paso del workflow

### 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Sesiones JWT firmadas con secret seguro
- Validación de entrada con Zod en todos los endpoints
- Protección contra SQL injection (prepared statements)
- Validación de permisos en cada operación
- SSL/TLS para conexiones a base de datos
- Audit trail completo

### 📝 Documentación

- README.md completo con instrucciones
- AUTH_SETUP_GUIDE.md - Guía de autenticación
- DEPLOYMENT.md - Guía de deployment
- FASE2_COMPLETADA.md - Resumen de Fase 2
- Scripts de utilidad documentados

### 🛠️ Scripts de Utilidad

- `db:test` - Verificar conexión a base de datos
- `db:seed` - Crear usuarios de prueba
- `db:demo` - Crear datos de demostración
- `db:migrate` - Ejecutar migraciones
- Scripts de verificación de usuarios, roles y acceso

### 🐛 Correcciones

- Contraseñas ahora usan bcrypt en lugar de pgcrypto
- Compatibilidad con Azure PostgreSQL (sin extensiones)
- Manejo correcto de NULL en campos opcionales
- Validación de longitud mínima en comentarios (10 caracteres)
- Reenvío de casos devueltos va al área correcta
- Actualización automática de `current_area_role`
- Refrescado de vistas después de migración
- Delay en redirecciones para evitar errores 403

### 🎨 Mejoras de UI/UX

- Contador de caracteres en campos de texto
- Validación en tiempo real de formularios
- Botones deshabilitados hasta cumplir requisitos
- Mensajes de error claros y específicos
- Indicadores visuales de estado
- Iconos según tipo de archivo
- Formato de fechas en español
- Tamaño de archivos legible

### 📦 Dependencias Principales

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "next-auth": "^4.24.10",
  "@tanstack/react-query": "^5.59.0",
  "@azure/storage-blob": "^12.25.0",
  "pg": "^8.13.1",
  "bcryptjs": "^2.4.3",
  "zod": "^3.24.1",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.468.0"
}
```

### 🚀 Rendimiento

- Connection pooling configurado (20 conexiones)
- Timeouts optimizados (30 segundos)
- Keep-alive habilitado en conexiones
- Índices en campos críticos
- Queries optimizadas con JOINs
- React Query para caché de datos

### 📊 Estadísticas

- 14 tablas en base de datos
- 10+ endpoints de API
- 15+ componentes React
- 8+ hooks personalizados
- 5 servicios de negocio
- 6 roles de usuario
- 4 pasos de workflow

## [Próximas Versiones]

### Planificado para v1.1.0
- [ ] Notificaciones en tiempo real
- [ ] Dashboard con estadísticas
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Búsqueda avanzada de casos
- [ ] Filtros en listados
- [ ] Paginación de resultados

### Planificado para v1.2.0
- [ ] Sistema de plantillas de documentos
- [ ] Firma digital de documentos
- [ ] Integración con email
- [ ] Recordatorios automáticos
- [ ] Métricas y analytics

### Planificado para v2.0.0
- [ ] 2FA (autenticación de dos factores)
- [ ] API pública con documentación
- [ ] Webhooks para integraciones
- [ ] Multi-tenancy
- [ ] Temas personalizables

---

**Formato del Changelog**: Basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)

**Versionado**: Sigue [Semantic Versioning](https://semver.org/lang/es/)
