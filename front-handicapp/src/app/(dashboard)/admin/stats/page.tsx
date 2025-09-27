import { StatsCards } from '../components/StatsCards';

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Métricas, reportes y análisis de uso del sistema
        </p>
      </div>
      
      <StatsCards />
    </div>
  );
}