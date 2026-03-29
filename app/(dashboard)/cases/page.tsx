'use client';

import { useCases } from '@/hooks/useCases';
import { CaseCard } from '@/components/cases/CaseCard';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

export default function CasesPage() {
  const { data: cases, isLoading, error } = useCases();

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Casos</h2>
          <p className="text-gray-600 mt-1">Gestiona todos tus casos</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Caso</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {cases && cases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes casos aún</p>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Crear tu primer caso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases?.map((caseData) => (
            <CaseCard key={caseData.id} case={caseData} />
          ))}
        </div>
      )}
    </div>
  );
}
