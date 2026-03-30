'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/shared/Toast';

interface WorkflowStep {
  id?: string;
  name: string;
  requiredArea: string;
  stepOrder: number;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  steps: WorkflowStep[];
}

const roleLabels: Record<string, string> = {
  COMERCIAL: 'Comercial',
  TECNICA: 'Técnica',
  FINANCIERA: 'Financiera',
  LEGAL: 'Legal',
};

export function WorkflowManagement() {
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const queryClient = useQueryClient();
  const { toasts, hideToast, success, error } = useToast();

  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ['admin-workflows'],
    queryFn: async () => {
      const response = await fetch('/api/admin/workflows');
      if (!response.ok) throw new Error('Error al cargar workflows');
      const data = await response.json();
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await fetch('/api/admin/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar workflow');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workflows'] });
      setEditingWorkflow(null);
      success('Workflow actualizado exitosamente');
    },
    onError: (err: Error) => {
      error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeWorkflow = workflows?.find(w => w.isActive);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Configuración de Workflow</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configura el flujo de aprobación del sistema
          </p>
        </div>
      </div>

      {activeWorkflow ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Cómo funciona la edición:</strong> Al editar el workflow, los pasos antiguos se marcan como "históricos" 
              y se crean nuevos pasos. Los casos completados mantendrán su historial de aprobación original, 
              mientras que los nuevos casos usarán el workflow actualizado.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-2 border-green-500">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{activeWorkflow.name}</h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
              {activeWorkflow.description && (
                <p className="text-sm text-gray-600">{activeWorkflow.description}</p>
              )}
            </div>
            <button
              onClick={() => setEditingWorkflow(activeWorkflow)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar Workflow
            </button>
          </div>

          {/* Pasos del workflow */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Pasos del Flujo:</h5>
            <div className="flex flex-wrap items-center gap-2">
              {activeWorkflow.steps.map((step, idx) => (
                <div key={step.id || idx} className="flex items-center gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div className="text-xs font-medium text-blue-900">
                      {step.stepOrder}. {step.name}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {roleLabels[step.requiredArea]}
                    </div>
                  </div>
                  {idx < activeWorkflow.steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay workflow activo configurado</p>
        </div>
      )}

      {/* Modal Editar Workflow */}
      {editingWorkflow && (
        <EditWorkflowModal
          workflow={editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          onSubmit={(data) => updateMutation.mutate({ workflowId: editingWorkflow.id, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}

function EditWorkflowModal({
  workflow,
  onClose,
  onSubmit,
  isLoading,
}: {
  workflow: Workflow;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const { toasts, hideToast, error } = useToast();
  const [formData, setFormData] = useState({
    name: workflow.name,
    description: workflow.description || '',
    steps: workflow.steps.map(s => ({ ...s })),
  });

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          name: '',
          requiredArea: 'COMERCIAL',
          stepOrder: formData.steps.length + 1,
        },
      ],
    });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) {
      error('Debe haber al menos un paso en el workflow');
      return;
    }
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Reordenar los pasos
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    (newSteps[index] as any)[field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full my-8 shadow-2xl border border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Editar Workflow</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Workflow
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
              placeholder="Ej: Flujo de Aprobación Estándar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={2}
              placeholder="Describe el propósito de este workflow..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Pasos del Workflow
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <span className="text-lg">+</span>
                Agregar Paso
              </button>
            </div>

            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Paso {step.stepOrder}
                    </span>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                      placeholder="Nombre del paso"
                      required
                    />

                    <select
                      value={step.requiredArea}
                      onChange={(e) => updateStep(index, 'requiredArea', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                    >
                      <option value="COMERCIAL">Comercial</option>
                      <option value="TECNICA">Técnica</option>
                      <option value="FINANCIERA">Financiera</option>
                      <option value="LEGAL">Legal</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Toasts */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
