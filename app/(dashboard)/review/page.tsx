'use client';

import { useCases } from '@/hooks/useCases';
import { CaseCard } from '@/components/cases/CaseCard';
import { Loader2 } from 'lucide-react';

export default function ReviewPage() {
  const { data: cases, isLoading, error } = useCases();

  // Filtrar casos que están en revisión
  const casesInReview = cases?.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'IN_REVIEW'
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error al cargar casos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revisar Casos</h2>
        <p className="text-gray-600 mt-1">
          Casos pendientes de revisión y aprobación
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Pendientes de Revisión</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {casesInReview.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Enviados Hoy</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {cases?.filter((c) => {
              const today = new Date().toDateString();
              return new Date(c.createdAt).toDateString() === today;
            }).length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Devueltos</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {cases?.filter((c) => c.status === 'RETURNED').length || 0}
          </div>
        </div>
      </div>

      {/* Lista de casos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Casos en Revisión
        </h3>
        
        {casesInReview.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay casos pendientes de revisión</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casesInReview.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>
        )}
      </div>

      {/* Casos devueltos */}
      {(cases?.filter((c) => c.status === 'RETURNED').length ?? 0) > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Casos Devueltos para Corrección
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases
              ?.filter((c) => c.status === 'RETURNED')
              .map((caseData) => (
                <CaseCard key={caseData.id} case={caseData} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
