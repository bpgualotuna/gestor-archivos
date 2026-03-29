import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireRole } from '@/lib/auth/get-session';
import { z } from 'zod';
import { PoolClient } from 'pg';

const updateWorkflowSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(3),
    requiredRole: z.enum(['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL']),
    stepOrder: z.number().int().min(1),
  })).min(1).optional(),
});

/**
 * GET /api/admin/workflows
 * Obtiene todos los workflows con sus pasos
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    // Obtener workflows
    const workflowsResult = await query(
      `SELECT id, name, description, is_active, created_at
       FROM workflow_templates
       ORDER BY created_at DESC`
    );

    // Obtener pasos de cada workflow
    const workflows = await Promise.all(
      workflowsResult.rows.map(async (workflow: any) => {
        const stepsResult = await query(
          `SELECT id, step_name, required_role, step_order
           FROM workflow_steps
           WHERE workflow_template_id = $1
           AND step_name NOT LIKE '%(histórico)%'
           ORDER BY step_order`,
          [workflow.id]
        );

        return {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          isActive: workflow.is_active,
          createdAt: workflow.created_at,
          steps: stepsResult.rows.map((step: any) => ({
            id: step.id,
            name: step.step_name,
            requiredRole: step.required_role,
            stepOrder: step.step_order,
          })),
        };
      })
    );

    return successResponse(workflows);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/admin/workflows
 * Actualiza el workflow activo
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const body = await request.json();
    const { workflowId, ...validatedData } = body;
    
    if (!workflowId) {
      return errorResponse(new Error('workflowId es requerido'), 400);
    }

    const result = await transaction(async (client: PoolClient) => {
      // Actualizar información básica del workflow si se proporciona
      if (validatedData.name || validatedData.description !== undefined) {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (validatedData.name) {
          fields.push(`name = $${paramCount++}`);
          values.push(validatedData.name);
        }
        if (validatedData.description !== undefined) {
          fields.push(`description = $${paramCount++}`);
          values.push(validatedData.description);
        }

        if (fields.length > 0) {
          values.push(workflowId);
          await client.query(
            `UPDATE workflow_templates
             SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}`,
            values
          );
        }
      }

      // Actualizar pasos si se proporcionan
      if (validatedData.steps && validatedData.steps.length > 0) {
        // Verificar si hay casos activos (no completados)
        const activeCasesResult = await client.query(
          `SELECT COUNT(*) as count
           FROM cases c
           JOIN case_workflows cw ON c.id = cw.case_id
           WHERE cw.workflow_template_id = $1
           AND c.status NOT IN ('COMPLETED', 'CANCELLED', 'APPROVED', 'REJECTED')`,
          [workflowId]
        );

        if (parseInt(activeCasesResult.rows[0].count) > 0) {
          throw new Error(
            'No se puede modificar el workflow porque hay casos activos en progreso. ' +
            'Espera a que todos los casos activos se completen antes de editar el workflow.'
          );
        }

        // Si no hay casos activos, podemos modificar el workflow
        // PERO mantenemos los pasos antiguos para preservar el historial
        
        // Obtener el máximo step_order actual para calcular el offset
        const maxOrderResult = await client.query(
          `SELECT COALESCE(MAX(step_order), 0) as max_order
           FROM workflow_steps
           WHERE workflow_template_id = $1`,
          [workflowId]
        );
        
        const maxOrder = parseInt(maxOrderResult.rows[0].max_order);
        const historicalOffset = Math.max(1000, maxOrder + 1000);
        
        // Marcar los pasos actuales (no históricos) como "históricos" y moverlos
        // Solo afecta pasos con step_order < 1000 (los pasos normales)
        await client.query(
          `UPDATE workflow_steps 
           SET step_name = step_name || ' (histórico)',
               step_order = step_order + $2
           WHERE workflow_template_id = $1
           AND step_order < 1000
           AND step_name NOT LIKE '%(histórico)%'`,
          [workflowId, historicalOffset]
        );

        // Crear los nuevos pasos con los nuevos valores
        for (const step of validatedData.steps) {
          await client.query(
            `INSERT INTO workflow_steps (workflow_template_id, step_name, required_role, step_order)
             VALUES ($1, $2, $3, $4)`,
            [workflowId, step.name, step.requiredRole, step.stepOrder]
          );
        }
      }

      // Obtener el workflow actualizado
      const workflowResult = await client.query(
        'SELECT id, name, description, is_active, created_at FROM workflow_templates WHERE id = $1',
        [workflowId]
      );

      const stepsResult = await client.query(
        `SELECT id, step_name, required_role, step_order
         FROM workflow_steps
         WHERE workflow_template_id = $1
         ORDER BY step_order`,
        [workflowId]
      );

      return {
        id: workflowResult.rows[0].id,
        name: workflowResult.rows[0].name,
        description: workflowResult.rows[0].description,
        isActive: workflowResult.rows[0].is_active,
        createdAt: workflowResult.rows[0].created_at,
        steps: stepsResult.rows.map((step: any) => ({
          id: step.id,
          name: step.step_name,
          requiredRole: step.required_role,
          stepOrder: step.step_order,
        })),
      };
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
