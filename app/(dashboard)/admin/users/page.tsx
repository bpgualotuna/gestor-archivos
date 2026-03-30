import { UserManagement } from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra los usuarios del sistema</p>
      </div>
      <UserManagement />
    </div>
  );
}
