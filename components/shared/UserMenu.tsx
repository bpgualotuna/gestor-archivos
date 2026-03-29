'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

const roleLabels: Record<string, string> = {
  USER: 'Usuario',
  ADMIN: 'Administrador',
  COMERCIAL: 'Comercial',
  TECNICA: 'Técnica',
  FINANCIERA: 'Financiera',
  LEGAL: 'Legal',
};

export function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <User className="w-4 h-4" />
        <div className="text-left">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{roleLabels[user.role] || user.role}</div>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
