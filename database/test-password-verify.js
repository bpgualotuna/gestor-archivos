/**
 * Script para verificar si las contraseñas están correctamente hasheadas
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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

async function testPasswordVerify() {
  console.log('============================================================');
  console.log('🔐 Verificando Contraseñas');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT email, password_hash 
      FROM users 
      WHERE email = 'usuario@sistema.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = result.rows[0];
    console.log(`Usuario: ${user.email}`);
    console.log(`Hash en BD: ${user.password_hash.substring(0, 20)}...`);
    console.log(`\nProbando contraseña: "password123"`);

    const isValid = await bcrypt.compare('password123', user.password_hash);
    
    if (isValid) {
      console.log('✅ Contraseña válida!');
    } else {
      console.log('❌ Contraseña inválida');
      console.log('\n💡 Regenerando hash correcto...');
      
      const newHash = await bcrypt.hash('password123', 10);
      console.log(`Nuevo hash: ${newHash.substring(0, 20)}...`);
      console.log('\nEjecuta este SQL en pgAdmin:');
      console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'usuario@sistema.com';`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testPasswordVerify();
