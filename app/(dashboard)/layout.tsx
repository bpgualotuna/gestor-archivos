'use client';

import Link from 'next/link';
import { Home, FolderOpen, CheckSquare, Settings, Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Users, Workflow, LayoutDashboard } from 'lucide-react';
import { UserMenu } from '@/components/shared/UserMenu';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(true);
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const userRole = session?.user?.role || 'USER';
  const isAdmin = userRole === 'ADMIN';
  const canReview = ['ADMIN', 'COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL'].includes(userRole);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Sistema de Gestión
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-16 bottom-0 left-0 z-40
            bg-white shadow-sm border-r border-gray-200
            transform transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <div className="flex flex-col h-full">
            {/* Collapse button - Desktop only */}
            <div className="hidden lg:flex justify-end p-2 border-b border-gray-200">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {!isAdmin && (
                <>
                  <Link
                    href="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                    title="Dashboard"
                  >
                    <Home className="w-5 h-5 flex-shrink-0" />
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-opacity`}>
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    href="/cases"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                    title="Casos"
                  >
                    <FolderOpen className="w-5 h-5 flex-shrink-0" />
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-opacity`}>
                      Casos
                    </span>
                  </Link>
                </>
              )}

              {canReview && !isAdmin && (
                <Link
                  href="/review"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                  title="Revisar"
                >
                  <CheckSquare className="w-5 h-5 flex-shrink-0" />
                  <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-opacity`}>
                    Revisar
                  </span>
                </Link>
              )}

              {isAdmin && (
                <div className="space-y-1">
                  {/* Administración - Sección expandible */}
                  <button
                    onClick={() => setAdminExpanded(!adminExpanded)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                    title="Administración"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-opacity font-medium`}>
                        Administración
                      </span>
                    </div>
                    {!sidebarCollapsed && (
                      <span className="lg:block hidden">
                        {adminExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Submenú de Administración */}
                  {adminExpanded && !sidebarCollapsed && (
                    <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-1">
                      <Link
                        href="/admin"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          pathname === '/admin'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                        <span>General</span>
                      </Link>

                      <Link
                        href="/admin/users"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          pathname === '/admin/users'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>Gestión de Usuarios</span>
                      </Link>

                      <Link
                        href="/admin/workflows"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          pathname === '/admin/workflows'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Workflow className="w-4 h-4 flex-shrink-0" />
                        <span>Configuración de Workflows</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className={`
            flex-1 p-4 sm:p-6 lg:p-8 w-full
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          `}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
