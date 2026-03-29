/**
 * Script para verificar usuarios en la base de datos
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

async function checkUsers() {
  console.log('============================================================');
  console.log('👥 Usuarios en la Base de Datos');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        email, 
        first_name, 
        last_name, 
        role, 
        is_active,
        created_at
      FROM users 
      ORDER BY role, email
    `);

    console.log(`Total de usuarios: ${result.rows.length}\n`);

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.is_active ? 'Sí' : 'No'}`);
      console.log(`   Password: password123`);
      console.log('');
    });

    console.log('============================================================');
    console.log('💡 Usa estos emails para hacer login');
    console.log('============================================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsers();
