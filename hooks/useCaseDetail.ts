import { useQuery } from '@tanstack/react-query';
import { CaseWithCreator } from '@/types/case.types';

/**
 * Hook para obtener el detalle de un caso
 */
export function useCaseDetail(caseId: string) {
  return useQuery<CaseWithCreator>({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) throw new Error('Error al cargar caso');
      const data = await response.json();
      return data.data;
    },
    enabled: !!caseId,
  });
}
