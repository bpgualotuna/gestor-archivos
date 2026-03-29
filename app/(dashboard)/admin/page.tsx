'use client';

import { useCases } from '@/hooks/useCases';
import { Users, FolderOpen, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const { data: cases } = useCases();

  const stats = {
    totalCases: cases?.length || 0,
    totalUsers: 6, // De la base de datos seed
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

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total de Casos</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalCases}
              </div>
            </div>
            <FolderOpen className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Usuarios</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </div>
            </div>
            <Users className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Aprobados</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.approved}
              </div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">En Revisión</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.inReview}
              </div>
            </div>
            <Clock className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Secciones de Administración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestión de Usuarios */}
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
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Administradores</span>
              <span className="font-semibold">1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Usuarios por Área</span>
              <span className="font-semibold">4</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Usuarios Normales</span>
              <span className="font-semibold">1</span>
            </div>
          </div>
          <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
            Gestionar Usuarios
          </button>
        </div>

        {/* Configuración de Workflow */}
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
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Workflows Activos</span>
              <span className="font-semibold">1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Pasos Configurados</span>
              <span className="font-semibold">4</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Áreas Involucradas</span>
              <span className="font-semibold">4</span>
            </div>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Configurar Workflow
          </button>
        </div>

        {/* Reportes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Reportes y Estadísticas
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Genera reportes y visualiza estadísticas del sistema
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Tasa de Aprobación</span>
              <span className="font-semibold text-green-600">
                {stats.totalCases > 0
                  ? Math.round((stats.approved / stats.totalCases) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Casos Completados</span>
              <span className="font-semibold">{stats.completed}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Casos Rechazados</span>
              <span className="font-semibold text-red-600">{stats.rejected}</span>
            </div>
          </div>
          <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
            Ver Reportes
          </button>
        </div>

        {/* Configuración del Sistema */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Configuración del Sistema
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Ajustes generales y configuración avanzada
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Notificaciones</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Auditoría</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Backup Automático</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <button className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
            Configuración Avanzada
          </button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Esta es una vista de administración básica. Las funcionalidades
          completas de gestión de usuarios, configuración de workflow y reportes requieren
          implementación adicional según los requisitos específicos del negocio.
        </p>
      </div>
    </div>
  );
}
