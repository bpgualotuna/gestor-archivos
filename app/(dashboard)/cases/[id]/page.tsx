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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'files' | 'workflow' | 'history'>('workflow');

  const { user } = useAuth();
  const { data: caseData, isLoading: caseLoading, refetch: refetchCase } = useCaseDetail(id);
  const { data: workflow, isLoading: workflowLoading, refetch: refetchWorkflow } = useWorkflowProgress(id);
  const { data: history, isLoading: historyLoading } = useCaseHistory(id);

  // Determinar si el usuario puede aprobar o devolver
  const canApprove = !!(user && caseData && (
    user.role === 'ADMIN' || 
    (caseData.currentAreaRole && user.role === caseData.currentAreaRole)
  ));

  const canReturn = canApprove;

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
    <div className="space-y-6">
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a casos
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{caseData.title}</h2>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-gray-600">{caseData.caseNumber}</p>
            {caseData.description && (
              <p className="text-gray-700 mt-2">{caseData.description}</p>
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Flujo de Aprobación
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archivos ({caseData.fileCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
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
            <FileUploader caseId={id} />
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Archivos Subidos</h3>
              <FileList caseId={id} />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
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
        )}
      </div>
    </div>
  );
}
