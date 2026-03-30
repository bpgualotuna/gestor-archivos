'use client';

import { useCases } from '@/hooks/useCases';
import { Users, FolderOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: cases } = useCases();

  const stats = {
    totalCases: cases?.length || 0,
    totalUsers: 6,
    approved: cases?.filter((c) => c.status === 'APPROVED').length || 0,
    rejected: cases?.filter((c) => c.status === 'REJECTED').length || 0,
    inReview: cases?.filter((c) => c.status === 'IN_REVIEW').length || 0,
    completed: cases?.filter((c) => c.status === 'COMPLETED').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">General</h2>
        <p className="text-gray-600 mt-2">
          Vista general del sistema
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Total de Casos</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {stats.totalCases}
              </div>
            </div>
            <FolderOpen className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Usuarios</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </div>
            </div>
            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Aprobados</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
                {stats.approved}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">En Revisión</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                {stats.inReview}
              </div>
            </div>
            <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Gestión de Usuarios
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Administra usuarios, roles y permisos del sistema
            </p>
            <div className="text-purple-600 font-medium text-sm">
              Ir a Gestión de Usuarios →
            </div>
          </div>
        </Link>

        <Link href="/admin/workflows">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración de Flujo
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configura el flujo de aprobación y pasos del workflow
            </p>
            <div className="text-blue-600 font-medium text-sm">
              Ir a Configuración de Workflows →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
