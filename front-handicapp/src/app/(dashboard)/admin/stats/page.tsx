import { StatsCards } from '../components/StatsCards';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Estadísticas del Sistema</h1>
          <p className="text-gray-600 text-sm sm:text-base">Métricas, reportes y análisis de uso del sistema</p>
        </div>
        
        {/* Componente de estadísticas */}
        <StatsCards />
      </div>
    </div>
  );
}