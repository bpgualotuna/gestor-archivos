import { NextRequest } from 'next/server';
import { CaseService } from '@/services/case.service';
import { createCaseSchema } from '@/lib/validations/case.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth } from '@/lib/auth/get-session';

/**
 * GET /api/cases
 * Obtiene todos los casos (filtrados según el rol del usuario)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const cases = await CaseService.getAllCases(
      session.user.id,
      session.user.role
    );
    
    return successResponse(cases);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/cases
 * Crea un nuevo caso
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    const validatedData = createCaseSchema.parse(body);
    
    const newCase = await CaseService.createCase(validatedData, session.user.id);
    return successResponse(newCase, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
