export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h1>
          <p className="text-gray-600 text-sm sm:text-base">Configuraciones generales, parámetros y ajustes del sistema</p>
        </div>

        {/* Estadísticas del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado del Sistema</p>
                <p className="text-2xl font-bold text-green-600">Operativo</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Uptime: 99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Base de Datos</p>
                <p className="text-2xl font-bold text-blue-600">Conectada</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗄️</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Versión</p>
                <p className="text-2xl font-bold text-purple-600">1.0.0</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>HandicApp</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Seguridad</p>
                <p className="text-2xl font-bold text-green-600">Activa</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Rate limiting ON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuraciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">⚙️</span>
              Configuración General
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Nombre del Sistema</span>
                <span className="text-gray-900 font-medium">HandicApp</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Versión</span>
                <span className="text-gray-900 font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Base de Datos</span>
                <span className="text-green-600 font-medium">✓ Conectada</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">🔒</span>
              Configuración de Seguridad
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Expiración de Token</span>
                <span className="text-gray-900 font-medium">2 horas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Rate Limiting</span>
                <span className="text-green-600 font-medium">✓ Habilitado</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">HTTPS</span>
                <span className="text-amber-600 font-medium">⚠ Desarrollo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Herramientas de Mantenimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">🛠️</span>
              Herramientas de Mantenimiento
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                <span className="mr-2">💾</span>
                Generar Backup
              </button>
              <button className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center">
                <span className="mr-2">🧹</span>
                Limpiar Cache
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center">
                <span className="mr-2">📋</span>
                Ver Logs
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              Información del Sistema
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-700 block">Servidor:</span>
                <span className="text-gray-900">Node.js + TypeScript</span>
              </div>
              <div>
                <span className="text-gray-700 block">Frontend:</span>
                <span className="text-gray-900">Next.js + React</span>
              </div>
              <div>
                <span className="text-gray-700 block">Base de Datos:</span>
                <span className="text-gray-900">PostgreSQL</span>
              </div>
              <div>
                <span className="text-gray-700 block">Estado:</span>
                <span className="text-green-600">✓ Operativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advertencia de Configuraciones Avanzadas */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Configuraciones Avanzadas
              </h3>
              <p className="text-amber-700">
                Las configuraciones avanzadas están disponibles solo para super administradores. 
                Para cambios críticos del sistema, contacta al equipo de desarrollo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}