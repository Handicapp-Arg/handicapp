'use client';

import React, { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ApiClient from '@/lib/services/apiClient';

type TabType = 'perfil' | 'seguridad' | 'notificaciones' | 'establecimiento';

interface ConfiguracionLayoutProps {
  role: string;
  availableTabs: TabType[];
  title?: string;
  description?: string;
  hasEstablecimiento?: boolean;
}

export function ConfiguracionLayout({
  title = 'Configuración',
  hasEstablecimiento = false,
}: ConfiguracionLayoutProps) {
  const { user, refreshUser } = useAuthNew();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [perfil, setPerfil] = useState({ nombre: '', apellido: '', telefono: '', email: '' });
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  const [establecimiento, setEstablecimiento] = useState<any>(null);
  const [estForm, setEstForm] = useState<any>({
    nombre: '', cuit: '', direccion_calle: '', direccion_numero: '',
    direccion_complemento: '', codigo_postal: '', ciudad: '', provincia: '',
    pais: 'Argentina', latitud: undefined, longitud: undefined,
    descripcion: '', cantidad_boxes: '', telefono: '', email: '',
    superficie_hectareas: '', tipo_establecimiento: 'mixto', estado: 'activo', disciplina_principal: '',
  });

  useEffect(() => {
    if (user) {
      setPerfil({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!hasEstablecimiento) return;
    const id = user?.establecimiento_id || user?.id;
    if (!id) return;
    ApiClient.makeRequest<any>(`/establecimientos/${id}`, { method: 'GET' })
      .then((res) => {
        const data = (res as any).data || res;
        setEstablecimiento(data);
        setEstForm({
          nombre: data.nombre || '', cuit: data.cuit || '',
          direccion_calle: data.direccion_calle || '', direccion_numero: data.direccion_numero || '',
          direccion_complemento: data.direccion_complemento || '', codigo_postal: data.codigo_postal || '',
          ciudad: data.ciudad || '', provincia: data.provincia || '',
          pais: data.pais || 'Argentina', latitud: data.latitud, longitud: data.longitud,
          descripcion: data.descripcion || '', cantidad_boxes: data.cantidad_boxes?.toString() || '',
          telefono: data.telefono || '', email: data.email || '',
          superficie_hectareas: data.superficie_hectareas?.toString() || '',
          tipo_establecimiento: data.tipo_establecimiento || 'mixto',
          estado: data.estado || 'activo', disciplina_principal: data.disciplina_principal || '',
        });
      })
      .catch(() => {});
  }, [hasEstablecimiento, user?.establecimiento_id, user?.id]);

  const notify = (type: 'success' | 'error', text: string) => setMessage({ type, text });

  const handlePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await ApiClient.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ nombre: perfil.nombre, apellido: perfil.apellido, telefono: perfil.telefono }),
      });
      await refreshUser();
      notify('success', 'Perfil actualizado');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.next !== password.confirm) return notify('error', 'Las contraseñas no coinciden');
    if (password.next.length < 8) return notify('error', 'Mínimo 8 caracteres');
    setLoading(true);
    setMessage(null);
    try {
      await ApiClient.makeRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.next }),
      });
      setPassword({ current: '', next: '', confirm: '' });
      notify('success', 'Contraseña actualizada');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablecimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establecimiento?.id) return notify('error', 'No se identificó el establecimiento');
    setLoading(true);
    setMessage(null);
    try {
      await ApiClient.makeRequest(`/establecimientos/${establecimiento.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...estForm,
          cantidad_boxes: estForm.cantidad_boxes ? parseInt(estForm.cantidad_boxes) : null,
          superficie_hectareas: estForm.superficie_hectareas ? parseFloat(estForm.superficie_hectareas) : null,
        }),
      });
      notify('success', 'Establecimiento actualizado');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal y seguridad</p>
      </div>

      {/* Mensaje */}
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      {/* Perfil y Seguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Perfil */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Perfil</h2>
          <form onSubmit={handlePerfil} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" value={perfil.apellido} onChange={e => setPerfil({ ...perfil, apellido: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={perfil.email} disabled className="opacity-60" />
                <p className="text-xs text-gray-400">No se puede modificar</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" type="tel" value={perfil.telefono} onChange={e => setPerfil({ ...perfil, telefono: e.target.value })} placeholder="+54 11 1234-5678" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-700 text-white">
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </div>

        {/* Seguridad */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Seguridad</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="current">Contraseña actual</Label>
              <Input id="current" type="password" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="next">Nueva contraseña</Label>
              <Input id="next" type="password" value={password.next} onChange={e => setPassword({ ...password, next: e.target.value })} required minLength={8} />
              <p className="text-xs text-gray-400">Mínimo 8 caracteres</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <Input id="confirm" type="password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading || !password.current || !password.next || !password.confirm} className="bg-gray-900 hover:bg-gray-700 text-white">
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </div>
      </div>

      {/* Establecimiento (solo si aplica) */}
      {hasEstablecimiento && establecimiento && (
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Establecimiento</h2>
          <form onSubmit={handleEstablecimiento} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="est_nombre">Nombre</Label>
                <Input id="est_nombre" value={estForm.nombre} onChange={e => setEstForm({ ...estForm, nombre: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_cuit">CUIT</Label>
                <Input id="est_cuit" value={estForm.cuit} onChange={e => setEstForm({ ...estForm, cuit: e.target.value })} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="est_calle">Calle</Label>
                <Input id="est_calle" value={estForm.direccion_calle} onChange={e => setEstForm({ ...estForm, direccion_calle: e.target.value })} placeholder="Av. Libertador" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_numero">Número</Label>
                <Input id="est_numero" value={estForm.direccion_numero} onChange={e => setEstForm({ ...estForm, direccion_numero: e.target.value })} placeholder="1234" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_complemento">Complemento</Label>
                <Input id="est_complemento" value={estForm.direccion_complemento} onChange={e => setEstForm({ ...estForm, direccion_complemento: e.target.value })} placeholder="Depto, piso, etc." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_cp">Código postal</Label>
                <Input id="est_cp" value={estForm.codigo_postal} onChange={e => setEstForm({ ...estForm, codigo_postal: e.target.value })} placeholder="B1640" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_ciudad">Ciudad</Label>
                <Input id="est_ciudad" value={estForm.ciudad} onChange={e => setEstForm({ ...estForm, ciudad: e.target.value })} placeholder="Buenos Aires" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_provincia">Provincia</Label>
                <Input id="est_provincia" value={estForm.provincia} onChange={e => setEstForm({ ...estForm, provincia: e.target.value })} placeholder="Buenos Aires" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_pais">País</Label>
                <Input id="est_pais" value={estForm.pais} onChange={e => setEstForm({ ...estForm, pais: e.target.value })} placeholder="Argentina" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_telefono">Teléfono</Label>
                <Input id="est_telefono" value={estForm.telefono} onChange={e => setEstForm({ ...estForm, telefono: e.target.value })} placeholder="+54 11 1234-5678" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="est_email">Email</Label>
                <Input id="est_email" type="email" value={estForm.email} onChange={e => setEstForm({ ...estForm, email: e.target.value })} placeholder="contacto@establecimiento.com" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-700 text-white">
              {loading ? 'Guardando...' : 'Guardar establecimiento'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
