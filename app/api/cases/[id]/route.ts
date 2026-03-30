import { NextRequest } from 'next/server';
import { CaseService } from '@/services/case.service';
import { updateCaseSchema, caseIdSchema } from '@/lib/validations/case.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { NotFoundError } from '@/lib/utils/errors';
import { requireAuth, canAccessCase } from '@/lib/auth/get-session';

/**
 * GET /api/cases/:id
 * Obtiene un caso por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    caseIdSchema.parse({ id });

    const caseData = await CaseService.getCaseById(id);
    
    if (!caseData) {
      throw new NotFoundError('Caso no encontrado');
    }

    // Verificar permisos de acceso
    await canAccessCase(caseData.createdBy, caseData.currentArea);

    return successResponse(caseData);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/cases/:id
 * Actualiza un caso
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    
    const { id } = await params;
    caseIdSchema.parse({ id });

    const caseData = await CaseService.getCaseById(id);
    if (!caseData) {
      throw new NotFoundError('Caso no encontrado');
    }

    // Verificar permisos de acceso
    await canAccessCase(caseData.createdBy, caseData.currentArea);

    const body = await request.json();
    const validatedData = updateCaseSchema.parse(body);

    const updatedCase = await CaseService.updateCase(id, validatedData);

    return successResponse(updatedCase);
  } catch (error) {
    return errorResponse(error);
  }
}
