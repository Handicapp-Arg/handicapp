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
			<div>
				{/* Hero Section con Stats Integrados */}
				<div className="relative overflow-hidden mb-8 rounded-2xl">
					{/* Background oscuro */}
					<div className="absolute inset-0 bg-[#0f172a]"></div>
					{/* Grid pattern */}
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
					{/* Gradient orbs - Slate para admin */}
					<div className="absolute top-0 right-1/4 w-64 h-64 bg-slate-600/30 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gray-500/20 rounded-full blur-3xl"></div>
					{/* Content */}
					<div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
						{/* Header */}
						<div className="mb-6">
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
									Mis Establecimientos
								</h1>
								<p className="text-sm sm:text-base text-white/70">
									Establecimientos donde tienes caballos registrados
								</p>
							</div>
						</div>
						{/* Stats Grid */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
							{/* Stat 1 - Mis Caballos */}
							<Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardDescription className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
											Mis Caballos
										</CardDescription>
										<div className="p-1.5 rounded-lg bg-blue-500/20">
											<Building2 className="w-3 h-3 text-slate-300" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<p className="text-2xl font-bold text-white tabular-nums">{totalCaballos}</p>
									<Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
										Alojados
									</Badge>
								</CardContent>
							</Card>
							{/* Stat 2 - Establecimientos */}
							<Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardDescription className="text-[10px] font-semibold text-green-300 uppercase tracking-wider">
											Establecimientos
										</CardDescription>
										<div className="p-1.5 rounded-lg bg-green-500/20">
											<MapPin className="w-3 h-3 text-green-300" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<p className="text-2xl font-bold text-white tabular-nums">{establecimientosConCaballos}</p>
									<Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
										{establecimientosConCaballos === 1 ? 'Activo' : 'Activos'}
									</Badge>
								</CardContent>
							</Card>
							{/* Stat 3 - Distancia Promedio */}
							<Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardDescription className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
											Distancia Prom.
										</CardDescription>
										<div className="p-1.5 rounded-lg bg-blue-500/20">
											<MapPin className="w-3 h-3 text-blue-300" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<p className="text-2xl font-bold text-white tabular-nums">
										{distanciaPromedio > 0 ? `${distanciaPromedio} km` : '-'}
									</p>
									<Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
										A tus lugares
									</Badge>
								</CardContent>
							</Card>
							{/* Stat 4 - Rating Promedio */}
							<Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardDescription className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
											Rating Prom.
										</CardDescription>
										<div className="p-1.5 rounded-lg bg-amber-500/20">
											<TrendingUp className="w-3 h-3 text-amber-300" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<p className="text-2xl font-bold text-white tabular-nums">
										{Number(ratingPromedio) > 0 ? `${ratingPromedio}★` : '-'}
									</p>
									<Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
										Calidad
									</Badge>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				{/* List Component con Tabs integrados */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
					<EstablecimientoTabs establecimientos={establecimientos} isLoading={establecimientosLoading} />
				</div>
			</div>
		</SimpleRoleGuard>
	);
}

