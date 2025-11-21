export interface BaseUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  estado: 'activo' | 'inactivo';
  rol?: string;
  puesto?: string;
  departamento?: string;
  createdAt?: Date | string;
}

export interface UserTableColumn {
  key: string;
  label: string;
  visible?: boolean;
  render?: (user: BaseUser) => React.ReactNode;
}

export interface UserTableProps {
  users: BaseUser[];
  loading?: boolean;
  onEdit?: (user: BaseUser) => void;
  onDelete?: (userId: number) => void;
  onToggleStatus?: (userId: number) => void;
  onView?: (userId: number) => void;
  showActions?: boolean;
  columns?: UserTableColumn[];
  emptyMessage?: string;
}
