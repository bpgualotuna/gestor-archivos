import { query, transaction } from '@/lib/db';
import { Case, CaseWithCreator, CreateCaseDTO, UpdateCaseDTO } from '@/types/case.types';
import { UserRole, UserArea } from '@/types/user.types';
import { PoolClient } from 'pg';
import { NotificationService } from './notification.service';

export class CaseService {
  /**
   * Obtiene todos los casos con información del creador
   * Filtrado según el rol del usuario
   * @param assignedOnly - Si es true, solo devuelve casos asignados al área del usuario
   */
  static async getAllCases(userId: string, role: UserRole, area: UserArea | undefined, assignedOnly: boolean = false): Promise<CaseWithCreator[]> {
    // Usar la función de PostgreSQL que filtra según el rol
    const result = await query<any>(
      'SELECT * FROM get_cases_for_user($1, $2, $3, $4)',
      [userId, role, area, assignedOnly]
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
      // Crear el caso con todos los campos
      const caseResult = await client.query<Case>(
        `INSERT INTO cases (
          title, description, due_date, created_by, status,
          advisor_name, document_file_name, odoo_code, client_provider,
          document_type, sharepoint_url, request_date, required_delivery_date,
          urgency_justification, signature_type, template_type, observations
         )
         VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          data.title,
          data.description,
          data.dueDate,
          userId,
          data.advisorName,
          data.documentFileName,
          data.odooCode,
          data.clientProvider,
          data.documentType,
          data.sharepointUrl,
          data.requestDate,
          data.requiredDeliveryDate,
          data.urgencyJustification,
          data.signatureType,
          data.templateType,
          data.observations,
        ]
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

        // Crear progreso para cada paso (solo pasos activos, no históricos)
        await client.query(
          `INSERT INTO workflow_step_progress (case_workflow_id, workflow_step_id, status)
           SELECT $1, id, 'PENDING'
           FROM workflow_steps
           WHERE workflow_template_id = $2
           AND step_name NOT LIKE '%(histórico)%'
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
    if (data.dueDate !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(data.dueDate);
    }
    if (data.advisorName !== undefined) {
      fields.push(`advisor_name = $${paramCount++}`);
      values.push(data.advisorName);
    }
    if (data.documentFileName !== undefined) {
      fields.push(`document_file_name = $${paramCount++}`);
      values.push(data.documentFileName);
    }
    if (data.odooCode !== undefined) {
      fields.push(`odoo_code = $${paramCount++}`);
      values.push(data.odooCode);
    }
    if (data.clientProvider !== undefined) {
      fields.push(`client_provider = $${paramCount++}`);
      values.push(data.clientProvider);
    }
    if (data.documentType !== undefined) {
      fields.push(`document_type = $${paramCount++}`);
      values.push(data.documentType);
    }
    if (data.sharepointUrl !== undefined) {
      fields.push(`sharepoint_url = $${paramCount++}`);
      values.push(data.sharepointUrl);
    }
    if (data.requestDate !== undefined) {
      fields.push(`request_date = $${paramCount++}`);
      values.push(data.requestDate);
    }
    if (data.requiredDeliveryDate !== undefined) {
      fields.push(`required_delivery_date = $${paramCount++}`);
      values.push(data.requiredDeliveryDate);
    }
    if (data.urgencyJustification !== undefined) {
      fields.push(`urgency_justification = $${paramCount++}`);
      values.push(data.urgencyJustification);
    }
    if (data.signatureType !== undefined) {
      fields.push(`signature_type = $${paramCount++}`);
      values.push(data.signatureType);
    }
    if (data.templateType !== undefined) {
      fields.push(`template_type = $${paramCount++}`);
      values.push(data.templateType);
    }
    if (data.observations !== undefined) {
      fields.push(`observations = $${paramCount++}`);
      values.push(data.observations);
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
    let caseInfo: any;
    let firstArea: UserArea | null = null;

    await transaction(async (client: PoolClient) => {
      // Obtener información del caso
      const caseResult = await client.query(
        `SELECT c.case_number, c.title, c.created_by, u.first_name || ' ' || u.last_name as creator_name
         FROM cases c
         JOIN users u ON c.created_by = u.id
         WHERE c.id = $1`,
        [caseId]
      );
      caseInfo = caseResult.rows[0];

      // Obtener el primer paso del workflow
      const firstStepResult = await client.query(
        `SELECT ws.required_area
         FROM case_workflows cw
         JOIN workflow_steps ws ON ws.workflow_template_id = cw.workflow_template_id
         WHERE cw.case_id = $1 AND ws.step_order = 1`,
        [caseId]
      );

      if (firstStepResult.rows.length > 0) {
        firstArea = firstStepResult.rows[0].required_area;
      }

      // Actualizar estado del caso
      await client.query(
        `UPDATE cases 
         SET status = 'SUBMITTED', current_area = $1 
         WHERE id = $2`,
        [firstArea, caseId]
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

    // Crear notificación después de la transacción
    if (firstArea && caseInfo) {
      await NotificationService.notifyAreaNewCase(
        caseId,
        caseInfo.case_number,
        caseInfo.title,
        firstArea,
        caseInfo.creator_name
      );
    }
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
      currentArea: row.current_area,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      creatorName: row.creator_name,
      creatorEmail: row.creator_email,
      fileCount: parseInt(row.file_count) || 0,
      commentCount: parseInt(row.comment_count) || 0,
      // Nuevos campos
      advisorName: row.advisor_name,
      documentFileName: row.document_file_name,
      odooCode: row.odoo_code,
      clientProvider: row.client_provider,
      documentType: row.document_type,
      sharepointUrl: row.sharepoint_url,
      requestDate: row.request_date,
      requiredDeliveryDate: row.required_delivery_date,
      urgencyJustification: row.urgency_justification,
      signatureType: row.signature_type,
      templateType: row.template_type,
      observations: row.observations,
    };
  }
}
