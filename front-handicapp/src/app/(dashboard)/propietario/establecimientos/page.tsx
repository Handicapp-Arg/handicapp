"use client";

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, TrendingUp } from 'lucide-react';
import { useStats } from '@/lib/hooks/useStats';
import { useEstablecimientos } from '@/lib/hooks/useEstablecimientosQuery';
import type { Establecimiento } from '@/lib/services/establecimientoService';
import { Loader } from '@/components/ui/loader';
import { EstablecimientoCard } from '@/components/establecimientos/EstablecimientoCard';
import { EstablecimientoMapView } from '@/components/dashboard/EstablecimientoMapView';

// Lazy load del componente de tabs (contiene el mapa pesado)
const EstablecimientoTabs = dynamic(
	() => import('@/components/dashboard/EstablecimientoTabs').then(mod => ({ default: mod.EstablecimientoTabs })),
	{
		loading: () => (
			<div className="w-full h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
				<Loader variant="section" />
			</div>
		), 
		ssr: false,
	}
);

export default function PropietarioEstablecimientosPage() {
	// Propietarios solo pueden VER establecimientos, no crear/editar
	const { stats, loading: statsLoading } = useStats();
	const { data: establecimientosResponse, isLoading: establecimientosLoading } = useEstablecimientos();
  
	// Extraer el array correctamente de la respuesta
	let establecimientos: Establecimiento[] = [];
  
	if (establecimientosResponse) {
		if (Array.isArray(establecimientosResponse)) {
			establecimientos = establecimientosResponse;
		} else if (typeof establecimientosResponse === 'object') {
			// Intentar extraer de diferentes estructuras posibles
			const resp = establecimientosResponse as Record<string, unknown>;
			const data = resp.data as Record<string, unknown> | Establecimiento[] | undefined;
      
			if (Array.isArray(data)) {
				establecimientos = data;
			} else if (data && typeof data === 'object') {
				establecimientos = (data.items as Establecimiento[]) || 
													(data.establecimientos as Establecimiento[]) || 
													[];
			} else {
				establecimientos = (resp.items as Establecimiento[]) || 
													(resp.establecimientos as Establecimiento[]) || 
													[];
			}
		}
	}

	// Calcular estadísticas útiles para PROPIETARIO
	// 1. Mis caballos - total de caballos alojados
	const totalCaballos = establecimientos.reduce((sum, est) => 
		sum + (est.mis_caballos?.length || 0), 0
	);
	// 2. Establecimientos - cantidad donde tengo caballos
	const establecimientosConCaballos = establecimientos.filter(
		est => est.mis_caballos && est.mis_caballos.length > 0
	).length;
	// 3. Distancia promedio - por ahora no tenemos coordenadas del usuario
	// Mostrar "-" hasta implementar geolocalización
	const distanciaPromedio = 0;
	// 4. Rating promedio de mis establecimientos
	const establecimientosConRating = establecimientos.filter(
		est => est.mis_caballos?.length && est.rating_promedio && Number(est.rating_promedio) > 0
	);
	const ratingPromedio = establecimientosConRating.length > 0
		? (establecimientosConRating.reduce((sum, est) => 
				sum + Number(est.rating_promedio || 0), 0
			) / establecimientosConRating.length).toFixed(1)
		: '0.0';

	// Mostrar loading mientras carga - ESPERAR AMBAS CONSULTAS
	const isLoading = statsLoading || establecimientosLoading;
  
	if (isLoading) {
		return (
			<SimpleRoleGuard roles={['propietario']}>
				<Loader />
			</SimpleRoleGuard>
		);
	}

	// SOLO mostrar mensaje si YA TERMINÓ de cargar Y no tiene caballos
	const hasCaballos = (stats.caballos?.total || 0) > 0;
  
	// Si NO tiene caballos PERO tiene establecimientos, mostrar los establecimientos de todas formas
	if (!hasCaballos && establecimientosConCaballos === 0) {
		return (
			<SimpleRoleGuard roles={['propietario']}>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center max-w-md px-6">
						<div className="mb-6 flex justify-center">
							<div className="p-4 bg-blue-50 rounded-full">
								<Building2 className="w-12 h-12 text-blue-600" />
							</div>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							No tienes caballos registrados
						</h2>
						<p className="text-gray-600 mb-6">
							Para ver establecimientos, primero debes registrar tu caballo en uno de ellos.
						</p>
						<Link
							href="/propietario/caballos"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
						>
							Registrar mi primer caballo
						</Link>
					</div>
				</div>
			</SimpleRoleGuard>
		);
	}

	   return (
		   <SimpleRoleGuard roles={['propietario']}>
			   <div className="flex flex-row gap-6">
				   <div className="w-1/2">
					   {establecimientosLoading ? (
						   <Loader variant="section" />
					   ) : (
						   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							   {establecimientos.length > 0 ? (
								   establecimientos.map(est => (
									   <EstablecimientoCard key={est.id} establecimiento={est} />
								   ))
							   ) : (
								   <span className="text-gray-400">No hay establecimientos disponibles</span>
							   )}
						   </div>
					   )}
				   </div>
				   <div className="w-1/2 min-h-[600px]">
					   <EstablecimientoMapView establecimientos={establecimientos} isLoading={establecimientosLoading} />
				   </div>
			   </div>
		   </SimpleRoleGuard>
	   );
}

