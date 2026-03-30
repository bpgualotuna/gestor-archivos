const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function closeConnections() {
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

  try {
    console.log('🔍 Verificando conexiones activas...');
    
    // Ver conexiones activas
    const result = await pool.query(`
      SELECT pid, usename, application_name, client_addr, state, query_start
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
      ORDER BY query_start DESC
    `, [process.env.DB_NAME]);

    console.log(`\n📊 Conexiones activas: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\nDetalles de conexiones:');
      result.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. PID: ${row.pid}, Usuario: ${row.usename}, Estado: ${row.state}, App: ${row.application_name || 'N/A'}`);
      });

      console.log('\n⚠️  Para cerrar conexiones manualmente, ejecuta en Azure Portal:');
      console.log('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();');
    } else {
      console.log('✅ No hay conexiones activas que cerrar');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Pool cerrado');
  }
}

closeConnections();
