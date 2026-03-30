const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyNotifications() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Verificando sistema de notificaciones...\n');

    // Verificar tabla
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabla "notifications" existe');
      
      // Verificar columnas
      const columnsCheck = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'notifications'
        ORDER BY ordinal_position;
      `);
      
      console.log(`✅ Columnas (${columnsCheck.rows.length}):`);
      columnsCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('❌ Tabla "notifications" no existe');
    }

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
    
    console.log(`\n✅ Funciones (${functionsCheck.rows.length}/5):`);
    functionsCheck.rows.forEach(row => {
      console.log(`   - ${row.routine_name}`);
    });

    // Contar notificaciones
    const countCheck = await pool.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`\n📊 Notificaciones en la base de datos: ${countCheck.rows[0].count}`);

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyNotifications();
