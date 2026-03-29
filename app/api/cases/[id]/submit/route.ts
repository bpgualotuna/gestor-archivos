import { NextRequest } from 'next/server';
import { CaseService } from '@/services/case.service';
import { FlowService } from '@/services/flow.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth } from '@/lib/auth/get-session';
import { query } from '@/lib/db';
import { ForbiddenError, ValidationError } from '@/lib/utils/errors';

/**
 * POST /api/cases/:id/submit
 * Envía un caso para revisión (nuevo o reenvío)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verificar que el caso existe y pertenece al usuario
    const caseResult = await query(
      'SELECT created_by, status FROM cases WHERE id = $1',
      [id]
    );

    if (caseResult.rows.length === 0) {
      throw new ValidationError('Caso no encontrado');
    }

    const caseData = caseResult.rows[0];

    // Solo el creador o admin puede enviar el caso
    if (session.user.role !== 'ADMIN' && caseData.created_by !== session.user.id) {
      throw new ForbiddenError('No tienes permiso para enviar este caso');
    }

    // Verificar que el caso esté en estado DRAFT o RETURNED
    if (caseData.status !== 'DRAFT' && caseData.status !== 'RETURNED') {
      throw new ValidationError('Solo se pueden enviar casos en estado Borrador o Devueltos');
    }

    // Si es RETURNED, usar resubmitCase (vuelve al área que lo devolvió)
    // Si es DRAFT, usar submitCase (va al primer paso del flujo)
    if (caseData.status === 'RETURNED') {
      await FlowService.resubmitCase(id);
    } else {
      await CaseService.submitCase(id);
    }

    return successResponse({ message: 'Caso enviado exitosamente' });
  } catch (error) {
    return errorResponse(error);
  }
}
