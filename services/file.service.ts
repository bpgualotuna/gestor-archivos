import { query, transaction } from '@/lib/db';
import { getBlobStorage } from '@/lib/azure/blob-storage';
import { FileRecord, UploadFileData } from '@/types/file.types';
import { PoolClient } from 'pg';

export class FileService {
  /**
   * Obtiene todos los archivos de un caso
   */
  static async getCaseFiles(caseId: string): Promise<FileRecord[]> {
    const result = await query<any>(
      `SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM files f
       JOIN users u ON f.uploaded_by = u.id
       WHERE f.case_id = $1 AND f.is_deleted = false
       ORDER BY f.version DESC, f.uploaded_at DESC`,
      [caseId]
    );

    return result.rows.map(this.mapFileFromDb);
  }

  /**
   * Obtiene un archivo por ID
   */
  static async getFileById(id: string): Promise<FileRecord | null> {
    const result = await query<FileRecord>(
      'SELECT * FROM files WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapFileFromDb(result.rows[0]);
  }

  /**
   * Sube un archivo
   */
  static async uploadFile(
    data: UploadFileData,
    userId: string,
    fileBuffer: Buffer
  ): Promise<FileRecord> {
    return transaction(async (client: PoolClient) => {
      // Determinar la versión
      let version = 1;
      if (data.parentFileId) {
        const parentResult = await client.query(
          'SELECT version FROM files WHERE id = $1',
          [data.parentFileId]
        );
        if (parentResult.rows.length > 0) {
          version = parentResult.rows[0].version + 1;
        }
      }

      // Subir a Azure Blob
      const blobStorage = getBlobStorage();
      const { blobUrl, blobPath } = await blobStorage.uploadFile(
        data.caseId,
        data.fileName,
        fileBuffer,
        version,
        false
      );

      // Guardar en BD
      const result = await client.query<FileRecord>(
        `INSERT INTO files (
          case_id, file_name, file_type, file_size, mime_type,
          description, signature_reason, blob_url, blob_path,
          version, parent_file_id, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          data.caseId,
          data.fileName,
          data.fileType,
          fileBuffer.length,
          this.getMimeType(data.fileName),
          data.description,
          data.signatureReason,
          blobUrl,
          blobPath,
          version,
          data.parentFileId,
          userId,
        ]
      );

      // Registrar en audit log
      await client.query(
        `INSERT INTO audit_log (case_id, user_id, action, entity_type, entity_id, new_value)
         VALUES ($1, $2, 'FILE_UPLOADED', 'file', $3, $4)`,
        [
          data.caseId,
          userId,
          result.rows[0].id,
          JSON.stringify({ fileName: data.fileName, version }),
        ]
      );

      return this.mapFileFromDb(result.rows[0]);
    });
  }

  /**
   * Sube un archivo final firmado
   */
  static async uploadFinalFile(
    caseId: string,
    fileName: string,
    fileBuffer: Buffer,
    userId: string
  ): Promise<FileRecord> {
    return transaction(async (client: PoolClient) => {
      // Subir a Azure Blob en carpeta final
      const blobStorage = getBlobStorage();
      const { blobUrl, blobPath } = await blobStorage.uploadFile(
        caseId,
        fileName,
        fileBuffer,
        1,
        true
      );

      // Guardar en BD
      const result = await client.query<FileRecord>(
        `INSERT INTO files (
          case_id, file_name, file_type, file_size, mime_type,
          blob_url, blob_path, version, is_final, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, true, $8)
        RETURNING *`,
        [
          caseId,
          fileName,
          'PDF',
          fileBuffer.length,
          'application/pdf',
          blobUrl,
          blobPath,
          userId,
        ]
      );

      return this.mapFileFromDb(result.rows[0]);
    });
  }

  /**
   * Elimina un archivo (soft delete)
   */
  static async deleteFile(id: string): Promise<void> {
    await query(
      `UPDATE files 
       SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }

  /**
   * Obtiene el historial de versiones de un archivo
   */
  static async getFileVersions(parentFileId: string): Promise<FileRecord[]> {
    const result = await query<FileRecord>(
      `WITH RECURSIVE file_tree AS (
        SELECT * FROM files WHERE id = $1
        UNION ALL
        SELECT f.* FROM files f
        INNER JOIN file_tree ft ON f.parent_file_id = ft.id
      )
      SELECT * FROM file_tree
      WHERE is_deleted = false
      ORDER BY version ASC`,
      [parentFileId]
    );

    return result.rows.map(this.mapFileFromDb);
  }

  /**
   * Detecta el MIME type
   */
  private static getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Mapea los campos de la BD a camelCase
   */
  private static mapFileFromDb(row: any): any {
    return {
      id: row.id,
      caseId: row.case_id,
      fileName: row.file_name,
      fileType: row.file_type,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      description: row.description,
      signatureReason: row.signature_reason,
      blobUrl: row.blob_url,
      blobPath: row.blob_path,
      version: row.version,
      parentFileId: row.parent_file_id,
      isFinal: row.is_final,
      isDeleted: row.is_deleted,
      uploadedBy: row.uploaded_by,
      uploadedByName: row.uploaded_by_name,
      uploadedAt: row.uploaded_at,
      deletedAt: row.deleted_at,
      createdAt: row.uploaded_at,
    };
  }
}
