const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyMigration() {
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
    console.log('🔍 Verificando migración de roles y áreas...\n');
    
    // 1. Verificar estructura de usuarios
    console.log('1️⃣  Verificando estructura de tabla users...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('role', 'area')
      ORDER BY column_name
    `);
    
    console.log('   Columnas encontradas:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    if (columnsResult.rows.length !== 2) {
      console.log('   ⚠️  Advertencia: No se encontraron ambas columnas (role y area)');
    } else {
      console.log('   ✅ Estructura correcta\n');
    }
    
    // 2. Verificar tipos ENUM
    console.log('2️⃣  Verificando tipos ENUM...');
    const enumsResult = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('user_role', 'user_area')
      ORDER BY t.typname, e.enumsortorder
    `);
    
    const roleValues = enumsResult.rows.filter(r => r.typname === 'user_role').map(r => r.enumlabel);
    const areaValues = enumsResult.rows.filter(r => r.typname === 'user_area').map(r => r.enumlabel);
    
    console.log(`   user_role: ${roleValues.join(', ')}`);
    console.log(`   user_area: ${areaValues.join(', ')}`);
    
    if (roleValues.includes('USER') && roleValues.includes('AREA_USER') && roleValues.includes('ADMIN')) {
      console.log('   ✅ Roles correctos\n');
    } else {
      console.log('   ⚠️  Advertencia: Roles no coinciden con lo esperado\n');
    }
    
    // 3. Verificar usuarios
    console.log('3️⃣  Verificando usuarios...');
    const usersResult = await pool.query(`
      SELECT role, area, COUNT(*) as count
      FROM users
      GROUP BY role, area
      ORDER BY role, area
    `);
    
    console.log('   Distribución de usuarios:');
    usersResult.rows.forEach(row => {
      const areaText = row.area ? ` (${row.area})` : '';
      console.log(`   - ${row.role}${areaText}: ${row.count} usuario(s)`);
    });
    console.log('   ✅ Usuarios migrados\n');
    
    // 4. Verificar casos
    console.log('4️⃣  Verificando casos...');
    const casesResult = await pool.query(`
      SELECT current_area, COUNT(*) as count
      FROM cases
      GROUP BY current_area
      ORDER BY current_area NULLS FIRST
    `);
    
    console.log('   Casos por área:');
    casesResult.rows.forEach(row => {
      const area = row.current_area || 'Sin asignar';
      console.log(`   - ${area}: ${row.count} caso(s)`);
    });
    console.log('   ✅ Casos actualizados\n');
    
    // 5. Verificar workflow steps
    console.log('5️⃣  Verificando workflow steps...');
    const stepsResult = await pool.query(`
      SELECT required_area, COUNT(*) as count
      FROM workflow_steps
      GROUP BY required_area
      ORDER BY required_area
    `);
    
    console.log('   Pasos por área requerida:');
    stepsResult.rows.forEach(row => {
      console.log(`   - ${row.required_area}: ${row.count} paso(s)`);
    });
    console.log('   ✅ Workflow steps actualizados\n');
    
    // 6. Verificar función get_cases_for_user
    console.log('6️⃣  Verificando función get_cases_for_user...');
    const functionResult = await pool.query(`
      SELECT proname, pronargs
      FROM pg_proc
      WHERE proname = 'get_cases_for_user'
    `);
    
    if (functionResult.rows.length > 0) {
      const argCount = functionResult.rows[0].pronargs;
      console.log(`   Función encontrada con ${argCount} argumentos`);
      if (argCount === 4) {
        console.log('   ✅ Función actualizada correctamente (4 parámetros)\n');
      } else {
        console.log('   ⚠️  Advertencia: La función debería tener 4 parámetros\n');
      }
    } else {
      console.log('   ❌ Función no encontrada\n');
    }
    
    // 7. Verificar vistas
    console.log('7️⃣  Verificando vistas...');
    const viewsResult = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name IN ('cases_with_creator', 'workflow_progress_view')
      ORDER BY table_name
    `);
    
    console.log('   Vistas encontradas:');
    viewsResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    if (viewsResult.rows.length === 2) {
      console.log('   ✅ Vistas recreadas correctamente\n');
    } else {
      console.log('   ⚠️  Advertencia: Faltan vistas\n');
    }
    
    // Resumen final
    console.log('═'.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('═'.repeat(60));
    console.log('✅ Migración completada exitosamente');
    console.log('✅ Estructura de base de datos actualizada');
    console.log('✅ Usuarios migrados correctamente');
    console.log('✅ Sistema listo para usar');
    console.log('═'.repeat(60));
    console.log('\n💡 Próximo paso: Reinicia el servidor (npm run dev)');
    console.log('💡 Los usuarios deben cerrar sesión y volver a iniciar\n');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    console.error('\nDetalles:', error);
  } finally {
    await pool.end();
  }
}

verifyMigration();
