import { UserManagement } from '../components/UserManagement';

export default function UsersPage() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-w-0">
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
}