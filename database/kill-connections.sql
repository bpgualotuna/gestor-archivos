-- Script para cerrar todas las conexiones activas a la base de datos
-- Ejecutar esto en Azure Portal Query Editor

-- Ver conexiones activas
SELECT pid, usename, application_name, client_addr, state, 
       now() - query_start as duration
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid()
ORDER BY query_start DESC;

-- Cerrar todas las conexiones (excepto la actual)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();

-- Verificar que se cerraron
SELECT COUNT(*) as conexiones_restantes
FROM pg_stat_activity
WHERE datname = current_database() 
  AND pid <> pg_backend_pid();
