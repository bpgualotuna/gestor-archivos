# Migración: Nuevos Campos del Formulario de Revisión Legal

## Descripción

Esta migración agrega los campos necesarios para el formulario de "Solicitud Revisión Legal y Firma de Documentos" a la tabla `cases`.

## Nuevos Campos Agregados

1. **advisor_name** - Asesor comercial o responsable de la solicitud
2. **document_file_name** - Nombre completo del archivo con extensión
3. **odoo_code** - Código Odoo (máximo 6 caracteres, empieza con "S")
4. **client_provider** - Nombre del cliente o proveedor
5. **document_type** - Tipo de documento (CONTRATO, CONVENIO, ACUERDO, OTRO)
6. **sharepoint_url** - URL del documento en SharePoint
7. **request_date** - Fecha de la solicitud
8. **required_delivery_date** - Fecha de entrega requerida
9. **urgency_justification** - Justificación si es urgente
10. **signature_type** - Tipo de firma (FISICA, ELECTRONICA)
11. **template_type** - Tipo de plantilla (PLANTILLA_COMWARE, PLANTILLA_CLIENTE, PLANTILLA_PROVEEDOR)
12. **observations** - Observaciones adicionales

## Nuevos Tipos ENUM

- `document_type`
- `signature_type`
- `template_type`

## Cómo Ejecutar la Migración

### Opción 1: Usando el script npm (Recomendado)

```bash
npm run db:migrate-case-fields
```

### Opción 2: Ejecutar manualmente el SQL

```bash
psql -h <host> -U <user> -d <database> -f database/migration-case-fields.sql
```

## Verificación

Después de ejecutar la migración, puedes verificar que las columnas se agregaron correctamente:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name IN (
  'advisor_name', 'document_file_name', 'odoo_code', 'client_provider',
  'document_type', 'sharepoint_url', 'request_date', 'required_delivery_date',
  'urgency_justification', 'signature_type', 'template_type', 'observations'
);
```

## Cambios en el Código

### Archivos Modificados

1. **types/case.types.ts** - Agregados nuevos tipos y campos a las interfaces
2. **lib/validations/case.schema.ts** - Agregadas validaciones para los nuevos campos
3. **components/cases/CreateCaseForm.tsx** - Formulario actualizado con todos los campos
4. **services/case.service.ts** - Servicio actualizado para manejar los nuevos campos

### Archivos Nuevos

1. **database/migration-case-fields.sql** - Script SQL de migración
2. **database/run-case-fields-migration.js** - Script Node.js para ejecutar la migración

## Notas Importantes

- Todos los nuevos campos son opcionales (nullable)
- El código Odoo tiene una validación que requiere que empiece con "S"
- La migración es segura y no afecta los datos existentes
- Los casos existentes tendrán estos campos como NULL

## Rollback

Si necesitas revertir la migración:

```sql
-- Eliminar columnas
ALTER TABLE cases DROP COLUMN IF EXISTS advisor_name;
ALTER TABLE cases DROP COLUMN IF EXISTS document_file_name;
ALTER TABLE cases DROP COLUMN IF EXISTS odoo_code;
ALTER TABLE cases DROP COLUMN IF EXISTS client_provider;
ALTER TABLE cases DROP COLUMN IF EXISTS document_type;
ALTER TABLE cases DROP COLUMN IF EXISTS sharepoint_url;
ALTER TABLE cases DROP COLUMN IF EXISTS request_date;
ALTER TABLE cases DROP COLUMN IF EXISTS required_delivery_date;
ALTER TABLE cases DROP COLUMN IF EXISTS urgency_justification;
ALTER TABLE cases DROP COLUMN IF EXISTS signature_type;
ALTER TABLE cases DROP COLUMN IF EXISTS template_type;
ALTER TABLE cases DROP COLUMN IF EXISTS observations;

-- Eliminar tipos ENUM
DROP TYPE IF EXISTS document_type;
DROP TYPE IF EXISTS signature_type;
DROP TYPE IF EXISTS template_type;
```
