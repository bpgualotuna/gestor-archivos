import { z } from 'zod';

export const uploadFileSchema = z.object({
  caseId: z.string().uuid('ID de caso inválido'),
  fileName: z.string().min(1, 'El nombre del archivo es requerido'),
  fileType: z.enum(['DOCUMENT', 'IMAGE', 'PDF', 'SPREADSHEET', 'OTHER']),
  description: z.string().optional(),
  signatureReason: z.string().optional(),
  parentFileId: z.string().uuid().optional(),
});

export const fileIdSchema = z.object({
  id: z.string().uuid('ID de archivo inválido'),
});

// Validación de tamaño de archivo (50MB máximo)
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateFileSize = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
