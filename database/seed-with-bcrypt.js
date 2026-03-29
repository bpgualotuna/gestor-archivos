/**
 * Script para insertar usuarios con contraseñas hasheadas con bcrypt
 * Ejecutar con: node database/seed-with-bcrypt.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos desde variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || 'data-base-src.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gestion_archivos_db',
  user: process.env.DB_USER || 'azureuser',
  password: process.env.DB_PASSWORD || 'EnyOcyBZ#',
  ssl: {
    rejectUnauthorized: false
  }
});

const users = [
  { email: 'admin@sistema.com', password: 'Admin123!', firstName: 'Admin', lastName: 'Sistema', role: 'ADMIN' },
  { email: 'comercial@sistema.com', password: 'Comercial123!', firstName: 'Usuario', lastName: 'Comercial', role: 'COMERCIAL' },
  { email: 'tecnica@sistema.com', password: 'Tecnica123!', firstName: 'Usuario', lastName: 'Técnica', role: 'TECNICA' },
  { email: 'financiera@sistema.com', password: 'Financiera123!', firstName: 'Usuario', lastName: 'Financiera', role: 'FINANCIERA' },
  { email: 'legal@sistema.com', password: 'Legal123!', firstName: 'Usuario', lastName: 'Legal', role: 'LEGAL' },
  { email: 'usuario@sistema.com', password: 'Usuario123!', firstName: 'Usuario', lastName: 'Normal', role: 'USER' }
];

async function seedUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando seed de usuarios...');
    
    for (const user of users) {
      // Hash de la contraseña con bcrypt
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      // Insertar usuario
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             role = EXCLUDED.role`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role]
      );
      
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    }
    
    // Crear workflow template por defecto
    const workflowResult = await client.query(
      `INSERT INTO workflow_templates (id, name, description, is_active)
       VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Flujo de Aprobación Estándar', 
               'Flujo que pasa por todas las áreas: Comercial → Técnica → Financiera → Legal', true)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`
    );
    
    if (workflowResult.rowCount > 0) {
      console.log('✅ Workflow template creado');
      
      // Crear pasos del workflow
      const steps = [
        { order: 1, name: 'Revisión Comercial', role: 'COMERCIAL' },
        { order: 2, name: 'Revisión Técnica', role: 'TECNICA' },
        { order: 3, name: 'Revisión Financiera', role: 'FINANCIERA' },
        { order: 4, name: 'Revisión Legal y Firma', role: 'LEGAL' }
      ];
      
      for (const step of steps) {
        await client.query(
          `INSERT INTO workflow_steps (workflow_template_id, step_order, step_name, required_role, is_required)
           VALUES ('550e8400-e29b-41d4-a716-446655440000', $1, $2, $3, true)
           ON CONFLICT (workflow_template_id, step_order) DO NOTHING`,
          [step.order, step.name, step.role]
        );
        console.log(`✅ Paso ${step.order} creado: ${step.name}`);
      }
    } else {
      console.log('ℹ️  Workflow template ya existe');
    }
    
    console.log('\n✨ Seed completado exitosamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('┌─────────────────────────────┬──────────────┬────────────┐');
    console.log('│ Email                       │ Password     │ Rol        │');
    console.log('├─────────────────────────────┼──────────────┼────────────┤');
    users.forEach(u => {
      console.log(`│ ${u.email.padEnd(27)} │ ${u.password.padEnd(12)} │ ${u.role.padEnd(10)} │`);
    });
    console.log('└─────────────────────────────┴──────────────┴────────────┘');
    console.log('\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción\n');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar seed
seedUsers().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
