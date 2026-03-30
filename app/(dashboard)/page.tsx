'use client';

import { useState, useMemo } from 'react';
import { useCases } from '@/hooks/useCases';
import { CaseCard } from '@/components/cases/CaseCard';
import Link from 'next/link';
import { Plus, Loader2, Search, X } from 'lucide-react';

export default function DashboardPage() {
  const { data: cases, isLoading, error } = useCases(true); // Solo casos asignados
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar casos según la búsqueda
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    if (!searchQuery.trim()) return cases;

    const query = searchQuery.toLowerCase();
    return cases.filter((caseData) => {
      return (
        caseData.title.toLowerCase().includes(query) ||
        caseData.caseNumber.toLowerCase().includes(query) ||
        caseData.description?.toLowerCase().includes(query)
      );
    });
  }, [cases, searchQuery]);

  const displayCases = searchQuery ? filteredCases : cases?.slice(0, 6) || [];

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
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión de archivos</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por título, número de caso o descripción..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery ? 'Resultados de Búsqueda' : 'Casos Recientes'}
            </h3>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-1">
                {filteredCases.length === 0 ? (
                  <>No se encontraron casos que coincidan con "{searchQuery}"</>
                ) : (
                  <>{filteredCases.length} {filteredCases.length === 1 ? 'caso encontrado' : 'casos encontrados'}</>
                )}
              </p>
            )}
          </div>
          {!searchQuery && (
            <Link href="/cases" className="text-blue-600 hover:text-blue-700 text-sm">
              Ver todos
            </Link>
          )}
        </div>
        
        {displayCases.length === 0 && !searchQuery ? (
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
        ) : displayCases.length === 0 && searchQuery ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No se encontraron casos</p>
            <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCases.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
