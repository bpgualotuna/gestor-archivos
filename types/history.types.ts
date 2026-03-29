export type ActionType = 
  | 'CREATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'UPDATED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED'
  | 'COMMENT_ADDED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AuditLog {
  id: string;
  caseId?: string;
  userId?: string;
  action: ActionType;
  entityType?: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  comments?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogWithUser extends AuditLog {
  userName?: string;
  userEmail?: string;
}

export interface Comment {
  id: string;
  caseId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithUser extends Comment {
  userName: string;
  userRole: string;
}
