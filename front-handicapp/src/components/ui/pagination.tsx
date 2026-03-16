/**
 * Pagination — Componente de paginación reutilizable.
 *
 * Uso:
 *   <Pagination
 *     currentPage={currentPage}
 *     totalPages={totalPages}
 *     onChange={setCurrentPage}
 *   />
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onChange, isLoading, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 mt-8 ${className ?? ''}`}>
      <button
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      <span className="text-sm text-gray-500">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
