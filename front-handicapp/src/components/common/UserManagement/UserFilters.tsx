'use client';

import type { UserFiltersProps } from './types';

export function UserFilters({
  config,
  filtroEstado,
  setFiltroEstado,
  filtroRol,
  setFiltroRol,
  filtroPuesto,
  setFiltroPuesto,
  filtroDepartamento,
  setFiltroDepartamento,
  onClearFilters,
  itemsPerPage,
  onItemsPerPageChange,
}: UserFiltersProps) {
  
  const hasActiveFilters = filtroEstado !== 'todos' || 
                          (filtroRol && filtroRol !== 'todos') || 
                          (filtroPuesto && filtroPuesto !== 'todos') ||
                          (filtroDepartamento && filtroDepartamento !== 'todos');

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Mostrar X registros a la izquierda */}
      {itemsPerPage !== undefined && onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>registros</span>
        </div>
      )}

      {/* Filtros a la derecha */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Filtro Estado */}
        {config.showEstadoFilter && (
          <div className="flex-1 sm:flex-none sm:w-48">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="invited">Invitados</option>
              <option value="suspended">Suspendidos</option>
              <option value="disabled">Deshabilitados</option>
              <option value="ausente">Ausentes</option>
            </select>
          </div>
        )}

        {/* Filtro Departamento/Áreas - Solo Establecimiento */}
        {config.showDepartamentoFilter && setFiltroDepartamento && (
          <div className="flex-1 sm:flex-none sm:w-48">
            <select
              value={filtroDepartamento || 'todos'}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="todos">Todas las áreas</option>
              {config.departamentos && config.departamentos.length === 0 && (
                <option disabled>Sin áreas definidas</option>
              )}
              {config.departamentos?.map((depto) => (
                <option key={depto} value={depto}>
                  {depto}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro Puesto - Solo Establecimiento */}
        {config.showPuestoFilter && setFiltroPuesto && (
          <div className="flex-1 sm:flex-none sm:w-48">
            <select
              value={filtroPuesto || 'todos'}
              onChange={(e) => setFiltroPuesto(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="todos">Todos los puestos</option>
              {config.puestos && config.puestos.length === 0 && (
                <option disabled>Sin puestos definidos</option>
              )}
              {config.puestos?.map((puesto) => (
                <option key={puesto} value={puesto}>
                  {puesto}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Rol - Solo Admin */}
        {config.showRolFilter && config.roles && setFiltroRol && (
          <div className="flex-1 sm:flex-none sm:w-48">
            <select
              value={filtroRol || 'todos'}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="todos">Todos los roles</option>
              {config.roles.map((rol) => (
                <option key={rol.id} value={rol.id.toString()}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Limpiar Filtros */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
