export default function EstablecimientoDashboard() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6 min-w-0">
      <div className="border-b pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Panel de Establecimiento
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Bienvenido, aquí podrás gestionar tu establecimiento.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Mi Establecimiento</h2>
              <p className="text-sm text-gray-500">Gestionar información</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Personal</h2>
              <p className="text-sm text-gray-500">Gestionar empleados</p>
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
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Actividades</h2>
              <p className="text-sm text-gray-500">Revisar eventos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
