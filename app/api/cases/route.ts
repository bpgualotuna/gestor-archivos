import { NextRequest } from 'next/server';
import { CaseService } from '@/services/case.service';
import { createCaseSchema } from '@/lib/validations/case.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAuth } from '@/lib/auth/get-session';

/**
 * GET /api/cases
 * Obtiene todos los casos (filtrados según el rol del usuario)
 * Query params:
 * - assignedOnly=true: Solo casos asignados al área del usuario (para dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const assignedOnly = searchParams.get('assignedOnly') === 'true';
    
    const cases = await CaseService.getAllCases(
      session.user.id,
      session.user.role,
      session.user.area,
      assignedOnly
    );
    
    return successResponse(cases);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/cases
 * Crea un nuevo caso con múltiples archivos adjuntos
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const advisorName = formData.get('advisorName') as string | null;
    const documentFileName = formData.get('documentFileName') as string | null;
    const documentFiles = formData.getAll('documentFiles') as File[];
    const odooCode = formData.get('odooCode') as string | null;
    const clientProvider = formData.get('clientProvider') as string | null;
    const documentType = formData.get('documentType') as string;
    const sharepointUrl = formData.get('sharepointUrl') as string | null;
    const requestDate = formData.get('requestDate') as string | null;
    const requiredDeliveryDate = formData.get('requiredDeliveryDate') as string | null;
    const urgencyJustification = formData.get('urgencyJustification') as string | null;
    const signatureType = formData.get('signatureType') as string;
    const templateType = formData.get('templateType') as string;
    const observations = formData.get('observations') as string | null;

    // Validar datos básicos
    if (!title || title.length < 3) {
      throw new Error('El título es requerido y debe tener al menos 3 caracteres');
    }
    if (!documentFiles || documentFiles.length === 0) {
      throw new Error('Debe adjuntar al menos un documento');
    }

    // Crear el caso con los nombres de los archivos
    const caseData = {
      title,
      description: description || undefined,
      advisorName: advisorName || undefined,
      documentFileName: documentFileName || undefined,
      odooCode: odooCode || undefined,
      clientProvider: clientProvider || undefined,
      documentType: documentType as any,
      sharepointUrl: sharepointUrl || undefined,
      requestDate: requestDate ? new Date(requestDate) : undefined,
      requiredDeliveryDate: requiredDeliveryDate ? new Date(requiredDeliveryDate) : undefined,
      urgencyJustification: urgencyJustification || undefined,
      signatureType: signatureType as any,
      templateType: templateType as any,
      observations: observations || undefined,
    };

    const newCase = await CaseService.createCase(caseData, session.user.id);

    // Subir todos los archivos al blob storage y registrarlos en la BD
    const { FileService } = await import('@/services/file.service');
    
    for (let i = 0; i < documentFiles.length; i++) {
      const file = documentFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await FileService.uploadFile(
        {
          caseId: newCase.id,
          fileName: file.name,
          fileType: 'DOCUMENT',
          description: i === 0 
            ? 'Documento principal de la solicitud' 
            : `Documento adicional ${i} de la solicitud`,
        },
        session.user.id,
        buffer
      );
    }

    return successResponse(newCase, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
