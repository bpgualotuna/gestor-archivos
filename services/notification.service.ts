import { query } from '@/lib/db';
import { Notification, CreateNotificationDTO, NotificationStats } from '@/types/notification.types';
import { UserArea } from '@/types/user.types';

export class NotificationService {
  /**
   * Obtiene las notificaciones de un usuario
   */
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<Notification[]> {
    const result = await query<any>(
      'SELECT * FROM get_user_notifications($1, $2, $3)',
      [userId, unreadOnly, limit]
    );

    return result.rows.map(this.mapNotificationFromDb);
  }

  /**
   * Cuenta las notificaciones no leídas de un usuario
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await query<{ count_unread_notifications: number }>(
      'SELECT count_unread_notifications($1) as count_unread_notifications',
      [userId]
    );

    return result.rows[0]?.count_unread_notifications || 0;
  }

  /**
   * Marca una notificación como leída
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await query('SELECT mark_notification_read($1)', [notificationId]);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await query('SELECT mark_all_notifications_read($1)', [userId]);
  }

  /**
   * Crea una nueva notificación
   */
  static async createNotification(data: CreateNotificationDTO): Promise<string> {
    const result = await query<{ create_notification: string }>(
      'SELECT create_notification($1, $2, $3, $4, $5) as create_notification',
      [data.userId, data.caseId, data.type, data.title, data.message]
    );

    return result.rows[0].create_notification;
  }

  /**
   * Notifica al creador del caso cuando es devuelto
   */
  static async notifyCaseReturned(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    creatorId: string,
    areaName: string,
    reason: string
  ): Promise<void> {
    await this.createNotification({
      userId: creatorId,
      caseId,
      type: 'CASE_RETURNED',
      title: `Caso ${caseNumber} devuelto`,
      message: `El área ${areaName} ha devuelto tu caso "${caseTitle}" para correcciones. Motivo: ${reason}`,
    });
  }

  /**
   * Notifica al creador del caso cuando es aprobado por un área
   */
  static async notifyCaseApproved(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    creatorId: string,
    areaName: string
  ): Promise<void> {
    await this.createNotification({
      userId: creatorId,
      caseId,
      type: 'CASE_APPROVED',
      title: `Caso ${caseNumber} aprobado`,
      message: `El área ${areaName} ha aprobado tu caso "${caseTitle}".`,
    });
  }

  /**
   * Notifica al creador del caso cuando es rechazado
   */
  static async notifyCaseRejected(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    creatorId: string,
    areaName: string,
    reason: string
  ): Promise<void> {
    await this.createNotification({
      userId: creatorId,
      caseId,
      type: 'CASE_REJECTED',
      title: `Caso ${caseNumber} rechazado`,
      message: `El área ${areaName} ha rechazado tu caso "${caseTitle}". Motivo: ${reason}`,
    });
  }

  /**
   * Notifica al creador del caso cuando es completado
   */
  static async notifyCaseCompleted(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    creatorId: string
  ): Promise<void> {
    await this.createNotification({
      userId: creatorId,
      caseId,
      type: 'CASE_COMPLETED',
      title: `Caso ${caseNumber} completado`,
      message: `Tu caso "${caseTitle}" ha sido aprobado por todas las áreas y está completado.`,
    });
  }

  /**
   * Notifica a los usuarios de un área cuando llega un caso para revisión
   */
  static async notifyAreaNewCase(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    area: UserArea,
    creatorName: string
  ): Promise<void> {
    // Obtener todos los usuarios del área
    const usersResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE role = $1 AND area = $2 AND is_active = true',
      ['AREA_USER', area]
    );

    const areaLabels: Record<UserArea, string> = {
      COMERCIAL: 'Comercial',
      TECNICA: 'Técnica',
      FINANCIERA: 'Financiera',
      LEGAL: 'Legal',
    };

    // Crear notificación para cada usuario del área
    for (const user of usersResult.rows) {
      await this.createNotification({
        userId: user.id,
        caseId,
        type: 'CASE_SUBMITTED',
        title: `Nuevo caso para revisión`,
        message: `El caso ${caseNumber} "${caseTitle}" de ${creatorName} ha sido asignado al área ${areaLabels[area]} para revisión.`,
      });
    }
  }

  /**
   * Notifica a los usuarios de un área cuando un caso es reenviado
   */
  static async notifyAreaCaseResubmitted(
    caseId: string,
    caseNumber: string,
    caseTitle: string,
    area: UserArea,
    creatorName: string
  ): Promise<void> {
    // Obtener todos los usuarios del área
    const usersResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE role = $1 AND area = $2 AND is_active = true',
      ['AREA_USER', area]
    );

    const areaLabels: Record<UserArea, string> = {
      COMERCIAL: 'Comercial',
      TECNICA: 'Técnica',
      FINANCIERA: 'Financiera',
      LEGAL: 'Legal',
    };

    // Crear notificación para cada usuario del área
    for (const user of usersResult.rows) {
      await this.createNotification({
        userId: user.id,
        caseId,
        type: 'CASE_RESUBMITTED',
        title: `Caso reenviado con correcciones`,
        message: `${creatorName} ha reenviado el caso ${caseNumber} "${caseTitle}" con las correcciones solicitadas por el área ${areaLabels[area]}.`,
      });
    }
  }

  /**
   * Mapea los campos de la BD a camelCase
   */
  private static mapNotificationFromDb(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      caseId: row.case_id,
      caseNumber: row.case_number,
      caseTitle: row.case_title,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
    };
  }
}
