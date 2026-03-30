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
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('✅ Conectado a la base de datos');
    
    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, 'migration-roles-areas.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Ejecutando migración de roles y áreas...');
    console.log('⚠️  IMPORTANTE: Esta migración modificará la estructura de usuarios y casos');
    console.log('');
    
    // Ejecutar la migración
    await pool.query(migrationSQL);
    
    console.log('✅ Migración completada exitosamente\n');
    
    console.log('📋 Cambios realizados:');
    console.log('  1. Roles simplificados:');
    console.log('     - USER: Usuario normal (crea casos)');
    console.log('     - AREA_USER: Usuario de área (revisa casos)');
    console.log('     - ADMIN: Administrador');
    console.log('');
    console.log('  2. Nuevo campo "area" en usuarios:');
    console.log('     - COMERCIAL, TECNICA, FINANCIERA, LEGAL');
    console.log('');
    console.log('  3. Actualizado campo "current_area" en casos');
    console.log('  4. Actualizado campo "required_area" en workflow_steps');
    console.log('  5. Función get_cases_for_user actualizada');
    console.log('');
    
    // Verificar usuarios migrados
    const usersResult = await pool.query(`
      SELECT role, area, COUNT(*) as count
      FROM users
      GROUP BY role, area
      ORDER BY role, area
    `);
    
    console.log('👥 Usuarios por rol y área:');
    usersResult.rows.forEach(row => {
      const areaText = row.area ? ` (${row.area})` : '';
      console.log(`  - ${row.role}${areaText}: ${row.count} usuario(s)`);
    });
    
    console.log('\n✅ Proceso completado');
    console.log('\n⚠️  SIGUIENTE PASO:');
    console.log('   Reinicia el servidor de desarrollo: npm run dev');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
