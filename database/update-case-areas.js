/**
 * Script para actualizar el current_area_role de los casos existentes
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

async function updateCaseAreas() {
  console.log('============================================================');
  console.log('🔄 Actualizando current_area_role de casos');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    // Actualizar casos basado en su paso actual del workflow
    const updateResult = await client.query(`
      UPDATE cases c
      SET current_area_role = ws.required_role
      FROM case_workflows cw
      JOIN workflow_steps ws ON ws.workflow_template_id = cw.workflow_template_id 
          AND ws.step_order = cw.current_step_order
      WHERE c.id = cw.case_id
        AND c.status IN ('SUBMITTED', 'IN_REVIEW')
      RETURNING c.id, c.case_number, c.current_area_role
    `);

    console.log(`✅ ${updateResult.rows.length} casos actualizados\n`);

    if (updateResult.rows.length > 0) {
      console.log('Casos actualizados:');
      updateResult.rows.forEach(row => {
        console.log(`  - ${row.case_number} → ${row.current_area_role}`);
      });
    }

    // Mostrar resumen de casos por área
    console.log('\n============================================================');
    console.log('📊 Resumen de casos por área:');
    console.log('============================================================\n');

    const summaryResult = await client.query(`
      SELECT 
        current_area_role,
        status,
        COUNT(*) as count
      FROM cases
      WHERE status IN ('SUBMITTED', 'IN_REVIEW', 'RETURNED')
      GROUP BY current_area_role, status
      ORDER BY current_area_role, status
    `);

    summaryResult.rows.forEach(row => {
      const area = row.current_area_role || 'SIN ASIGNAR';
      console.log(`  ${area} (${row.status}): ${row.count} casos`);
    });

    console.log('\n============================================================');
    console.log('🎉 Actualización completada');
    console.log('============================================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCaseAreas();
