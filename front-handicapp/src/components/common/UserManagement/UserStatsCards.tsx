'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserStatsConfig } from './types';

export function UserStatsCards({
  total,
  activos,
  metric3,
  nuevos,
  metric3Label,
  metric3Icon: Metric3Icon,
  metric3Badge,
  primaryColor = '#059669'
}: UserStatsConfig) {
  
  const activosPercent = Math.round((activos / (total || 1)) * 100);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {/* Total */}
      <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">
                Total Personal
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                {total}
              </p>
            </div>
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
              style={{ backgroundColor: `${primaryColor}1A` }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4">
            <Badge 
              variant="secondary" 
              className="text-[10px] sm:text-xs px-1.5 sm:px-2"
              style={{ 
                backgroundColor: `${primaryColor}0D`,
                color: primaryColor,
                borderColor: `${primaryColor}33`
              }}
            >
              Registrados
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Activos */}
      <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">
                Activos
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                {activos}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4">
            <Badge 
              variant="secondary" 
              className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs px-1.5 sm:px-2 truncate"
            >
              {activosPercent}% del total
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Métrica 3 (Departamentos o Roles) */}
      <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">
                {metric3Label}
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                {metric3}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 ml-2">
              <Metric3Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4">
            <Badge 
              variant="secondary" 
              className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs px-1.5 sm:px-2"
            >
              {metric3Badge}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Nuevos */}
      <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">
                Nuevos Este Mes
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                {nuevos}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4">
            <Badge 
              variant="secondary" 
              className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2"
            >
              <span className="hidden sm:inline">Últimos 30 días</span>
              <span className="sm:hidden">30 días</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
