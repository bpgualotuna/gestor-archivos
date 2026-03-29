import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireRole } from '@/lib/auth/get-session';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['USER', 'COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL', 'ADMIN']),
});

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['USER', 'COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/users
 * Obtiene todos los usuarios (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const result = await query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );

    const users = result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    }));

    return successResponse(users);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/admin/users
 * Crea un nuevo usuario (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      return errorResponse(new Error('El email ya está registrado'), 400);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Crear usuario
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [
        validatedData.email,
        hashedPassword,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.role,
      ]
    );

    const newUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
      role: result.rows[0].role,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
    };

    return successResponse(newUser, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
