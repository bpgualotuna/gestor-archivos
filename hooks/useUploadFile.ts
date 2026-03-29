import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadFileDTO } from '@/types/file.types';

/**
 * Hook para subir archivos
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadFileDTO & { file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('caseId', data.caseId);
      formData.append('fileType', data.fileType);
      
      if (data.description) formData.append('description', data.description);
      if (data.signatureReason) formData.append('signatureReason', data.signatureReason);
      if (data.parentFileId) formData.append('parentFileId', data.parentFileId);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir archivo');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId, 'files'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
