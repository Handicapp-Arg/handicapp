export default function EmpleadoDashboard() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6 min-w-0">
      <div className="border-b pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Panel de Empleado
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Bienvenido, aquí podrás ver tus tareas asignadas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Mis Tareas</h2>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Completadas</h2>
              <p className="text-xl sm:text-2xl font-bold text-green-600">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Tareas Pendientes</h3>
        <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Tarea {item}</p>
                <p className="text-xs text-gray-500">Asignada hace 2 horas</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                Pendiente
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
