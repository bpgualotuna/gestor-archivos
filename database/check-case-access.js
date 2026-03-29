/**
 * Script para verificar el acceso a un caso específico
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

async function checkCaseAccess() {
  const caseId = '918e3eb0-c899-456e-a4d1-8cd4f262f3a1';
  const userEmail = 'comercial@sistema.com';

  console.log('============================================================');
  console.log('🔍 Verificando Acceso al Caso');
  console.log('============================================================\n');

  const client = await pool.connect();
  
  try {
    // Obtener información del usuario
    const userResult = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('👤 Usuario:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);

    // Obtener información del caso
    const caseResult = await client.query(
      `SELECT 
        c.id, c.case_number, c.title, c.status, 
        c.created_by, c.current_area_role,
        u.email as creator_email,
        u.first_name || ' ' || u.last_name as creator_name
      FROM cases c
      JOIN users u ON c.created_by = u.id
      WHERE c.id = $1`,
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      console.log('❌ Caso no encontrado');
      return;
    }

    const caseData = caseResult.rows[0];
    console.log('📁 Caso:');
    console.log(`   Número: ${caseData.case_number}`);
    console.log(`   Título: ${caseData.title}`);
    console.log(`   Estado: ${caseData.status}`);
    console.log(`   Área Actual: ${caseData.current_area_role || 'NULL'}`);
    console.log(`   Creado por: ${caseData.creator_name} (${caseData.creator_email})`);
    console.log(`   ID Creador: ${caseData.created_by}\n`);

    // Verificar acceso
    console.log('🔐 Verificación de Acceso:');
    
    const isAdmin = user.role === 'ADMIN';
    const isCreator = user.id === caseData.created_by;
    const isAreaMatch = caseData.current_area_role && user.role === caseData.current_area_role;

    console.log(`   ¿Es Admin? ${isAdmin ? '✅ Sí' : '❌ No'}`);
    console.log(`   ¿Es Creador? ${isCreator ? '✅ Sí' : '❌ No'}`);
    console.log(`   ¿Rol coincide con área? ${isAreaMatch ? '✅ Sí' : '❌ No'}`);
    console.log(`     - Rol usuario: ${user.role}`);
    console.log(`     - Área del caso: ${caseData.current_area_role || 'NULL'}\n`);

    if (isAdmin || isCreator || isAreaMatch) {
      console.log('✅ ACCESO PERMITIDO');
    } else {
      console.log('❌ ACCESO DENEGADO');
      console.log('\n💡 Solución:');
      if (!caseData.current_area_role) {
        console.log('   El caso no tiene current_area_role asignado.');
        console.log('   Ejecuta: node database/update-case-areas.js');
      } else {
        console.log(`   El usuario necesita rol ${caseData.current_area_role} para acceder.`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCaseAccess();
