import { query, transaction } from '@/lib/db';
import { Case, CaseWithCreator, CreateCaseDTO, UpdateCaseDTO } from '@/types/case.types';
import { UserRole } from '@/types/user.types';
import { PoolClient } from 'pg';

export class CaseService {
  /**
   * Obtiene todos los casos con información del creador
   * Filtrado según el rol del usuario
   */
  static async getAllCases(userId: string, role: UserRole): Promise<CaseWithCreator[]> {
    // Usar la función de PostgreSQL que filtra según el rol
    const result = await query<any>(
      'SELECT * FROM get_cases_for_user($1, $2)',
      [userId, role]
    );

    return result.rows.map(this.mapCaseFromDb);
  }

  /**
   * Obtiene un caso por ID
   */
  static async getCaseById(id: string): Promise<CaseWithCreator | null> {
    const result = await query<CaseWithCreator>(
      'SELECT * FROM cases_with_creator WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapCaseFromDb(result.rows[0]);
  }

  /**
   * Crea un nuevo caso
   */
  static async createCase(data: CreateCaseDTO, userId: string): Promise<Case> {
    return transaction(async (client: PoolClient) => {
      // Crear el caso
      const caseResult = await client.query<Case>(
        `INSERT INTO cases (title, description, priority, due_date, created_by, status)
         VALUES ($1, $2, $3, $4, $5, 'DRAFT')
         RETURNING *`,
        [data.title, data.description, data.priority || 0, data.dueDate, userId]
      );

      const newCase = caseResult.rows[0];

      // Asignar workflow por defecto
      const workflowResult = await client.query(
        `SELECT id FROM workflow_templates WHERE is_active = true LIMIT 1`
      );

      if (workflowResult.rows.length > 0) {
        const workflowId = workflowResult.rows[0].id;
        
        // Crear instancia de workflow
        const caseWorkflowResult = await client.query(
          `INSERT INTO case_workflows (case_id, workflow_template_id)
           VALUES ($1, $2)
           RETURNING id`,
          [newCase.id, workflowId]
        );

        const caseWorkflowId = caseWorkflowResult.rows[0].id;

        // Crear progreso para cada paso
        await client.query(
          `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status)
           SELECT $1, id, 'PENDING'
           FROM workflow_steps
           WHERE workflow_template_id = $2
           ORDER BY step_order`,
          [caseWorkflowId, workflowId]
        );
      }

      return this.mapCaseFromDb(newCase);
    });
  }

  /**
   * Actualiza un caso
   */
  static async updateCase(id: string, data: UpdateCaseDTO): Promise<Case | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(data.dueDate);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const queryText = `
      UPDATE cases
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query<Case>(queryText, values);
    if (result.rows.length === 0) return null;
    
    return this.mapCaseFromDb(result.rows[0]);
  }

  /**
   * Envía un caso para revisión
   */
  static async submitCase(caseId: string): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // Obtener el primer paso del workflow
      const firstStepResult = await client.query(
        `SELECT ws.required_role
         FROM case_workflows cw
         JOIN workflow_steps ws ON ws.workflow_template_id = cw.workflow_template_id
         WHERE cw.case_id = $1 AND ws.step_order = 1`,
        [caseId]
      );

      let firstAreaRole = null;
      if (firstStepResult.rows.length > 0) {
        firstAreaRole = firstStepResult.rows[0].required_role;
      }

      // Actualizar estado del caso
      await client.query(
        `UPDATE cases 
         SET status = 'SUBMITTED', current_area_role = $1 
         WHERE id = $2`,
        [firstAreaRole, caseId]
      );

      // Marcar el primer paso como IN_PROGRESS
      await client.query(
        `UPDATE workflow_step_progress wsp
         SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP
         FROM case_workflows cw
         JOIN workflow_steps ws ON ws.workflow_template_id = cw.workflow_template_id
         WHERE wsp.case_workflow_id = cw.id
           AND cw.case_id = $1
           AND ws.step_order = 1
           AND wsp.workflow_step_id = ws.id`,
        [caseId]
      );
    });
  }

  /**
   * Mapea los campos de la BD a camelCase
   */
  private static mapCaseFromDb(row: any): any {
    return {
      id: row.id,
      caseNumber: row.case_number,
      title: row.title,
      description: row.description,
      status: row.status,
      createdBy: row.created_by,
      currentStepId: row.current_step_id,
      currentAreaRole: row.current_area_role,
      priority: row.priority,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      creatorName: row.creator_name,
      creatorEmail: row.creator_email,
      fileCount: parseInt(row.file_count) || 0,
      commentCount: parseInt(row.comment_count) || 0,
    };
  }
}
