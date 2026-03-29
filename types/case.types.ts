import { UserRole } from './user.types';

export type CaseStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DocumentType = 
  | 'CONTRATO'
  | 'CONVENIO'
  | 'ACUERDO'
  | 'OTRO';

export type SignatureType = 'FISICA' | 'ELECTRONICA';

export type TemplateType = 
  | 'PLANTILLA_COMWARE'
  | 'PLANTILLA_CLIENTE'
  | 'PLANTILLA_PROVEEDOR';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  createdBy: string;
  currentStepId?: string;
  currentAreaRole?: UserRole;
  priority: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Nuevos campos
  advisorName?: string;
  documentFileName?: string;
  odooCode?: string;
  clientProvider?: string;
  documentType?: DocumentType;
  sharepointUrl?: string;
  requestDate?: Date;
  requiredDeliveryDate?: Date;
  urgencyJustification?: string;
  signatureType?: SignatureType;
  templateType?: TemplateType;
  observations?: string;
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
  advisorName?: string;
  documentFileName?: string;
  odooCode?: string;
  clientProvider?: string;
  documentType?: DocumentType;
  sharepointUrl?: string;
  requestDate?: Date;
  requiredDeliveryDate?: Date;
  urgencyJustification?: string;
  signatureType?: SignatureType;
  templateType?: TemplateType;
  observations?: string;
}

export interface UpdateCaseDTO {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: number;
  dueDate?: Date;
  advisorName?: string;
  documentFileName?: string;
  odooCode?: string;
  clientProvider?: string;
  documentType?: DocumentType;
  sharepointUrl?: string;
  requestDate?: Date;
  requiredDeliveryDate?: Date;
  urgencyJustification?: string;
  signatureType?: SignatureType;
  templateType?: TemplateType;
  observations?: string;
}
