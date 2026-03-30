'use client';

import { use } from 'react';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { useWorkflowProgress } from '@/hooks/useFlow';
import { useCaseHistory } from '@/hooks/useHistory';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FlowStepper } from '@/components/flow/FlowStepper';
import { Timeline } from '@/components/history/Timeline';
import { FileUploader } from '@/components/files/FileUploader';
import { FileList } from '@/components/files/FileList';
import { ApprovalActions } from '@/components/flow/ApprovalActions';
import { SubmitCaseButton } from '@/components/cases/SubmitCaseButton';
import { CaseInformation } from '@/components/cases/CaseInformation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatCaseNumber } from '@/lib/utils/format';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'files' | 'workflow'>('info');

  const { user } = useAuth();
  const { data: caseData, isLoading: caseLoading, refetch: refetchCase } = useCaseDetail(id);
  const { data: workflow, isLoading: workflowLoading, refetch: refetchWorkflow } = useWorkflowProgress(id);
  const { data: history, isLoading: historyLoading } = useCaseHistory(id);

  // Determinar si el usuario puede aprobar o devolver
  // Solo si el caso está asignado a su área actual
  const canApprove = !!(user && caseData && (
    user.role === 'ADMIN' || 
    (user.role === 'AREA_USER' && caseData.currentArea && user.area === caseData.currentArea)
  ));

  const canReturn = canApprove;

  // Determinar si el usuario puede subir archivos
  // Usuario normal: si es el creador
  // Áreas: solo si el caso está asignado a su área
  // Admin: siempre
  const canUploadFiles = !!(user && caseData && (
    user.role === 'ADMIN' ||
    user.id === caseData.createdBy ||
    (user.role === 'AREA_USER' && caseData.currentArea && user.area === caseData.currentArea)
  ));

  // Determinar si el usuario puede enviar el caso (es el creador y está en DRAFT o RETURNED)
  const canSubmit = !!(user && caseData && (
    user.role === 'ADMIN' || user.id === caseData.createdBy
  ) && (caseData.status === 'DRAFT' || caseData.status === 'RETURNED'));

  const handleApprovalSuccess = () => {
    // Redirigir a la lista de casos después de aprobar
    // porque el usuario ya no tendrá acceso al caso (cambió de área)
    router.push('/review');
  };

  const handleSubmitSuccess = () => {
    // Recargar los datos del caso
    refetchCase();
    refetchWorkflow();
  };

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Caso no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a casos
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{caseData.title}</h2>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-sm sm:text-base text-gray-600">{formatCaseNumber(caseData.caseNumber)}</p>
            {caseData.description && (
              <p className="text-sm sm:text-base text-gray-700 mt-2">{caseData.description}</p>
            )}
            
            {/* Indicador de permisos para áreas */}
            {user && user.role === 'AREA_USER' && (
              <div className="mt-3">
                {canApprove ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Asignado a tu área - Puedes interactuar
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Solo lectura - No asignado a tu área
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón de Enviar (solo para borradores) */}
      {canSubmit && (
        <SubmitCaseButton caseId={id} onSuccess={handleSubmitSuccess} />
      )}

      {/* Acciones de Aprobación */}
      {canApprove && (caseData.status === 'SUBMITTED' || caseData.status === 'IN_REVIEW') && (
        <ApprovalActions
          caseId={id}
          canApprove={canApprove}
          canReturn={canReturn}
          onSuccess={handleApprovalSuccess}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información del Caso
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Flujo de Aprobación
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archivos ({caseData.fileCount})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <CaseInformation caseData={caseData} />
            
            {/* Historial */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Historial del Caso</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : history && history.history.length > 0 ? (
                  <Timeline history={history.history} />
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay historial disponible</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div>
            {workflowLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : workflow && workflow.length > 0 ? (
              <FlowStepper steps={workflow} />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No hay flujo de aprobación configurado
              </p>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Archivos Subidos</h3>
              <FileList caseId={id} />
            </div>
            {canUploadFiles && (
              <div className="border-t pt-6">
                <FileUploader caseId={id} />
              </div>
            )}
            {!canUploadFiles && (
              <div className="border-t pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    Solo puedes subir archivos cuando el caso esté asignado a tu área
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
