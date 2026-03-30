import { NextRequest } from 'next/server';
import { FlowService } from '@/services/flow.service';
import { returnCaseSchema } from '@/lib/validations/flow.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth } from '@/lib/auth/get-session';

/**
 * POST /api/flow/return
 * Devuelve un caso al usuario para correcciones
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validatedData = returnCaseSchema.parse(body);

    await FlowService.returnCase(
      validatedData.caseId,
      session.user.id,
      session.user.role,
      session.user.area,
      validatedData.comments,
      validatedData.returnReason
    );

    return successResponse({ message: 'Caso devuelto para correcciones' });
  } catch (error) {
    return errorResponse(error);
  }
}
