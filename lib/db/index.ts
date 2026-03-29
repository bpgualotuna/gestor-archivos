import { Pool, PoolClient, QueryResult } from 'pg';

// Configuración del pool de conexiones para Azure PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Máximo de conexiones en el pool
  min: 2, // Mínimo de conexiones activas
  idleTimeoutMillis: 30000, // 30s para cerrar conexiones inactivas
  connectionTimeoutMillis: 30000, // 30s timeout para establecer conexión
  statement_timeout: 60000, // 60s timeout para queries
  query_timeout: 60000, // 60s timeout para queries
  keepAlive: true, // Mantener conexiones vivas
  keepAliveInitialDelayMillis: 10000, // 10s delay inicial para keep-alive
  ssl: {
    rejectUnauthorized: false // OBLIGATORIO para Azure PostgreSQL
  }
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL', err);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Nueva conexión establecida al pool');
  }
});

pool.on('remove', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Cliente removido del pool');
  }
});

/**
 * Ejecuta una query con parámetros
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Error en query:', { text, error });
    throw error;
  }
}

/**
 * Obtiene un cliente del pool para transacciones
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Ejecuta múltiples queries en una transacción
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cierra el pool de conexiones
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
