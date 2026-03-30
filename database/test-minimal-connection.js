const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  // Usar Client en lugar de Pool para una sola conexión
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('🔌 Intentando conectar a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Probar una query simple
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('📊 Base de datos:', result.rows[0].db_name);
    console.log('⏰ Hora actual:', result.rows[0].current_time);

    // Verificar el límite de conexiones
    const limitResult = await client.query(`
      SELECT name, setting, unit 
      FROM pg_settings 
      WHERE name IN ('max_connections', 'superuser_reserved_connections')
    `);
    
    console.log('\n📋 Configuración de conexiones:');
    limitResult.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.setting}${row.unit || ''}`);
    });

    // Contar conexiones activas
    const activeResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    
    console.log(`\n🔢 Conexiones activas actuales: ${activeResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Soluciones:');
    console.log('1. Ve a Azure Portal y reinicia el servidor PostgreSQL');
    console.log('2. O ejecuta en Azure Query Editor:');
    console.log('   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();');
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

testConnection();
