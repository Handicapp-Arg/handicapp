'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { UserStatsConfig } from './types';

export function UserStatsCards({
  total,
  activos,
  metric3,
  nuevos,
  metric3Label,
  metric3Icon: Metric3Icon,
  primaryColor = '#059669'
}: UserStatsConfig) {
  
  const activosPercent = Math.round((activos / (total || 1)) * 100);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {/* Total */}
      <Card className="overflow-hidden rounded-lg border border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}1A` }}
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium truncate">
                Total
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {total}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activos */}
      <Card className="overflow-hidden rounded-lg border border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium truncate">
                Activos
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {activos}
              </p>
              <p className="text-[10px] text-green-600 font-medium mt-0.5">
                {activosPercent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métrica 3 (Departamentos o Roles) */}
      <Card className="overflow-hidden rounded-lg border border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Metric3Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium truncate">
                {metric3Label}
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {metric3}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nuevos */}
      <Card className="overflow-hidden rounded-lg border border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium truncate">
                Nuevos
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {nuevos}
              </p>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                30 días
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
