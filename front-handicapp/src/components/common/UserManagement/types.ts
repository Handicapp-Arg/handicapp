// ============================================================================
// UserManagement - Tipos compartidos
// ============================================================================

export interface BaseUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  estado: 'activo' | 'inactivo' | 'active' | 'disabled' | 'pending' | 'suspended' | 'invited' | 'deleted';
  rol?: string;
  puesto?: string;
  departamento?: string;
  ubicacion?: string;
  verificado?: boolean;
  rol_id?: number;
  establecimiento_id?: number;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface UserStatsConfig {
  total: number;
  activos: number;
  metric3: number;
  nuevos: number;
  metric3Label: string;
  metric3Icon: React.ComponentType<{ className?: string }>;
  metric3Badge: string;
  primaryColor?: string;
}

export interface FilterConfig {
  showEstadoFilter?: boolean;
  showRolFilter?: boolean;
  showPuestoFilter?: boolean;
  showDepartamentoFilter?: boolean;
  roles?: Array<{ id: number; nombre: string }>;
  puestos?: string[];
  departamentos?: string[];
}

export interface ActionConfig {
  showView?: boolean;
  showEdit?: boolean;
  showToggleStatus?: boolean;
  showDelete?: boolean;
  viewLabel?: string;
  editLabel?: string;
  toggleLabel?: string;
  deleteLabel?: string;
}

export interface UserManagementTableProps {
  users: BaseUser[];
  loading?: boolean;
  emptyMessage?: string;
  actions: ActionConfig;
  onView?: (userId: number) => void;
  onEdit?: (user: BaseUser) => void;
  onToggleStatus?: (userId: number) => void;
  onDelete?: (userId: number) => void;
  primaryColor?: string;
  pagination?: PaginationConfig;
  showVerificado?: boolean;
  showUbicacion?: boolean;
}

export interface UserFiltersProps {
  config: FilterConfig;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
  filtroRol?: string;
  setFiltroRol?: (value: string) => void;
  filtroPuesto?: string;
  setFiltroPuesto?: (value: string) => void;
  filtroDepartamento?: string;
  setFiltroDepartamento?: (value: string) => void;
  onClearFilters?: () => void;
}

export interface UserManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  createButtonLabel?: string;
  searchPlaceholder?: string;
  primaryColor?: string;
}
