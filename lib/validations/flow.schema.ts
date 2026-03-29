import { z } from 'zod';

export const approveStepSchema = z.object({
  caseId: z.string().uuid('ID de caso inválido'),
  comments: z.string().optional(),
});

export const rejectStepSchema = z.object({
  caseId: z.string().uuid('ID de caso inválido'),
  comments: z.string().min(10, 'Debe proporcionar un motivo de rechazo (mínimo 10 caracteres)'),
});

export const returnCaseSchema = z.object({
  caseId: z.string().uuid('ID de caso inválido'),
  comments: z.string().min(10, 'Debe proporcionar comentarios (mínimo 10 caracteres)'),
  returnReason: z.string().min(10, 'Debe especificar el motivo de devolución'),
});

export type ApproveStepInput = z.infer<typeof approveStepSchema>;
export type RejectStepInput = z.infer<typeof rejectStepSchema>;
export type ReturnCaseInput = z.infer<typeof returnCaseSchema>;
