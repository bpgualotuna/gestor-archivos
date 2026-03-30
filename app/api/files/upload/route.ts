import { NextRequest } from 'next/server';
import { FileService } from '@/services/file.service';
import { uploadFileSchema, MAX_FILE_SIZE } from '@/lib/validations/file.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { ValidationError } from '@/lib/utils/errors';
import { requireAuth, canInteractWithCase } from '@/lib/auth/get-session';
import { query } from '@/lib/db';

/**
 * POST /api/files/upload
 * Sube un archivo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const fileType = formData.get('fileType') as string;
    const description = formData.get('description') as string | undefined;
    const signatureReason = formData.get('signatureReason') as string | undefined;
    const parentFileId = formData.get('parentFileId') as string | undefined;

    if (!file) {
      throw new ValidationError('Archivo no proporcionado');
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Verificar acceso al caso
    const caseResult = await query(
      'SELECT created_by, current_area FROM cases WHERE id = $1',
      [caseId]
    );
    
    if (caseResult.rows.length === 0) {
      throw new ValidationError('Caso no encontrado');
    }

    await canInteractWithCase(caseResult.rows[0].created_by, caseResult.rows[0].current_area);

    // Validar datos
    const validatedData = uploadFileSchema.parse({
      caseId,
      fileName: file.name,
      fileType,
      description: description || undefined,
      signatureReason: signatureReason || undefined,
      parentFileId: parentFileId || undefined,
    });

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await FileService.uploadFile(
      validatedData,
      session.user.id,
      buffer
    );

    return successResponse(uploadedFile, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
