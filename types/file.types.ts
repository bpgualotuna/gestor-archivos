export type FileType = 
  | 'DOCUMENT'
  | 'IMAGE'
  | 'PDF'
  | 'SPREADSHEET'
  | 'OTHER';

export interface FileRecord {
  id: string;
  caseId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  mimeType?: string;
  description?: string;
  signatureReason?: string;
  blobUrl: string;
  blobPath: string;
  version: number;
  parentFileId?: string;
  isFinal: boolean;
  isDeleted: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  deletedAt?: Date;
}

export interface UploadFileDTO {
  caseId: string;
  fileName: string;
  fileType: FileType;
  description?: string;
  signatureReason?: string;
  file: File;
  parentFileId?: string;
}

export interface UploadFileData {
  caseId: string;
  fileName: string;
  fileType: FileType;
  description?: string;
  signatureReason?: string;
  parentFileId?: string;
}

export interface FileVersion {
  version: number;
  fileName: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
  blobUrl: string;
}
