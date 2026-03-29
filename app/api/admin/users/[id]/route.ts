import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireRole } from '@/lib/auth/get-session';
import { z } from 'zod';

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['USER', 'COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL', 'ADMIN']).optional(),
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
    if (validatedData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(validatedData.isActive);
    }

    if (fields.length === 0) {
      return errorResponse(new Error('No hay campos para actualizar'), 400);
    }

    values.push(id);
    const result = await query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return errorResponse(new Error('Usuario no encontrado'), 404);
    }

    const updatedUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
      role: result.rows[0].role,
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
      return errorResponse(new Error('Usuario no encontrado'), 404);
    }

    return successResponse({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    return errorResponse(error);
  }
}
