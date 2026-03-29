'use client';

import { useCases } from '@/hooks/useCases';
import { CaseCard } from '@/components/cases/CaseCard';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

export default function DashboardPage() {
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

  const recentCases = cases?.slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión de archivos</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total de Casos</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{cases?.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">En Revisión</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {cases?.filter((c) => c.status === 'IN_REVIEW').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Aprobados</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {cases?.filter((c) => c.status === 'APPROVED').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Devueltos</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {cases?.filter((c) => c.status === 'RETURNED').length || 0}
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Casos Recientes</h3>
          <Link href="/cases" className="text-blue-600 hover:text-blue-700 text-sm">
            Ver todos
          </Link>
        </div>
        
        {recentCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay casos aún</p>
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Crear tu primer caso
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCases.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
