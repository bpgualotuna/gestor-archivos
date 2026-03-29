'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useFlow } from '@/hooks/useFlow';

interface ApprovalActionsProps {
  caseId: string;
  canApprove: boolean;
  canReturn: boolean;
  onSuccess?: () => void;
}

export function ApprovalActions({ 
  caseId, 
  canApprove, 
  canReturn,
  onSuccess 
}: ApprovalActionsProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [comments, setComments] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const { approveStep, returnCase, isApproving, isReturning } = useFlow();

  const handleApprove = async () => {
    try {
      await approveStep({ caseId, comments });
      setShowApproveModal(false);
      setComments('');
      
      // Mostrar mensaje de éxito
      alert('✅ Caso aprobado exitosamente. Avanzando al siguiente paso...');
      
      // Delay antes de redirigir para evitar errores de refetch
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('❌ Error al aprobar el caso. Por favor intenta nuevamente.');
    }
  };

  const handleReturn = async () => {
    // Validar campos antes de enviar
    if (!returnReason.trim()) {
      alert('❌ Debes proporcionar un motivo de devolución');
      return;
    }

    if (!comments.trim() || comments.trim().length < 10) {
      alert('❌ Los comentarios deben tener al menos 10 caracteres');
      return;
    }

    try {
      await returnCase({ caseId, comments, returnReason });
      setShowReturnModal(false);
      setComments('');
      setReturnReason('');
      
      // Mostrar mensaje de éxito
      alert('✅ Caso devuelto exitosamente. El usuario recibirá una notificación.');
      
      // Delay antes de redirigir para evitar errores de refetch
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error: any) {
      console.error('Error al devolver:', error);
      alert(`❌ Error al devolver el caso: ${error.message || 'Por favor intenta nuevamente.'}`);
    }
  };

  if (!canApprove && !canReturn) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones de Revisión</h3>
      
      <div className="flex gap-3">
        {canApprove && (
          <button
            onClick={() => setShowApproveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Aprobar
          </button>
        )}

        {canReturn && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Devolver
          </button>
        )}
      </div>

      {/* Modal de Aprobación */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Aprobar Paso</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Agregar comentarios sobre la aprobación..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setComments('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isApproving}
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isApproving ? 'Aprobando...' : 'Confirmar Aprobación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Devolución */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Devolver Caso</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de devolución <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ej: Documentos incompletos"
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comentarios detallados <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs ${comments.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                  {comments.length}/10 caracteres mínimo
                </span>
              </div>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={4}
                placeholder="Explica qué debe corregir el usuario..."
                required
              />
              {comments.length > 0 && comments.length < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Faltan {10 - comments.length} caracteres
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setComments('');
                  setReturnReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isReturning}
              >
                Cancelar
              </button>
              <button
                onClick={handleReturn}
                disabled={isReturning || !returnReason.trim() || comments.length < 10}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReturning ? 'Devolviendo...' : 'Confirmar Devolución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
