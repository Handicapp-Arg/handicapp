import { LoadingSpinnerCard } from '@/components/ui/loading-spinner';

// Loading Skeletons para lazy loading components
export function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <LoadingSpinnerCard 
        label="Cargando mapa..." 
      />
    </div>
  );
}

export function ChartLoadingSkeleton() {
  return (
    <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse p-6">
      <div className="h-full flex flex-col justify-between">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="flex-1 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div 
                className="h-6 bg-blue-200 dark:bg-blue-900 rounded" 
                style={{ width: `${Math.random() * 60 + 20}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 animate-pulse">
          {[...Array(4)].map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-slate-100 dark:bg-slate-800 rounded"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
