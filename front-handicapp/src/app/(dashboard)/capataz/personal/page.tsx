'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserCog, Shield, Search } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

interface PersonalMember {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: {
    id: number;
    nombre: string;
    clave: string;
  };
  estado_usuario: 'active' | 'inactive';
  fecha_creacion: string;
}

export default function CapatazPersonalPage() {
  const [personal, setPersonal] = useState<PersonalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const response: any = await ApiClient.makeRequest('/users', {
        method: 'GET'
      });
      
      if (response?.data?.users) {
        setPersonal(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = personal.length;
    const activos = personal.filter(p => p.estado_usuario === 'active').length;
    const roles = new Set(personal.map(p => p.rol.clave)).size;
    const nuevos = personal.filter(p => {
      const createdDate = new Date(p.fecha_creacion);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    return { total, activos, roles, nuevos };
  }, [personal]);

  const filteredPersonal = personal.filter(member => {
    const matchesSearch = 
      member.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || member.rol.clave === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleClave: string) => {
    const colorMap: Record<string, string> = {
      admin: 'bg-slate-100 text-slate-800',
      capataz: 'bg-orange-100 text-orange-800',
      empleado: 'bg-teal-100 text-teal-800',
      veterinario: 'bg-purple-100 text-purple-800',
      propietario: 'bg-blue-100 text-blue-800',
      establecimiento: 'bg-green-100 text-green-800'
    };
    return colorMap[roleClave] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="warning" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['capataz']}>
      <div className="space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 md:p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-amber-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Gestión de Personal</h1>
            </div>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg">
              Administra el equipo y personal del establecimiento
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Total */}
          <Card className="rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Total Personal</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.total}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  Registrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activos */}
          <Card className="rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Activos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.activos}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs px-1.5 sm:px-2 truncate">
                  {Math.round((stats.activos / (stats.total || 1)) * 100)}% del total
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Roles Diferentes</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.roles}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  <span className="hidden sm:inline">Tipos de usuario</span>
                  <span className="sm:hidden">Tipos</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Nuevos */}
          <Card className="rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Nuevos (30 días)</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.nuevos}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <UserCog className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  Este mes
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-xl sm:rounded-2xl shadow-xl">
          <CardHeader className="px-4 sm:px-6">
            <CardDescription className="text-xs sm:text-sm">
              Lista completa del personal del establecimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6">
            {/* Filters */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="capataz">Capataz</option>
                <option value="empleado">Empleado</option>
                <option value="veterinario">Veterinario</option>
                <option value="propietario">Propietario</option>
                <option value="establecimiento">Establecimiento</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-100 -mx-3 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPersonal.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {member.nombre} {member.apellido}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">{member.email}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">{member.telefono || 'N/A'}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <Badge className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${getRoleBadgeColor(member.rol.clave)}`}>
                          {member.rol.nombre}
                        </Badge>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <Badge
                          variant={member.estado_usuario === 'active' ? 'default' : 'secondary'}
                          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${member.estado_usuario === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'}`}
                        >
                          {member.estado_usuario === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPersonal.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron miembros del personal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
