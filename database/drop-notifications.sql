-- Eliminar tabla y funciones de notificaciones existentes

DROP TABLE IF EXISTS notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP FUNCTION IF EXISTS get_user_notifications CASCADE;
DROP FUNCTION IF EXISTS count_unread_notifications CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read CASCADE;
DROP FUNCTION IF EXISTS create_notification CASCADE;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla y funciones de notificaciones eliminadas';
END $$;
