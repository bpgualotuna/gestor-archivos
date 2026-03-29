/**
 * Script para verificar los roles definidos en la base de datos
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

async function checkRoles() {
  console.log('============================================================');
  console.log('🔍 Verificando Roles en la Base de Datos');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    // Verificar el enum user_role
    const enumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumsortorder
    `);

    console.log('Roles definidos en el enum user_role:');
    enumResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.enumlabel}`);
    });

    console.log('\n============================================================');
    console.log('Roles actuales de usuarios:');
    console.log('============================================================\n');

    const usersResult = await client.query(`
      SELECT email, role 
      FROM users 
      ORDER BY role
    `);

    usersResult.rows.forEach(user => {
      console.log(`  ${user.email} → ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRoles();
