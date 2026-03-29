/**
 * Script para verificar la conexión a PostgreSQL y Azure Blob Storage
 * Ejecutar con: node database/test-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testPostgreSQL() {
  console.log(`\n${colors.blue}🔍 Probando conexión a PostgreSQL...${colors.reset}`);
  
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
    const client = await pool.connect();
    console.log(`${colors.green}✅ Conexión exitosa a PostgreSQL${colors.reset}`);
    
    // Verificar versión
    const versionResult = await client.query('SELECT version()');
    console.log(`   Versión: ${versionResult.rows[0].version.split(',')[0]}`);
    
    // Verificar base de datos
    const dbResult = await client.query('SELECT current_database()');
    console.log(`   Base de datos: ${dbResult.rows[0].current_database}`);
    
    // Verificar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`   Tablas encontradas: ${tablesResult.rows.length}`);
      tablesResult.rows.forEach(row => {
        console.log(`     - ${row.table_name}`);
      });
    } else {
      console.log(`${colors.yellow}   ⚠️  No se encontraron tablas. Ejecuta el schema.sql${colors.reset}`);
    }
    
    // Verificar usuarios
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`   Usuarios en la BD: ${usersResult.rows[0].count}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Error de conexión a PostgreSQL${colors.reset}`);
    console.log(`   ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log(`\n${colors.yellow}💡 Sugerencia: Verifica que DB_HOST sea correcto en .env.local${colors.reset}`);
    } else if (error.code === '28P01') {
      console.log(`\n${colors.yellow}💡 Sugerencia: Verifica el usuario y contraseña en .env.local${colors.reset}`);
    } else if (error.code === '3D000') {
      console.log(`\n${colors.yellow}💡 Sugerencia: La base de datos no existe. Créala primero.${colors.reset}`);
    }
    
    return false;
  }
}

async function testAzureBlob() {
  console.log(`\n${colors.blue}🔍 Probando conexión a Azure Blob Storage...${colors.reset}`);
  
  try {
    const { BlobServiceClient } = require('@azure/storage-blob');
    
    const account = process.env.AZURE_STORAGE_ACCOUNT;
    const key = process.env.AZURE_STORAGE_KEY;
    const containerName = process.env.AZURE_CONTAINER_NAME;
    
    if (!account || !key) {
      throw new Error('Credenciales de Azure no configuradas');
    }
    
    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Verificar cuenta
    const accountInfo = await blobServiceClient.getAccountInfo();
    console.log(`${colors.green}✅ Conexión exitosa a Azure Blob Storage${colors.reset}`);
    console.log(`   Cuenta: ${account}`);
    console.log(`   SKU: ${accountInfo.skuName}`);
    
    // Verificar contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    
    if (exists) {
      console.log(`   Contenedor '${containerName}': ${colors.green}Existe${colors.reset}`);
      
      // Listar algunos blobs
      let blobCount = 0;
      for await (const blob of containerClient.listBlobsFlat().byPage({ maxPageSize: 5 })) {
        blobCount += blob.segment.blobItems.length;
      }
      console.log(`   Archivos en el contenedor: ${blobCount}`);
    } else {
      console.log(`   Contenedor '${containerName}': ${colors.yellow}No existe (se creará automáticamente)${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Error de conexión a Azure Blob Storage${colors.reset}`);
    console.log(`   ${error.message}`);
    
    if (error.code === 'InvalidAuthenticationInfo') {
      console.log(`\n${colors.yellow}💡 Sugerencia: Verifica AZURE_STORAGE_KEY en .env.local${colors.reset}`);
    }
    
    return false;
  }
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}🧪 Test de Conexiones - Sistema de Gestión de Archivos${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  
  // Verificar variables de entorno
  console.log(`\n${colors.blue}📋 Variables de entorno:${colors.reset}`);
  console.log(`   DB_HOST: ${process.env.DB_HOST || colors.red + 'NO CONFIGURADO' + colors.reset}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || colors.red + 'NO CONFIGURADO' + colors.reset}`);
  console.log(`   DB_USER: ${process.env.DB_USER || colors.red + 'NO CONFIGURADO' + colors.reset}`);
  console.log(`   AZURE_STORAGE_ACCOUNT: ${process.env.AZURE_STORAGE_ACCOUNT || colors.red + 'NO CONFIGURADO' + colors.reset}`);
  console.log(`   AZURE_CONTAINER_NAME: ${process.env.AZURE_CONTAINER_NAME || colors.red + 'NO CONFIGURADO' + colors.reset}`);
  
  const pgSuccess = await testPostgreSQL();
  const azureSuccess = await testAzureBlob();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}📊 Resumen:${colors.reset}`);
  console.log(`   PostgreSQL: ${pgSuccess ? colors.green + '✅ OK' : colors.red + '❌ FALLO'}${colors.reset}`);
  console.log(`   Azure Blob: ${azureSuccess ? colors.green + '✅ OK' : colors.red + '❌ FALLO'}${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (pgSuccess && azureSuccess) {
    console.log(`${colors.green}🎉 ¡Todo está configurado correctamente!${colors.reset}`);
    console.log(`${colors.green}   Puedes ejecutar: npm run dev${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Hay problemas de configuración. Revisa los errores arriba.${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
