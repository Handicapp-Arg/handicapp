import React from 'react';

/**
 * Skeleton para páginas de perfil de usuario.
 * Replica: hero section + KPI cards + form de cambio de contraseña.
 */
export default function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero */}
      <div className="rounded-3xl bg-slate-800/60 p-8 h-32">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700/60 rounded-lg" />
          <div className="space-y-2">
            <div className="h-7 bg-slate-700/60 rounded w-32" />
            <div className="h-4 bg-slate-700/40 rounded w-64" />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 h-28">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-slate-600/50 rounded w-16" />
                <div className="h-6 bg-slate-600/70 rounded w-24 mt-2" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-600/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Password form card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-slate-200 rounded" />
          <div className="space-y-1">
            <div className="h-5 bg-slate-200 rounded w-40" />
            <div className="h-3.5 bg-slate-100 rounded w-56" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 bg-slate-200 rounded w-32" />
            <div className="h-10 bg-slate-100 rounded-lg w-full" />
          </div>
        ))}
        <div className="h-12 bg-slate-200 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}
