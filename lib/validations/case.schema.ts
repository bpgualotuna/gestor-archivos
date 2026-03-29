import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(255),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional().default(0),
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  // Nuevos campos del formulario de revisión legal
  advisorName: z.string().min(3, 'El nombre del asesor es requerido').optional(),
  documentFileName: z.string().min(3, 'El nombre del archivo es requerido').optional(),
  odooCode: z.string().max(6, 'El código Odoo debe tener máximo 6 caracteres').regex(/^S/, 'El código Odoo debe empezar con "S"').optional().or(z.literal('')),
  clientProvider: z.string().min(3, 'El cliente/proveedor es requerido').optional(),
  documentType: z.enum(['CONTRATO', 'CONVENIO', 'ACUERDO', 'OTRO']).optional(),
  sharepointUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  requestDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  requiredDeliveryDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  urgencyJustification: z.string().optional(),
  signatureType: z.enum(['FISICA', 'ELECTRONICA']).optional(),
  templateType: z.enum(['PLANTILLA_COMWARE', 'PLANTILLA_CLIENTE', 'PLANTILLA_PROVEEDOR']).optional(),
  observations: z.string().optional(),
});

export const updateCaseSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'RETURNED',
    'COMPLETED',
    'CANCELLED',
  ]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  advisorName: z.string().min(3).optional(),
  documentFileName: z.string().min(3).optional(),
  odooCode: z.string().max(6).regex(/^S/, 'El código Odoo debe empezar con "S"').optional().or(z.literal('')),
  clientProvider: z.string().min(3).optional(),
  documentType: z.enum(['CONTRATO', 'CONVENIO', 'ACUERDO', 'OTRO']).optional(),
  sharepointUrl: z.string().url().optional().or(z.literal('')),
  requestDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  requiredDeliveryDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  urgencyJustification: z.string().optional(),
  signatureType: z.enum(['FISICA', 'ELECTRONICA']).optional(),
  templateType: z.enum(['PLANTILLA_COMWARE', 'PLANTILLA_CLIENTE', 'PLANTILLA_PROVEEDOR']).optional(),
  observations: z.string().optional(),
});

export const caseIdSchema = z.object({
  id: z.string().uuid('ID de caso inválido'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
