'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserCog, Shield, Search } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['capataz']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-orange-400" />
              <h1 className="text-3xl font-bold text-white">Gestión de Personal</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Administra el equipo y personal del establecimiento
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Personal</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Registrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Activos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {Math.round((stats.activos / (stats.total || 1)) * 100)}% del total
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Roles Diferentes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.roles}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Tipos de usuario
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Nuevos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Nuevos (30 días)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.nuevos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Este mes
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardDescription>
              Lista completa del personal del establecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPersonal.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.nombre} {member.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.telefono || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(member.rol.clave)}>
                          {member.rol.nombre}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={member.estado_usuario === 'active' ? 'default' : 'secondary'}
                          className={member.estado_usuario === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'}
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
