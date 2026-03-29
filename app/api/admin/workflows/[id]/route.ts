import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireRole } from '@/lib/auth/get-session';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

/**
 * PATCH /api/admin/workflows/:id/activate
 * Activa un workflow y desactiva los demás
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('ADMIN');

    const { id } = await params;

    // Desactivar todos los workflows
    await query('UPDATE workflow_templates SET is_active = false');

    // Activar el workflow seleccionado
    const result = await query(
      `UPDATE workflow_templates
       SET is_active = true
       WHERE id = $1
       RETURNING id, name, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(new NotFoundError('Workflow no encontrado'));
    }

    return successResponse({
      id: result.rows[0].id,
      name: result.rows[0].name,
      isActive: result.rows[0].is_active,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/admin/workflows/:id
 * Elimina un workflow (solo si no está activo)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('ADMIN');

    const { id } = await params;

    // Verificar si está activo
    const checkResult = await query(
      'SELECT is_active FROM workflow_templates WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return errorResponse(new NotFoundError('Workflow no encontrado'));
    }

    if (checkResult.rows[0].is_active) {
      return errorResponse(new ValidationError('No se puede eliminar un workflow activo'));
    }

    // Eliminar pasos primero
    await query('DELETE FROM workflow_steps WHERE workflow_template_id = $1', [id]);

    // Eliminar workflow
    await query('DELETE FROM workflow_templates WHERE id = $1', [id]);

    return successResponse({ message: 'Workflow eliminado exitosamente' });
  } catch (error) {
    return errorResponse(error);
  }
}
