import { NextRequest } from 'next/server';
import { HistoryService } from '@/services/history.service';
import { caseIdSchema } from '@/lib/validations/case.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth, canAccessCase } from '@/lib/auth/get-session';
import { query } from '@/lib/db';

/**
 * GET /api/cases/:id/history
 * Obtiene el historial completo de un caso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    caseIdSchema.parse({ id });

    // Verificar acceso al caso
    const caseResult = await query(
      'SELECT created_by, current_area FROM cases WHERE id = $1',
      [id]
    );
    
    if (caseResult.rows.length > 0) {
      await canAccessCase(caseResult.rows[0].created_by, caseResult.rows[0].current_area);
    }

    const history = await HistoryService.getCaseHistory(id);
    const comments = await HistoryService.getCaseComments(id);

    return successResponse({
      history,
      comments,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
