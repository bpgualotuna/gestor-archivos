const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    await pool.query('SELECT 1');
    console.log('✅ Conexión establecida\n');

    console.log('📋 Ejecutando migración de notificaciones...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migration-notifications.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);
    console.log('✅ Migración ejecutada exitosamente\n');

    // Verificar que la tabla fue creada
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabla "notifications" creada correctamente');
      
      // Verificar funciones
      const functionsCheck = await pool.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name IN (
          'get_user_notifications',
          'count_unread_notifications',
          'mark_notification_read',
          'mark_all_notifications_read',
          'create_notification'
        )
        ORDER BY routine_name;
      `);
      
      console.log(`✅ ${functionsCheck.rows.length} funciones creadas:`);
      functionsCheck.rows.forEach(row => {
        console.log(`   - ${row.routine_name}`);
      });
    } else {
      console.log('❌ Error: La tabla "notifications" no fue creada');
    }

    console.log('\n🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
