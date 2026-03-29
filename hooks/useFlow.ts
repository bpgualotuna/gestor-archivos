import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowProgressView } from '@/types/flow.types';

/**
 * Hook para obtener el progreso del workflow
 */
export function useWorkflowProgress(caseId: string) {
  return useQuery<WorkflowProgressView[]>({
    queryKey: ['workflow', caseId],
    queryFn: async () => {
      const response = await fetch('/api/flow/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      
      if (!response.ok) throw new Error('Error al cargar workflow');
      const data = await response.json();
      return data.data;
    },
    enabled: !!caseId,
  });
}

/**
 * Hook para aprobar un paso
 */
export function useApproveStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, comments }: { caseId: string; comments?: string }) => {
      const response = await fetch('/api/flow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, comments }),
      });

      if (!response.ok) throw new Error('Error al aprobar');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * Hook para devolver un caso
 */
export function useReturnCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      comments,
      returnReason,
    }: {
      caseId: string;
      comments: string;
      returnReason: string;
    }) => {
      const response = await fetch('/api/flow/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, comments, returnReason }),
      });

      if (!response.ok) throw new Error('Error al devolver caso');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * Hook combinado para acciones de flujo
 */
export function useFlow() {
  const approveMutation = useApproveStep();
  const returnMutation = useReturnCase();

  return {
    approveStep: approveMutation.mutateAsync,
    returnCase: returnMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isReturning: returnMutation.isPending,
  };
}
