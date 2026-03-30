import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CaseWithCreator, CreateCaseDTO } from '@/types/case.types';

/**
 * Hook para obtener todos los casos
 * @param assignedOnly - Si es true, solo devuelve casos asignados al área del usuario
 */
export function useCases(assignedOnly: boolean = false) {
  return useQuery<CaseWithCreator[]>({
    queryKey: ['cases', assignedOnly],
    queryFn: async () => {
      const url = assignedOnly ? '/api/cases?assignedOnly=true' : '/api/cases';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar casos');
      const data = await response.json();
      return data.data;
    },
  });
}

/**
 * Hook para crear un caso
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCaseDTO) => {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al crear caso');
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * Hook para enviar un caso
 */
export function useSubmitCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' }),
      });
      
      if (!response.ok) throw new Error('Error al enviar caso');
      return response.json();
    },
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}
