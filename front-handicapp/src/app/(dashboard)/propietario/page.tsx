export default function PropietarioDashboard() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6 min-w-0">
      <div className="border-b pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Panel de Propietario
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Bienvenido, aquí podrás ver el estado de tus caballos.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Mis Caballos</h2>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">3</p>
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
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Estado Saludable</h2>
              <p className="text-xl sm:text-2xl font-bold text-green-600">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">En Observación</h2>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Estado de Caballos</h3>
        <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
          {["Thunder", "Lightning", "Storm"].map((name, index) => (
            <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">Última revisión: Hoy</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                index === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {index === 2 ? 'Observación' : 'Saludable'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
