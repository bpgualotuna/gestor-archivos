import { NextRequest } from 'next/server';
import { FlowService } from '@/services/flow.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth, canAccessCase } from '@/lib/auth/get-session';
import { query } from '@/lib/db';

/**
 * POST /api/flow/next
 * Obtiene el progreso del workflow de un caso
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { caseId } = body;

    // Verificar acceso al caso
    const caseResult = await query(
      'SELECT created_by, current_area_role FROM cases WHERE id = $1',
      [caseId]
    );
    
    if (caseResult.rows.length > 0) {
      await canAccessCase(caseResult.rows[0].created_by, caseResult.rows[0].current_area_role);
    }

    const progress = await FlowService.getWorkflowProgress(caseId);
    return successResponse(progress);
  } catch (error) {
    return errorResponse(error);
  }
}
