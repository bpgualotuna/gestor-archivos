/**
 * Script para refrescar las vistas de la base de datos
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

async function refreshViews() {
  console.log('============================================================');
  console.log('🔄 Refrescando Vistas de Base de Datos');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    console.log('📋 Recreando vista cases_with_creator...');
    
    // Eliminar y recrear la vista
    await client.query('DROP VIEW IF EXISTS cases_with_creator CASCADE');
    
    await client.query(`
      CREATE VIEW cases_with_creator AS
      SELECT 
          c.*,
          u.first_name || ' ' || u.last_name as creator_name,
          u.email as creator_email,
          (SELECT COUNT(*) FROM files WHERE case_id = c.id AND is_deleted = false) as file_count,
          (SELECT COUNT(*) FROM comments WHERE case_id = c.id) as comment_count
      FROM cases c
      JOIN users u ON c.created_by = u.id
    `);
    
    console.log('✅ Vista cases_with_creator recreada\n');

    // Verificar que la vista incluye current_area_role
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cases_with_creator' 
        AND column_name = 'current_area_role'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Campo current_area_role está presente en la vista\n');
    } else {
      console.log('⚠️  Campo current_area_role NO está en la vista\n');
    }

    // Probar la vista
    console.log('🧪 Probando vista con un caso...');
    const testResult = await client.query(`
      SELECT id, case_number, current_area_role, creator_name
      FROM cases_with_creator
      LIMIT 1
    `);

    if (testResult.rows.length > 0) {
      const row = testResult.rows[0];
      console.log(`   Caso: ${row.case_number}`);
      console.log(`   Área: ${row.current_area_role || 'NULL'}`);
      console.log(`   Creador: ${row.creator_name}`);
    }

    console.log('\n============================================================');
    console.log('🎉 Vistas refrescadas exitosamente');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

refreshViews();
