'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SubmitCaseButtonProps {
  caseId: string;
  onSuccess?: () => void;
}

export function SubmitCaseButton({ caseId, onSuccess }: SubmitCaseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar caso');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['workflow', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      
      alert('✅ Caso enviado exitosamente. Ahora está en revisión.');
      
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    },
    onError: (error: Error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    setShowConfirm(false);
    submitMutation.mutate();
  };

  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Caso en Borrador
            </h3>
            <p className="text-gray-700 mb-4">
              Este caso está en estado de borrador. Sube los archivos necesarios y luego envíalo para que comience el proceso de revisión.
            </p>
            
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar para Revisión
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirmar Envío</h3>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas enviar este caso para revisión? Una vez enviado, comenzará el proceso de aprobación por las diferentes áreas.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
