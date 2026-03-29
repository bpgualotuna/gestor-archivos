-- ============================================
-- SISTEMA DE GESTIÓN DE ARCHIVOS BASADO EN CASOS
-- PostgreSQL Schema
-- ============================================

-- Nota: Usamos gen_random_uuid() que está disponible por defecto en PostgreSQL 13+
-- No requiere extensiones adicionales en Azure PostgreSQL

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
    'USER',
    'COMERCIAL',
    'TECNICA',
    'FINANCIERA',
    'LEGAL',
    'ADMIN'
);

CREATE TYPE case_status AS ENUM (
    'DRAFT',           -- Borrador
    'SUBMITTED',       -- Enviado
    'IN_REVIEW',       -- En revisión
    'APPROVED',        -- Aprobado
    'REJECTED',        -- Rechazado
    'RETURNED',        -- Devuelto para corrección
    'COMPLETED',       -- Completado
    'CANCELLED'        -- Cancelado
);

CREATE TYPE file_type AS ENUM (
    'DOCUMENT',
    'IMAGE',
    'PDF',
    'SPREADSHEET',
    'OTHER'
);

CREATE TYPE action_type AS ENUM (
    'CREATED',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'RETURNED',
    'UPDATED',
    'FILE_UPLOADED',
    'FILE_DELETED',
    'COMMENT_ADDED',
    'STATUS_CHANGED',
    'ASSIGNED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE workflow_step_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'APPROVED',
    'REJECTED',
    'SKIPPED'
);

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de casos
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status case_status NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    current_step_id UUID,  -- Referencia al paso actual del workflow
    priority INTEGER DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del workflow (flujo de aprobación)
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pasos del workflow
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    required_role user_role NOT NULL,
    is_required BOOLEAN DEFAULT true,
    can_skip BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_template_id, step_order)
);

-- Instancias de workflow por caso
CREATE TABLE case_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id),
    current_step_order INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(case_id)
);

-- Progreso de cada paso del workflow
CREATE TABLE workflow_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_workflow_id UUID NOT NULL REFERENCES case_workflows(id) ON DELETE CASCADE,
    workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id),
    status workflow_step_status DEFAULT 'PENDING',
    assigned_to UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    comments TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_workflow_id, workflow_step_id)
);

-- Tabla de archivos
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type file_type NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    description TEXT,
    signature_reason TEXT,  -- Motivo de firma
    blob_url TEXT NOT NULL,  -- URL en Azure Blob
    blob_path TEXT NOT NULL,  -- Ruta completa en blob
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES files(id),  -- Para versionado
    is_final BOOLEAN DEFAULT false,  -- Archivo final firmado
    is_deleted BOOLEAN DEFAULT false,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Historial de auditoría
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action action_type NOT NULL,
    entity_type VARCHAR(50),  -- 'case', 'file', 'workflow', etc.
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    comments TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios y observaciones
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES comments(id),  -- Para respuestas
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,  -- Comentario interno del área
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Casos
CREATE INDEX idx_cases_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_status_created ON cases(status, created_at DESC);

-- Archivos
CREATE INDEX idx_files_case_id ON files(case_id);
CREATE INDEX idx_files_parent ON files(parent_file_id);
CREATE INDEX idx_files_version ON files(case_id, version);
CREATE INDEX idx_files_final ON files(case_id, is_final) WHERE is_final = true;
CREATE INDEX idx_files_deleted ON files(is_deleted) WHERE is_deleted = false;

-- Workflow
CREATE INDEX idx_workflow_steps_template ON workflow_steps(workflow_template_id, step_order);
CREATE INDEX idx_case_workflows_case ON case_workflows(case_id);
CREATE INDEX idx_workflow_progress_case ON workflow_step_progress(case_workflow_id);
CREATE INDEX idx_workflow_progress_assigned ON workflow_step_progress(assigned_to) WHERE status = 'IN_PROGRESS';

