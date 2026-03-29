-- ============================================
-- DATOS INICIALES (SEED DATA)
-- ============================================

-- Nota: Las contraseñas están hasheadas con MD5 para compatibilidad con Azure PostgreSQL
-- En producción, implementa un sistema de hash más seguro (bcrypt) en la capa de aplicación

-- Insertar usuario administrador por defecto
-- Password: Admin123! (hash MD5 para desarrollo - CAMBIAR EN PRODUCCIÓN)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@sistema.com', md5('Admin123!'), 'Admin', 'Sistema', 'ADMIN'),
('comercial@sistema.com', md5('Comercial123!'), 'Usuario', 'Comercial', 'COMERCIAL'),
('tecnica@sistema.com', md5('Tecnica123!'), 'Usuario', 'Técnica', 'TECNICA'),
('financiera@sistema.com', md5('Financiera123!'), 'Usuario', 'Financiera', 'FINANCIERA'),
('legal@sistema.com', md5('Legal123!'), 'Usuario', 'Legal', 'LEGAL'),
('usuario@sistema.com', md5('Usuario123!'), 'Usuario', 'Normal', 'USER');

-- Crear workflow template por defecto
INSERT INTO workflow_templates (id, name, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Flujo de Aprobación Estándar', 'Flujo que pasa por todas las áreas: Comercial → Técnica → Financiera → Legal', true);

-- Crear pasos del workflow
INSERT INTO workflow_steps (workflow_template_id, step_order, step_name, required_role, is_required) VALUES
('550e8400-e29b-41d4-a716-446655440000', 1, 'Revisión Comercial', 'COMERCIAL', true),
('550e8400-e29b-41d4-a716-446655440000', 2, 'Revisión Técnica', 'TECNICA', true),
('550e8400-e29b-41d4-a716-446655440000', 3, 'Revisión Financiera', 'FINANCIERA', true),
('550e8400-e29b-41d4-a716-446655440000', 4, 'Revisión Legal y Firma', 'LEGAL', true);
