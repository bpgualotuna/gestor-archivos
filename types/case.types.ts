export type CaseStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  createdBy: string;
  currentStepId?: string;
  currentAreaRole?: string; // Área que debe revisar actualmente
  priority: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseWithCreator extends Case {
  creatorName: string;
  creatorEmail: string;
  fileCount: number;
  commentCount: number;
}

export interface CreateCaseDTO {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: Date;
}

export interface UpdateCaseDTO {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: number;
  dueDate?: Date;
}
