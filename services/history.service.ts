import { query } from '@/lib/db';
import { AuditLogWithUser, CommentWithUser } from '@/types/history.types';

export class HistoryService {
  /**
   * Obtiene el historial completo de un caso
   */
  static async getCaseHistory(caseId: string): Promise<AuditLogWithUser[]> {
    const result = await query<AuditLogWithUser>(
      `SELECT 
        al.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.case_id = $1
       ORDER BY al.created_at DESC`,
      [caseId]
    );

    return result.rows.map(this.mapAuditFromDb);
  }

  /**
   * Obtiene los comentarios de un caso
   */
  static async getCaseComments(caseId: string): Promise<CommentWithUser[]> {
    const result = await query<CommentWithUser>(
      `SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.case_id = $1
       ORDER BY c.created_at ASC`,
      [caseId]
    );

    return result.rows.map(this.mapCommentFromDb);
  }

  /**
   * Agrega un comentario
   */
  static async addComment(
    caseId: string,
    userId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<CommentWithUser> {
    const result = await query<CommentWithUser>(
      `INSERT INTO comments (case_id, user_id, content, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [caseId, userId, content, isInternal]
    );

    // Registrar en audit log
    await query(
      `INSERT INTO audit_log (case_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, 'COMMENT_ADDED', 'comment', $3)`,
      [caseId, userId, result.rows[0].id]
    );

    return this.mapCommentFromDb(result.rows[0]);
  }

  /**
   * Mapea audit log de BD a camelCase
   */
  private static mapAuditFromDb(row: any): AuditLogWithUser {
    return {
      id: row.id,
      caseId: row.case_id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      oldValue: row.old_value,
      newValue: row.new_value,
      comments: row.comments,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
    };
  }

  /**
   * Mapea comentario de BD a camelCase
   */
  private static mapCommentFromDb(row: any): CommentWithUser {
    return {
      id: row.id,
      caseId: row.case_id,
      userId: row.user_id,
      parentCommentId: row.parent_comment_id,
      content: row.content,
      isInternal: row.is_internal,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userName: row.user_name,
      userRole: row.user_role,
    };
  }
}
