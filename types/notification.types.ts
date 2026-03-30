export type NotificationType =
  | 'CASE_SUBMITTED'      // Caso enviado para revisión (para área)
  | 'CASE_APPROVED'       // Caso aprobado por un área (para creador)
  | 'CASE_RETURNED'       // Caso devuelto para correcciones (para creador)
  | 'CASE_REJECTED'       // Caso rechazado (para creador)
  | 'CASE_RESUBMITTED'    // Caso reenviado después de correcciones (para área)
  | 'CASE_COMPLETED'      // Caso completado (para creador)
  | 'CASE_COMMENT';       // Nuevo comentario en caso

export interface Notification {
  id: string;
  userId: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationDTO {
  userId: string;
  caseId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationStats {
  unreadCount: number;
}
