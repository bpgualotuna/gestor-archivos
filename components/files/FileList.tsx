'use client';

import { useQuery } from '@tanstack/react-query';
import { File as FileIcon, Download, Loader2, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blobUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  description?: string;
  version: number;
  createdAt: string;
}

interface FileListProps {
  caseId: string;
}

export function FileList({ caseId }: FileListProps) {
  const { data: files, isLoading, error } = useQuery<FileData[]>({
    queryKey: ['files', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/files`);
      if (!response.ok) throw new Error('Error al cargar archivos');
      const data = await response.json();
      return data.data;
    },
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'IMAGE':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'SPREADSHEET':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      default:
        return <FileIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (file: FileData) => {
    // Crear un link temporal para descargar
    const link = document.createElement('a');
    link.href = file.blobUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error al cargar archivos
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8">
        <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay archivos subidos</p>
        <p className="text-sm text-gray-400 mt-1">
          Usa el formulario de arriba para subir archivos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Icono del archivo */}
          <div className="flex-shrink-0">
            {getFileIcon(file.fileType)}
          </div>

          {/* Información del archivo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {file.fileName}
              </h4>
              {file.version > 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  v{file.version}
                </span>
              )}
            </div>
            
            {file.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {file.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>•</span>
              <span>{file.uploadedByName}</span>
              <span>•</span>
              <span>
                {format(new Date(file.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
          </div>

          {/* Botón de descarga */}
          <button
            onClick={() => handleDownload(file)}
            className="flex-shrink-0 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Descargar archivo"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
