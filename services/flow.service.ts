import { query, transaction } from '@/lib/db';
import { WorkflowProgressView } from '@/types/flow.types';
import { UserRole } from '@/types/user.types';
import { ForbiddenError, ValidationError } from '@/lib/utils/errors';
import { PoolClient } from 'pg';

export class FlowService {
  /**
   * Obtiene el progreso del workflow de un caso
   */
  static async getWorkflowProgress(caseId: string): Promise<WorkflowProgressView[]> {
    // Solo mostrar pasos que tienen registros de progreso para este caso
    // Esto evita mostrar pasos nuevos del workflow en casos que usaron versiones anteriores
    const result = await query<WorkflowProgressView>(
      `SELECT 
        cw.case_id,
        cw.workflow_template_id,
        wt.name as workflow_name,
        ws.step_order,
        ws.step_name,
        ws.required_role,
        wsp.status as step_status,
        wsp.assigned_to,
        wsp.reviewed_by,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as reviewed_by_name,
        wsp.comments,
        wsp.completed_at
      FROM case_workflows cw
      JOIN workflow_templates wt ON cw.workflow_template_id = wt.id
      JOIN workflow_step_progress wsp ON wsp.case_workflow_id = cw.id
      JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
      LEFT JOIN users u1 ON wsp.assigned_to = u1.id
      LEFT JOIN users u2 ON wsp.reviewed_by = u2.id
      WHERE cw.case_id = $1
      ORDER BY ws.step_order`,
      [caseId]
    );

    return result.rows.map(this.mapProgressFromDb);
  }

  /**
   * Aprueba el paso actual y avanza al siguiente
   */
  static async approveStep(
    caseId: string, 
    userId: string, 
    userRole: UserRole,
    comments?: string
  ): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // Obtener el paso actual y verificar permisos
      const currentStepResult = await client.query(
        `SELECT wsp.id, ws.step_order, ws.required_role, cw.workflow_template_id, c.current_area_role
         FROM workflow_step_progress wsp
         JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
         JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
         JOIN cases c ON cw.case_id = c.id
         WHERE cw.case_id = $1 AND wsp.status = 'IN_PROGRESS'`,
        [caseId]
      );

      if (currentStepResult.rows.length === 0) {
        throw new ValidationError('No hay paso en progreso para aprobar');
      }

      const currentStep = currentStepResult.rows[0];

      // Validar que el usuario tenga el rol correcto para aprobar
      if (userRole !== 'ADMIN' && userRole !== currentStep.required_role) {
        throw new ForbiddenError(
          `Solo usuarios con rol ${currentStep.required_role} pueden aprobar este paso`
        );
      }

      // Marcar paso actual como aprobado
      await client.query(
        `UPDATE workflow_step_progress
         SET status = 'APPROVED', reviewed_by = $1, comments = $2, completed_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [userId, comments, currentStep.id]
      );

      // Verificar si hay siguiente paso
      const nextStepResult = await client.query(
        `SELECT wsp.id, ws.required_role
         FROM workflow_step_progress wsp
         JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
         JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
         WHERE cw.case_id = $1 AND ws.step_order = $2`,
        [caseId, currentStep.step_order + 1]
      );

      if (nextStepResult.rows.length > 0) {
        // Activar siguiente paso
        await client.query(
          `UPDATE workflow_step_progress
           SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [nextStepResult.rows[0].id]
        );

