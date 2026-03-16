/**
 * DataTable — Tabla genérica reutilizable para HandicApp.
 *
 * Uso básico:
 *   <DataTable
 *     columns={[
 *       { key: 'nombre', header: 'Nombre' },
 *       { key: 'estado', header: 'Estado', render: (v) => <Badge>{v}</Badge> },
 *     ]}
 *     data={caballos}
 *     onRowClick={(row) => router.push(`/horses/${row.id}`)}
 *   />
 *
 * Con acciones:
 *   { key: '_actions', header: '', render: (_, row) => <RowActions row={row} /> }
 */

import React from 'react';

export interface Column<T> {
  /** Clave del objeto T a mostrar. Usa '_actions' para columnas de acción sin datos. */
  key: keyof T | '_actions';
  header: string;
  /** Render personalizado. Recibe el valor y la fila completa. */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Clases CSS adicionales para la celda */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Callback al hacer click en una fila. No aplica a columnas _actions. */
  onRowClick?: (row: T) => void;
  /** Estado vacío cuando no hay datos */
  emptyMessage?: string;
  /** Clave única para cada fila (default: 'id') */
  rowKey?: keyof T;
  isLoading?: boolean;
  skeletonRows?: number;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos',
  rowKey = 'id' as keyof T,
  isLoading = false,
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[rowKey])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-gray-100 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                {columns.map((col) => {
                  const value = col.key === '_actions' ? undefined : row[col.key as keyof T];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}
                      onClick={col.key === '_actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {col.render
                        ? col.render(value as T[keyof T], row)
                        : String(value ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
