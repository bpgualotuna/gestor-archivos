'use client';

import { useState } from 'react';
import { useCases } from '@/hooks/useCases';
import { Users, FolderOpen, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { WorkflowManagement } from '@/components/admin/WorkflowManagement';

type AdminView = 'dashboard' | 'users' | 'workflows';

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
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
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600 mt-1">
          Gestión y configuración del sistema
        </p>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeView === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveView('workflows')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeView === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configuración de Workflows
          </button>
        </nav>
      </div>

      {/* Contenido según la vista activa */}
      {activeView === 'dashboard' && (
        <>
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
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Usuarios
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Administra usuarios, roles y permisos del sistema
              </p>
              <button
                onClick={() => setActiveView('users')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Gestionar Usuarios
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Configuración de Flujo
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configura el flujo de aprobación y pasos del workflow
              </p>
              <button
                onClick={() => setActiveView('workflows')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Configurar Workflow
              </button>
            </div>
          </div>
        </>
      )}

      {activeView === 'users' && <UserManagement />}
      {activeView === 'workflows' && <WorkflowManagement />}
    </div>
  );
}
