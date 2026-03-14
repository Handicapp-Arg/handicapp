import React from 'react';

/**
 * Skeleton para dashboards — replica el layout de hero + KPI grid + widgets.
 * Usar mientras se cargan los datos del dashboard de cualquier rol.
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-800/60 p-8 h-36">
        <div className="space-y-3">
          <div className="h-8 bg-slate-700/60 rounded-lg w-64" />
          <div className="h-5 bg-slate-700/40 rounded w-96" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 h-32"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-slate-600/50 rounded w-20" />
                <div className="h-8 bg-slate-600/70 rounded w-12 mt-2" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-600/50" />
            </div>
            <div className="mt-4">
              <div className="h-5 bg-slate-600/40 rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content — two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wide widget */}
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 h-64">
          <div className="space-y-4">
            <div className="h-5 bg-slate-600/60 rounded w-40" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-600/50 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-600/50 rounded w-3/4" />
                  <div className="h-3 bg-slate-600/30 rounded w-1/2" />
                </div>
                <div className="h-5 bg-slate-600/40 rounded-full w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Narrow widget */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 h-64">
          <div className="space-y-4">
            <div className="h-5 bg-slate-600/60 rounded w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-600/60 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 bg-slate-600/50 rounded" />
                  <div className="h-3 bg-slate-600/30 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
