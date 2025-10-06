"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { caballoService, type Caballo } from '@/lib/services/caballoService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CaballoList() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCaballos = async () => {
      try {
        setLoading(true);
        const response = await caballoService.getAll();
        setCaballos(response.data || response);
      } catch (error) {
        console.error('Error loading caballos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaballos();
  }, []);

  const filteredCaballos = caballos.filter(caballo =>
    caballo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (caballo.raza && caballo.raza.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex justify-center p-8">Cargando caballos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Caballos</h2>
      </div>
      
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre o raza..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredCaballos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron caballos
          </div>
        ) : (
          filteredCaballos.map((caballo) => (
            <div key={caballo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{caballo.nombre}</h3>
                  {caballo.raza && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Raza:</span> {caballo.raza}
                    </p>
                  )}
                  {caballo.fecha_nacimiento && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nacimiento:</span> {new Date(caballo.fecha_nacimiento).toLocaleDateString()}
                    </p>
                  )}
                  {caballo.sexo && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Sexo:</span> {caballo.sexo}
                    </p>
                  )}
                  {caballo.color && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Color:</span> {caballo.color}
                    </p>
                  )}
                  {caballo.numero_microchip && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Microchip:</span> {caballo.numero_microchip}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}