        // Actualizar área actual del caso
        await client.query(
          `UPDATE cases 
           SET status = 'IN_REVIEW', current_area_role = $1 
           WHERE id = $2`,
          [nextStepResult.rows[0].required_role, caseId]
        );
      } else {
        // No hay más pasos, marcar caso como aprobado
        await client.query(
          `UPDATE cases 
           SET status = 'APPROVED', current_area_role = NULL, completed_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [caseId]
        );

        await client.query(
          `UPDATE case_workflows SET completed_at = CURRENT_TIMESTAMP WHERE case_id = $1`,
          [caseId]
        );
      }

      // Registrar en audit log
      await client.query(
        `INSERT INTO audit_log (case_id, user_id, action, comments)
         VALUES ($1, $2, 'APPROVED', $3)`,
        [caseId, userId, comments]
      );
    });
  }

  /**
   * Rechaza el paso actual
   */
  static async rejectStep(
    caseId: string, 
    userId: string, 
    userRole: UserRole,
    comments: string
  ): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // Verificar permisos
      const stepResult = await client.query(
        `SELECT ws.required_role
         FROM workflow_step_progress wsp
         JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
         JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
         WHERE cw.case_id = $1 AND wsp.status = 'IN_PROGRESS'`,
        [caseId]
      );

      if (stepResult.rows.length === 0) {
        throw new ValidationError('No hay paso en progreso para rechazar');
      }

      if (userRole !== 'ADMIN' && userRole !== stepResult.rows[0].required_role) {
        throw new ForbiddenError(
          `Solo usuarios con rol ${stepResult.rows[0].required_role} pueden rechazar este paso`
        );
      }

      // Marcar paso actual como rechazado
      await client.query(
        `UPDATE workflow_step_progress wsp
         SET status = 'REJECTED', reviewed_by = $1, comments = $2, completed_at = CURRENT_TIMESTAMP
         FROM case_workflows cw
         WHERE wsp.case_workflow_id = cw.id
           AND cw.case_id = $3
           AND wsp.status = 'IN_PROGRESS'`,
        [userId, comments, caseId]
      );

      // Marcar caso como rechazado
      await client.query(
        `UPDATE cases SET status = 'REJECTED', current_area_role = NULL WHERE id = $1`,
        [caseId]
      );

      // Registrar en audit log
      await client.query(
        `INSERT INTO audit_log (case_id, user_id, action, comments)
         VALUES ($1, $2, 'REJECTED', $3)`,
        [caseId, userId, comments]
      );
    });
  }

  /**
   * Devuelve el caso al usuario para correcciones
   */
  static async returnCase(
    caseId: string,
    userId: string,
    userRole: UserRole,
    comments: string,
    returnReason: string
  ): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // Verificar permisos
      const stepResult = await client.query(
        `SELECT ws.required_role
         FROM workflow_step_progress wsp
         JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
         JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
         WHERE cw.case_id = $1 AND wsp.status = 'IN_PROGRESS'`,
        [caseId]
      );

      if (stepResult.rows.length === 0) {
        throw new ValidationError('No hay paso en progreso para devolver');
      }

      if (userRole !== 'ADMIN' && userRole !== stepResult.rows[0].required_role) {
        throw new ForbiddenError(
          `Solo usuarios con rol ${stepResult.rows[0].required_role} pueden devolver este paso`
        );
      }

      // Marcar paso actual como pendiente
      await client.query(
        `UPDATE workflow_step_progress wsp
         SET status = 'PENDING', comments = $1
         FROM case_workflows cw
         WHERE wsp.case_workflow_id = cw.id
           AND cw.case_id = $2
           AND wsp.status = 'IN_PROGRESS'`,
        [comments, caseId]
      );

      // Marcar caso como devuelto
      await client.query(
        `UPDATE cases SET status = 'RETURNED', current_area_role = NULL WHERE id = $1`,
        [caseId]
      );

      // Agregar comentario
      await client.query(
        `INSERT INTO comments (case_id, user_id, content, is_internal)
         VALUES ($1, $2, $3, false)`,
        [caseId, userId, `${returnReason}\n\n${comments}`]
      );

      // Registrar en audit log
      await client.query(
        `INSERT INTO audit_log (case_id, user_id, action, comments)
         VALUES ($1, $2, 'RETURNED', $3)`,
        [caseId, userId, returnReason]
      );
    });
  }

  /**
   * Reenvía un caso devuelto
   */
  static async resubmitCase(caseId: string): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // Buscar el paso que fue devuelto (PENDING con started_at más reciente)
      // Esto identifica el paso que estuvo IN_PROGRESS antes de ser devuelto
      const stepResult = await client.query(
        `SELECT wsp.id, ws.required_role, ws.step_order
         FROM workflow_step_progress wsp
         JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
         JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
         WHERE cw.case_id = $1 
           AND wsp.status = 'PENDING'
           AND wsp.started_at IS NOT NULL
         ORDER BY wsp.started_at DESC
         LIMIT 1`,
        [caseId]
      );

      if (stepResult.rows.length > 0) {
        const returnedStep = stepResult.rows[0];
        
        // Activar el paso que fue devuelto
        await client.query(
          `UPDATE workflow_step_progress
           SET status = 'IN_PROGRESS'
           WHERE id = $1`,
          [returnedStep.id]
        );

        // Actualizar área actual del caso al área que lo devolvió
        await client.query(
          `UPDATE cases 
           SET status = 'SUBMITTED', current_area_role = $1 
           WHERE id = $2`,
          [returnedStep.required_role, caseId]
        );
      } else {
        // Si no hay pasos con started_at (caso raro), buscar el primer PENDING
        const firstPendingResult = await client.query(
          `SELECT wsp.id, ws.required_role
           FROM workflow_step_progress wsp
           JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
           JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
           WHERE cw.case_id = $1 AND wsp.status = 'PENDING'
           ORDER BY ws.step_order ASC
           LIMIT 1`,
          [caseId]
        );

        if (firstPendingResult.rows.length > 0) {
          await client.query(
            `UPDATE workflow_step_progress
             SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [firstPendingResult.rows[0].id]
          );

          await client.query(
            `UPDATE cases 
             SET status = 'SUBMITTED', current_area_role = $1 
             WHERE id = $2`,
            [firstPendingResult.rows[0].required_role, caseId]
          );
        } else {
          // Si no hay pasos pendientes, volver al primer paso
          const firstStepResult = await client.query(
            `SELECT wsp.id, ws.required_role
             FROM workflow_step_progress wsp
             JOIN case_workflows cw ON wsp.case_workflow_id = cw.id
             JOIN workflow_steps ws ON wsp.workflow_step_id = ws.id
             WHERE cw.case_id = $1
             ORDER BY ws.step_order ASC
             LIMIT 1`,
            [caseId]
          );

          if (firstStepResult.rows.length > 0) {
            await client.query(
              `UPDATE workflow_step_progress
               SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [firstStepResult.rows[0].id]
            );

            await client.query(
              `UPDATE cases 
               SET status = 'SUBMITTED', current_area_role = $1 
               WHERE id = $2`,
              [firstStepResult.rows[0].required_role, caseId]
            );
          } else {
            await client.query(
              `UPDATE cases SET status = 'SUBMITTED' WHERE id = $1`,
              [caseId]
            );
          }
        }
      }
    });
  }

  /**
   * Mapea los campos de la BD a camelCase
   */
  private static mapProgressFromDb(row: any): WorkflowProgressView {
    return {
      caseId: row.case_id,
      workflowTemplateId: row.workflow_template_id,
      workflowName: row.workflow_name,
      stepOrder: row.step_order,
      stepName: row.step_name,
      requiredRole: row.required_role,
      stepStatus: row.step_status,
      assignedTo: row.assigned_to,
      reviewedBy: row.reviewed_by,
      assignedToName: row.assigned_to_name,
      reviewedByName: row.reviewed_by_name,
      comments: row.comments,
      completedAt: row.completed_at,
    };
  }
}