-- Auditoría
CREATE INDEX idx_audit_case ON audit_log(case_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Comentarios
CREATE INDEX idx_comments_case ON comments(case_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Notificaciones
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de caso automático
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix VARCHAR(4);
    next_number INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM cases
    WHERE case_number LIKE year_prefix || '%';
    
    NEW.case_number := year_prefix || '-' || LPAD(next_number::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de caso
CREATE TRIGGER generate_case_number_trigger
    BEFORE INSERT ON cases
    FOR EACH ROW
    WHEN (NEW.case_number IS NULL)
    EXECUTE FUNCTION generate_case_number();

-- Función para registrar en audit_log automáticamente
CREATE OR REPLACE FUNCTION log_case_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (case_id, user_id, action, entity_type, entity_id, new_value)
        VALUES (NEW.id, NEW.created_by, 'CREATED', 'case', NEW.id, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO audit_log (case_id, user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES (NEW.id, NEW.created_by, 'STATUS_CHANGED', 'case', NEW.id, 
                    jsonb_build_object('status', OLD.status), 
                    jsonb_build_object('status', NEW.status));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para audit log de casos
CREATE TRIGGER log_case_changes_trigger
    AFTER INSERT OR UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION log_case_changes();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de casos con información del creador
CREATE VIEW cases_with_creator AS
SELECT 
    c.*,
    u.first_name || ' ' || u.last_name as creator_name,
    u.email as creator_email,
    (SELECT COUNT(*) FROM files WHERE case_id = c.id AND is_deleted = false) as file_count,
    (SELECT COUNT(*) FROM comments WHERE case_id = c.id) as comment_count
FROM cases c
JOIN users u ON c.created_by = u.id;

-- Vista de progreso de workflow
CREATE VIEW workflow_progress_view AS
SELECT 
    cw.case_id,
    cw.workflow_template_id,
    wt.name as workflow_name,
    ws.step_order,
    ws.step_name,
    ws.required_role,
    wsp.status as step_status,
    wsp.assigned_to,
    wsp.reviewed_by,
    u1.first_name || ' ' || u1.last_name as assigned_to_name,
    u2.first_name || ' ' || u2.last_name as reviewed_by_name,
    wsp.comments,
    wsp.completed_at
FROM case_workflows cw
JOIN workflow_templates wt ON cw.workflow_template_id = wt.id
JOIN workflow_steps ws ON ws.workflow_template_id = wt.id
LEFT JOIN workflow_step_progress wsp ON wsp.case_workflow_id = cw.id AND wsp.workflow_step_id = ws.id
LEFT JOIN users u1 ON wsp.assigned_to = u1.id
LEFT JOIN users u2 ON wsp.reviewed_by = u2.id
ORDER BY cw.case_id, ws.step_order;

-- ============================================
-- CONSTRAINTS ADICIONALES
-- ============================================

-- Asegurar que el orden de pasos sea consecutivo
ALTER TABLE workflow_steps ADD CONSTRAINT check_step_order_positive 
    CHECK (step_order > 0);

-- Asegurar que el tamaño de archivo sea positivo
ALTER TABLE files ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size > 0);

-- Asegurar que la versión sea positiva
ALTER TABLE files ADD CONSTRAINT check_version_positive 
    CHECK (version > 0);

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users IS 'Usuarios del sistema con roles específicos';
COMMENT ON TABLE cases IS 'Casos principales del sistema';
COMMENT ON TABLE workflow_templates IS 'Plantillas de flujo de aprobación configurables';
COMMENT ON TABLE workflow_steps IS 'Pasos individuales de cada plantilla de workflow';
COMMENT ON TABLE case_workflows IS 'Instancia de workflow asignada a cada caso';
COMMENT ON TABLE workflow_step_progress IS 'Progreso de cada paso del workflow por caso';
COMMENT ON TABLE files IS 'Archivos subidos con versionado';
COMMENT ON TABLE audit_log IS 'Registro completo de auditoría del sistema';
COMMENT ON TABLE comments IS 'Comentarios y observaciones en los casos';
COMMENT ON TABLE notifications IS 'Notificaciones para usuarios';
