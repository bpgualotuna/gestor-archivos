import { useQuery } from '@tanstack/react-query';
import { AuditLogWithUser, CommentWithUser } from '@/types/history.types';

/**
 * Hook para obtener el historial de un caso
 */
export function useCaseHistory(caseId: string) {
  return useQuery<{ history: AuditLogWithUser[]; comments: CommentWithUser[] }>({
    queryKey: ['history', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/history`);
      if (!response.ok) throw new Error('Error al cargar historial');
      const data = await response.json();
      return data.data;
    },
    enabled: !!caseId,
  });
}
