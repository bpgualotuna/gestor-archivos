import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireRole } from '@/lib/auth/get-session';
import { z } from 'zod';
import { ValidationError, NotFoundError } from '@/lib/utils/errors';

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['USER', 'AREA_USER', 'ADMIN']).optional(),
  area: z.enum(['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL']).nullable().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/:id
 * Actualiza un usuario (solo admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('ADMIN');

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Validar que si es AREA_USER, tenga área
    if (validatedData.role === 'AREA_USER' && validatedData.area === null) {
      return errorResponse(new ValidationError('Los usuarios de área deben tener un área asignada'));
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validatedData.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(validatedData.firstName);
    }
    if (validatedData.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(validatedData.lastName);
    }
    if (validatedData.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(validatedData.role);
    }
    if (validatedData.area !== undefined) {
      fields.push(`area = $${paramCount++}`);
      values.push(validatedData.area);
    }
    if (validatedData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(validatedData.isActive);
    }

    if (fields.length === 0) {
      return errorResponse(new ValidationError('No hay campos para actualizar'));
    }

    values.push(id);
    const result = await query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, role, area, is_active, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return errorResponse(new NotFoundError('Usuario no encontrado'));
    }

    const updatedUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
      role: result.rows[0].role,
      area: result.rows[0].area,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
    };

    return successResponse(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Desactiva un usuario (solo admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('ADMIN');

    const { id } = await params;

    const result = await query(
      `UPDATE users
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(new NotFoundError('Usuario no encontrado'));
    }

    return successResponse({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    return errorResponse(error);
  }
}
