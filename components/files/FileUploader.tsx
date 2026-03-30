'use client';

import { useState } from 'react';
import { useUploadFile } from '@/hooks/useUploadFile';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  caseId: string;
  onSuccess?: () => void;
}

export function FileUploader({ caseId, onSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const uploadMutation = useUploadFile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;

    uploadMutation.mutate(
      {
        caseId,
        fileName: file.name,
        fileType: 'DOCUMENT', // Siempre será documento
        description: description || undefined,
        file,
      },
      {
        onSuccess: () => {
          setFile(null);
          setDescription('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <button
        type="submit"
        disabled={!file || uploadMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {uploadMutation.isPending ? 'Guardando...' : 'Guardar Archivo'}
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Archivo
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click para subir</span> o arrastra y suelta
              </p>
              {file && <p className="text-xs text-gray-500">{file.name}</p>}
            </div>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Describe el contenido del archivo..."
        />
      </div>

      {uploadMutation.isError && (
        <div className="text-red-600 text-sm">
          Error: {uploadMutation.error.message}
        </div>
      )}
    </form>
  );
}
