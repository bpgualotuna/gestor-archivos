import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(255),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional().default(0),
  dueDate: z.string().datetime().optional(),
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
  dueDate: z.string().datetime().optional(),
});

export const caseIdSchema = z.object({
  id: z.string().uuid('ID de caso inválido'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
