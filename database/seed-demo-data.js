/**
 * Script para insertar datos de prueba completos
 * Incluye: casos, archivos, flujos, comentarios, historial
 * Ejecutar con: node database/seed-demo-data.js
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
    rejectUnauthorized: false
  }
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

async function seedDemoData() {
  const client = await pool.connect();
  
  try {
    console.log(`\n${colors.blue}🌱 Iniciando seed de datos de prueba...${colors.reset}\n`);

    // Obtener IDs de usuarios
    const usersResult = await client.query('SELECT id, email, role FROM users ORDER BY email');
    const users = {};
    usersResult.rows.forEach(user => {
      if (user.role === 'USER') users.normal = user.id;
      if (user.role === 'COMERCIAL') users.comercial = user.id;
      if (user.role === 'TECNICA') users.tecnica = user.id;
      if (user.role === 'FINANCIERA') users.financiera = user.id;
      if (user.role === 'LEGAL') users.legal = user.id;
      if (user.role === 'ADMIN') users.admin = user.id;
    });

    // Obtener workflow template
    const workflowResult = await client.query(
      'SELECT id FROM workflow_templates WHERE is_active = true LIMIT 1'
    );
    const workflowId = workflowResult.rows[0].id;

    // Obtener pasos del workflow
    const stepsResult = await client.query(
      'SELECT id, step_order, required_role FROM workflow_steps WHERE workflow_template_id = $1 ORDER BY step_order',
      [workflowId]
    );
    const steps = stepsResult.rows;

    console.log(`${colors.green}✓${colors.reset} Usuarios y workflow cargados`);

    // ============================================
    // CASO 1: Borrador (recién creado)
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 1: Borrador${colors.reset}`);
    
    const case1 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority)
       VALUES ($1, $2, 'DRAFT', $3, 3)
       RETURNING *`,
      [
        'Contrato de Servicios TI 2026',
        'Contrato anual de servicios de tecnología de la información para el departamento de sistemas',
        users.normal
      ]
    );
    console.log(`${colors.green}✓${colors.reset} Caso 1 creado: ${case1.rows[0].case_number}`);

    // ============================================
    // CASO 2: Enviado (en primer paso - Comercial)
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 2: En Revisión Comercial${colors.reset}`);
    
    const case2 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority)
       VALUES ($1, $2, 'SUBMITTED', $3, 5)
       RETURNING *`,
      [
        'Acuerdo de Confidencialidad - Cliente ABC',
        'NDA para proyecto de desarrollo de software con el cliente ABC Corp',
        users.normal
      ]
    );
    const case2Id = case2.rows[0].id;
    console.log(`${colors.green}✓${colors.reset} Caso 2 creado: ${case2.rows[0].case_number}`);

    // Crear workflow para caso 2
    const case2Workflow = await client.query(
      `INSERT INTO case_workflows (case_id, workflow_template_id, current_step_order)
       VALUES ($1, $2, 1)
       RETURNING id`,
      [case2Id, workflowId]
    );

    // Crear progreso de pasos
    for (const step of steps) {
      const status = step.step_order === 1 ? 'IN_PROGRESS' : 'PENDING';
      await client.query(
        `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status, started_at)
         VALUES ($1, $2, $3, ${step.step_order === 1 ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
        [case2Workflow.rows[0].id, step.id, status]
      );
    }

    // Agregar archivo al caso 2
    await client.query(
      `INSERT INTO files (case_id, file_name, file_type, file_size, mime_type, description, 
                          blob_url, blob_path, version, uploaded_by)
       VALUES ($1, $2, 'PDF', 245678, 'application/pdf', $3, $4, $5, 1, $6)`,
      [
        case2Id,
        'NDA_ABC_Corp_v1.pdf',
        'Acuerdo de confidencialidad inicial',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case2Id}/v1/NDA_ABC_Corp_v1.pdf`,
        `case-${case2Id}/v1/NDA_ABC_Corp_v1.pdf`,
        users.normal
      ]
    );

    console.log(`${colors.green}✓${colors.reset} Workflow y archivo agregados`);

    // ============================================
    // CASO 3: En revisión técnica (segundo paso)
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 3: En Revisión Técnica${colors.reset}`);
    
    const case3 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority)
       VALUES ($1, $2, 'IN_REVIEW', $3, 4)
       RETURNING *`,
      [
        'Propuesta Técnica - Proyecto ERP',
        'Propuesta técnica para implementación de sistema ERP empresarial',
        users.normal
      ]
    );
    const case3Id = case3.rows[0].id;
    console.log(`${colors.green}✓${colors.reset} Caso 3 creado: ${case3.rows[0].case_number}`);

    // Crear workflow para caso 3
    const case3Workflow = await client.query(
      `INSERT INTO case_workflows (case_id, workflow_template_id, current_step_order)
       VALUES ($1, $2, 2)
       RETURNING id`,
      [case3Id, workflowId]
    );

    // Crear progreso de pasos (Comercial aprobado, Técnica en progreso)
    for (const step of steps) {
      let status, reviewedBy = null, completedAt = null;
      
      if (step.step_order === 1) {
        status = 'APPROVED';
        reviewedBy = users.comercial;
        completedAt = 'CURRENT_TIMESTAMP';
      } else if (step.step_order === 2) {
        status = 'IN_PROGRESS';
      } else {
        status = 'PENDING';
      }

      await client.query(
        `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status, 
                                              reviewed_by, completed_at, started_at, comments)
         VALUES ($1, $2, $3, $4, ${completedAt || 'NULL'}, 
                 ${step.step_order <= 2 ? 'CURRENT_TIMESTAMP' : 'NULL'}, $5)`,
        [
          case3Workflow.rows[0].id, 
          step.id, 
          status, 
          reviewedBy,
          step.step_order === 1 ? 'Revisión comercial aprobada. Términos y condiciones correctos.' : null
        ]
      );
    }

    // Agregar archivos
    await client.query(
      `INSERT INTO files (case_id, file_name, file_type, file_size, mime_type, description, 
                          blob_url, blob_path, version, uploaded_by)
       VALUES ($1, $2, 'PDF', 1245678, 'application/pdf', $3, $4, $5, 1, $6)`,
      [
        case3Id,
        'Propuesta_ERP_Tecnica.pdf',
        'Propuesta técnica detallada del proyecto',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case3Id}/v1/Propuesta_ERP_Tecnica.pdf`,
        `case-${case3Id}/v1/Propuesta_ERP_Tecnica.pdf`,
        users.normal
      ]
    );

    // Agregar comentario
    await client.query(
      `INSERT INTO comments (case_id, user_id, content, is_internal)
       VALUES ($1, $2, $3, false)`,
      [
        case3Id,
        users.comercial,
        'Revisión comercial completada. Los términos económicos son adecuados. Pasando a revisión técnica.'
      ]
    );

    console.log(`${colors.green}✓${colors.reset} Workflow, archivos y comentarios agregados`);

    // ============================================
    // CASO 4: Devuelto para correcciones
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 4: Devuelto para Correcciones${colors.reset}`);
    
    const case4 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority)
       VALUES ($1, $2, 'RETURNED', $3, 5)
       RETURNING *`,
      [
        'Contrato de Arrendamiento - Oficinas',
        'Contrato de arrendamiento para nuevas oficinas en zona norte',
        users.normal
      ]
    );
    const case4Id = case4.rows[0].id;
    console.log(`${colors.green}✓${colors.reset} Caso 4 creado: ${case4.rows[0].case_number}`);

    // Crear workflow
    const case4Workflow = await client.query(
      `INSERT INTO case_workflows (case_id, workflow_template_id, current_step_order)
       VALUES ($1, $2, 3)
       RETURNING id`,
      [case4Id, workflowId]
    );

    // Progreso: Comercial y Técnica aprobados, Financiera devolvió
    for (const step of steps) {
      let status, reviewedBy = null, completedAt = null, comments = null;
      
      if (step.step_order === 1) {
        status = 'APPROVED';
        reviewedBy = users.comercial;
        completedAt = 'CURRENT_TIMESTAMP';
        comments = 'Términos comerciales aprobados';
      } else if (step.step_order === 2) {
        status = 'APPROVED';
        reviewedBy = users.tecnica;
        completedAt = 'CURRENT_TIMESTAMP';
        comments = 'Especificaciones técnicas correctas';
      } else if (step.step_order === 3) {
        status = 'PENDING';
        reviewedBy = users.financiera;
        comments = 'DEVUELTO: Falta incluir cláusula de ajuste inflacionario y desglose de gastos comunes';
      } else {
        status = 'PENDING';
      }

      await client.query(
        `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status, 
                                              reviewed_by, completed_at, started_at, comments)
         VALUES ($1, $2, $3, $4, ${completedAt || 'NULL'}, 
                 ${step.step_order <= 3 ? 'CURRENT_TIMESTAMP' : 'NULL'}, $5)`,
        [case4Workflow.rows[0].id, step.id, status, reviewedBy, comments]
      );
    }

    // Archivos con versiones
    await client.query(
      `INSERT INTO files (case_id, file_name, file_type, file_size, mime_type, description, 
                          blob_url, blob_path, version, uploaded_by)
       VALUES ($1, $2, 'PDF', 345678, 'application/pdf', $3, $4, $5, 1, $6)`,
      [
        case4Id,
        'Contrato_Arrendamiento_v1.pdf',
        'Primera versión del contrato',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case4Id}/v1/Contrato_Arrendamiento_v1.pdf`,
        `case-${case4Id}/v1/Contrato_Arrendamiento_v1.pdf`,
        users.normal
      ]
    );

    // Comentarios
    await client.query(
      `INSERT INTO comments (case_id, user_id, content, is_internal)
       VALUES ($1, $2, $3, false), ($4, $5, $6, false)`,
      [
        case4Id, users.financiera,
        'Se requieren correcciones en las cláusulas financieras. Por favor incluir: 1) Cláusula de ajuste inflacionario anual, 2) Desglose detallado de gastos comunes.',
        case4Id, users.normal,
        'Entendido, realizaré las correcciones solicitadas y subiré una nueva versión.'
      ]
    );

    console.log(`${colors.green}✓${colors.reset} Caso devuelto con comentarios creado`);

    // ============================================
    // CASO 5: Aprobado (completó todo el flujo)
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 5: Aprobado y Completado${colors.reset}`);
    
    const case5 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority, completed_at)
       VALUES ($1, $2, 'COMPLETED', $3, 3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        'Contrato de Mantenimiento - Equipos',
        'Contrato de mantenimiento preventivo y correctivo de equipos de cómputo',
        users.normal
      ]
    );
    const case5Id = case5.rows[0].id;
    console.log(`${colors.green}✓${colors.reset} Caso 5 creado: ${case5.rows[0].case_number}`);

    // Crear workflow completado
    const case5Workflow = await client.query(
      `INSERT INTO case_workflows (case_id, workflow_template_id, current_step_order, completed_at)
       VALUES ($1, $2, 4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [case5Id, workflowId]
    );

    // Todos los pasos aprobados
    for (const step of steps) {
      let reviewedBy;
      if (step.required_role === 'COMERCIAL') reviewedBy = users.comercial;
      else if (step.required_role === 'TECNICA') reviewedBy = users.tecnica;
      else if (step.required_role === 'FINANCIERA') reviewedBy = users.financiera;
      else if (step.required_role === 'LEGAL') reviewedBy = users.legal;

      await client.query(
        `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status, 
                                              reviewed_by, completed_at, started_at, comments)
         VALUES ($1, $2, 'APPROVED', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4)`,
        [
          case5Workflow.rows[0].id, 
          step.id, 
          reviewedBy,
          `Aprobado por ${step.required_role}`
        ]
      );
    }

    // Archivos incluyendo el final firmado
    await client.query(
      `INSERT INTO files (case_id, file_name, file_type, file_size, mime_type, description, 
                          blob_url, blob_path, version, uploaded_by, is_final)
       VALUES 
       ($1, $2, 'PDF', 445678, 'application/pdf', $3, $4, $5, 1, $6, false),
       ($7, $8, 'PDF', 445890, 'application/pdf', $9, $10, $11, 1, $12, true)`,
      [
        case5Id, 'Contrato_Mantenimiento_v1.pdf', 'Versión inicial del contrato',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case5Id}/v1/Contrato_Mantenimiento_v1.pdf`,
        `case-${case5Id}/v1/Contrato_Mantenimiento_v1.pdf`, users.normal,
        case5Id, 'Contrato_Mantenimiento_FIRMADO.pdf', 'Contrato firmado por todas las partes',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case5Id}/final/Contrato_Mantenimiento_FIRMADO.pdf`,
        `case-${case5Id}/final/Contrato_Mantenimiento_FIRMADO.pdf`, users.legal
      ]
    );

    console.log(`${colors.green}✓${colors.reset} Caso completado con archivo firmado`);

    // ============================================
    // CASO 6: Rechazado
    // ============================================
    console.log(`\n${colors.blue}📝 Creando Caso 6: Rechazado${colors.reset}`);
    
    const case6 = await client.query(
      `INSERT INTO cases (title, description, status, created_by, priority)
       VALUES ($1, $2, 'REJECTED', $3, 2)
       RETURNING *`,
      [
        'Propuesta Comercial - Proveedor XYZ',
        'Propuesta comercial de proveedor externo',
        users.normal
      ]
    );
    const case6Id = case6.rows[0].id;
    console.log(`${colors.green}✓${colors.reset} Caso 6 creado: ${case6.rows[0].case_number}`);

    // Workflow rechazado en paso 2
    const case6Workflow = await client.query(
      `INSERT INTO case_workflows (case_id, workflow_template_id, current_step_order)
       VALUES ($1, $2, 2)
       RETURNING id`,
      [case6Id, workflowId]
    );

    for (const step of steps) {
      let status, reviewedBy = null, completedAt = null, comments = null;
      
      if (step.step_order === 1) {
        status = 'APPROVED';
        reviewedBy = users.comercial;
        completedAt = 'CURRENT_TIMESTAMP';
      } else if (step.step_order === 2) {
        status = 'REJECTED';
        reviewedBy = users.tecnica;
        completedAt = 'CURRENT_TIMESTAMP';
        comments = 'RECHAZADO: Las especificaciones técnicas no cumplen con los estándares mínimos requeridos. El proveedor no cuenta con las certificaciones necesarias.';
      } else {
        status = 'SKIPPED';
      }

      await client.query(
        `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status, 
                                              reviewed_by, completed_at, started_at, comments)
         VALUES ($1, $2, $3, $4, ${completedAt || 'NULL'}, 
                 ${step.step_order <= 2 ? 'CURRENT_TIMESTAMP' : 'NULL'}, $5)`,
        [case6Workflow.rows[0].id, step.id, status, reviewedBy, comments]
      );
    }

    await client.query(
      `INSERT INTO files (case_id, file_name, file_type, file_size, mime_type, description, 
                          blob_url, blob_path, version, uploaded_by)
       VALUES ($1, $2, 'PDF', 145678, 'application/pdf', $3, $4, $5, 1, $6)`,
      [
        case6Id, 'Propuesta_XYZ.pdf', 'Propuesta del proveedor',
        `https://bsistemariesgos.blob.core.windows.net/archivos-gestion-comware/case-${case6Id}/v1/Propuesta_XYZ.pdf`,
        `case-${case6Id}/v1/Propuesta_XYZ.pdf`, users.normal
      ]
    );

    console.log(`${colors.green}✓${colors.reset} Caso rechazado creado`);

    // ============================================
    // Resumen
    // ============================================
    console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}✨ Datos de prueba creados exitosamente!${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

    console.log(`${colors.yellow}📊 Resumen de casos creados:${colors.reset}`);
    console.log(`  1. ${case1.rows[0].case_number} - BORRADOR`);
    console.log(`  2. ${case2.rows[0].case_number} - EN REVISIÓN COMERCIAL`);
    console.log(`  3. ${case3.rows[0].case_number} - EN REVISIÓN TÉCNICA`);
    console.log(`  4. ${case4.rows[0].case_number} - DEVUELTO PARA CORRECCIONES`);
    console.log(`  5. ${case5.rows[0].case_number} - COMPLETADO Y FIRMADO`);
    console.log(`  6. ${case6.rows[0].case_number} - RECHAZADO\n`);

    console.log(`${colors.yellow}🎯 Ahora puedes:${colors.reset}`);
    console.log(`  • Ver el dashboard con estadísticas reales`);
    console.log(`  • Explorar casos en diferentes estados`);
    console.log(`  • Ver el flujo de aprobación completo`);
    console.log(`  • Revisar comentarios y observaciones`);
    console.log(`  • Ver archivos y versiones`);
    console.log(`  • Explorar el historial de auditoría\n`);

    console.log(`${colors.green}🚀 Ejecuta: npm run dev${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
