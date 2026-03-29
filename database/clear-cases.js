/**
 * Script para vaciar todos los casos y datos relacionados
 * Mantiene: usuarios y workflow
 * Elimina: casos, archivos, comentarios, notificaciones, audit_log
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearCases() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Iniciando limpieza de casos...\n');

    await client.query('BEGIN');

    // 1. Eliminar notificaciones
    const notificationsResult = await client.query('DELETE FROM notifications RETURNING id');
    console.log(`✅ Eliminadas ${notificationsResult.rowCount} notificaciones`);

    // 2. Eliminar comentarios
    const commentsResult = await client.query('DELETE FROM comments RETURNING id');
    console.log(`✅ Eliminados ${commentsResult.rowCount} comentarios`);

    // 3. Eliminar audit_log
    const auditResult = await client.query('DELETE FROM audit_log RETURNING id');
    console.log(`✅ Eliminados ${auditResult.rowCount} registros de auditoría`);

    // 4. Eliminar archivos
    const filesResult = await client.query('DELETE FROM files RETURNING id');
    console.log(`✅ Eliminados ${filesResult.rowCount} archivos`);

    // 5. Eliminar progreso de workflow
    const progressResult = await client.query('DELETE FROM workflow_step_progress RETURNING id');
    console.log(`✅ Eliminados ${progressResult.rowCount} registros de progreso de workflow`);

    // 6. Eliminar instancias de workflow
    const workflowsResult = await client.query('DELETE FROM case_workflows RETURNING id');
    console.log(`✅ Eliminadas ${workflowsResult.rowCount} instancias de workflow`);

    // 7. Eliminar casos
    const casesResult = await client.query('DELETE FROM cases RETURNING id');
    console.log(`✅ Eliminados ${casesResult.rowCount} casos`);

    await client.query('COMMIT');

    console.log('\n✨ Limpieza completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Casos eliminados: ${casesResult.rowCount}`);
    console.log(`   - Archivos eliminados: ${filesResult.rowCount}`);
    console.log(`   - Comentarios eliminados: ${commentsResult.rowCount}`);
    console.log(`   - Notificaciones eliminadas: ${notificationsResult.rowCount}`);
    console.log(`   - Registros de auditoría eliminados: ${auditResult.rowCount}`);
    console.log(`   - Progreso de workflow eliminado: ${progressResult.rowCount}`);
    console.log(`   - Instancias de workflow eliminadas: ${workflowsResult.rowCount}`);
    
    console.log('\n✅ Los usuarios y la configuración del workflow se mantienen intactos.');
    console.log('✅ Puedes empezar a crear casos desde cero.\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al limpiar casos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
clearCases()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
