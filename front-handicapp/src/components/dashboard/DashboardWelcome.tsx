'use client';

import { useState, useEffect } from 'react';

interface WelcomeCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  stats?: Array<{ label: string; value: string | number }>;
}

function WelcomeCard({ title, description, icon, stats }: WelcomeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
        {icon && (
          <div className="flex-shrink-0 self-center sm:self-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center sm:text-left">{title}</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 text-center sm:text-left">{description}</p>
          
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-amber-600">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardWelcome() {
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener rol del usuario
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const roleId = getCookie('role');
    if (roleId) {
      const roleMap: Record<string, string> = {
        '1': 'Administrador',
        '2': 'Establecimiento',
        '3': 'Capataz',
        '4': 'Veterinario',
        '5': 'Empleado',
        '6': 'Propietario'
      };
      setUserRole(roleMap[roleId] || 'Usuario');
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido a HandicApp! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Panel de control para {userRole} - Gestión integral de handicaps ecuestres
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <WelcomeCard
          title="Sistema Activo"
          description="El sistema está funcionando correctamente y listo para usar."
          icon={
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          stats={[
            { label: 'Estado', value: '✓ Activo' },
            { label: 'Rol', value: userRole }
          ]}
        />

        <WelcomeCard
          title="Navegación"
          description="Utiliza el menú lateral para acceder a todas las funciones disponibles."
          icon={
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          }
          stats={[
            { label: 'Menú', value: 'Lateral' },
            { label: 'Responsive', value: '✓' }
          ]}
        />

        <WelcomeCard
          title="Seguridad"
          description="Tu sesión está protegida y se renovará automáticamente."
          icon={
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          stats={[
            { label: 'Sesión', value: '2h' },
            { label: 'Seguridad', value: 'Alta' }
          ]}
        />
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0 self-center sm:self-start">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-2 text-center sm:text-left">
              Primeros pasos
            </h3>
            <ul className="text-sm sm:text-base text-amber-700 space-y-1 list-disc list-inside text-left">
              <li>Explora el menú lateral para ver todas las opciones disponibles</li>
              <li>Tu rol de {userRole} determina las funciones que puedes acceder</li>
              <li>Usa el botón de perfil (arriba a la derecha) para configurar tu cuenta</li>
              <li>El sistema se adapta automáticamente a dispositivos móviles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center py-4 sm:py-8 border-t border-gray-200">
        <p className="text-xs sm:text-sm text-gray-500">
          HandicApp v1.0 - Sistema de Gestión de Handicaps Ecuestres
          <br />
          <span className="text-xs">Desarrollado con ❤️ para la comunidad ecuestre</span>
        </p>
      </div>
    </div>
  );
}