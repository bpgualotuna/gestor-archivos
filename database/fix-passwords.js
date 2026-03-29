/**
 * Script para actualizar las contraseñas de todos los usuarios con bcrypt
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

async function fixPasswords() {
  console.log('============================================================');
  console.log('🔐 Actualizando Contraseñas con bcrypt');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    // Obtener todos los usuarios
    const result = await client.query('SELECT id, email FROM users');
    
    console.log(`Actualizando ${result.rows.length} usuarios...\n`);

    // Hashear la contraseña "password123"
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar todos los usuarios
    for (const user of result.rows) {
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      console.log(`✅ ${user.email} - contraseña actualizada`);
    }

    console.log('\n============================================================');
    console.log('🎉 Todas las contraseñas actualizadas exitosamente');
    console.log('============================================================');
    console.log('\n💡 Ahora puedes hacer login con:');
    console.log('   Email: cualquier usuario de la lista');
    console.log('   Password: password123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPasswords();
