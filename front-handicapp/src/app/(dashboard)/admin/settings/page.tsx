export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Configuraciones generales, parámetros y ajustes del sistema
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h2>
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

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h2>
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

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mantenimiento</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Generar Backup
            </button>
            <button className="w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
              Limpiar Cache
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Ver Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
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
  );
}