"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import QrCanvas from "@/components/common/QrCanvas";

function InfoCard({ label, value, icon, className = "" }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-base font-semibold text-slate-900 truncate">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface CaballoFichaProps {
  caballo: Caballo;
  origin: string;
  pedigree?: CaballoPedigree | null;
}

export default function CaballoFicha({ caballo, origin, pedigree }: CaballoFichaProps) {
  const [imgError, setImgError] = useState(false);
  
  const calcularEdad = (fechaNacimiento: string | null): string => {
    if (!fechaNacimiento) return "—";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) edad -= 1;
    return edad === 1 ? `${edad} año` : `${edad} años`;
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) {
      return `${url}?t=${Date.now()}`;
    }
    return `${url}?t=${Date.now()}`;
  };

  const edad = calcularEdad(caballo.fecha_nacimiento);

  return (
    <div className="space-y-6">
      {/* Hero Section - Imagen + Info Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Imagen */}
          <div className="relative h-80 lg:h-96 bg-gradient-to-br from-slate-100 to-slate-50">
            {caballo.foto_url && !imgError ? (
              <Image 
                src={getImageUrl(caballo.foto_url) || caballo.foto_url} 
                alt={caballo.nombre} 
                fill
                className="object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-300" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17l4-4 3 3 5-5 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-400">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Info Principal */}
          <div className="p-6 lg:p-8 flex flex-col justify-between">
            {/* Header con badges */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    caballo.estado_global === "activo" 
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" 
                      : caballo.estado_global === "inactivo" 
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" 
                      : caballo.estado_global === "vendido" 
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" 
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                      caballo.estado_global === "activo" ? "bg-emerald-500" :
                      caballo.estado_global === "inactivo" ? "bg-amber-500" :
                      caballo.estado_global === "vendido" ? "bg-blue-500" :
                      "bg-slate-500"
                    }`}></span>
                    {caballo.estado_global ? caballo.estado_global.toUpperCase() : "SIN ESTADO"}
                  </span>
                </div>
                {edad !== "—" && (
                  <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium text-sm whitespace-nowrap">
                    {edad}
                  </span>
                )}
              </div>

              {/* Grid de info rápida */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{caballo.sexo === "macho" ? "Macho" : caballo.sexo === "hembra" ? "Hembra" : "—"}</span>
                </div>

                {caballo.raza && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">{caballo.raza}</span>
                  </div>
                )}

                {caballo.pelaje && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="font-medium">{caballo.pelaje}</span>
                  </div>
                )}

                {caballo.disciplina && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-medium capitalize">{caballo.disciplina}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Microchip destacado */}
            {caballo.microchip && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Microchip</p>
                      <p className="text-base font-mono font-bold text-slate-900 truncate">{caballo.microchip}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(caballo.microchip || '')}
                    className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    title="Copiar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información detallada en cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Info Básica */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Generales */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard 
                label="Fecha Nacimiento" 
                value={caballo.fecha_nacimiento ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "—"} 
              />
              <InfoCard 
                label="ID Sistema" 
                value={`#${caballo.id}`} 
              />
              {caballo.altura && (
                <InfoCard 
                  label="Altura" 
                  value={`${caballo.altura} cm`} 
                />
              )}
              {caballo.peso && (
                <InfoCard 
                  label="Peso" 
                  value={`${caballo.peso} kg`} 
                />
              )}
            </div>
          </div>

          {/* Documentación Oficial */}
          {(caballo.rp || caballo.sba || caballo.adn || caballo.pasaporte || caballo.numero_fei || caballo.ueln) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentación Oficial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caballo.rp && <InfoCard label="RP (Registro Pedigree)" value={caballo.rp} />}
                {caballo.sba && <InfoCard label="SBA (Stud Book)" value={caballo.sba} />}
                {caballo.adn && <InfoCard label="ADN (Verificación)" value={caballo.adn} />}
                {caballo.pasaporte && <InfoCard label="Pasaporte Equino" value={caballo.pasaporte} />}
                {caballo.numero_fei && <InfoCard label="N° FEI" value={caballo.numero_fei} />}
                {caballo.ueln && <InfoCard label="UELN (ID Universal)" value={caballo.ueln} />}
              </div>
            </div>
          )}
        </div>

        {/* Columna 2: QR */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Código QR
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <QrCanvas 
                  value={origin ? `${origin}/public/caballos/${caballo.id}` : `https://handicapp.com/caballos/${caballo.id}`}
                  label=""
                  size={160} 
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-4">
              Escanea este código para acceder al perfil público
            </p>
          </div>
        </div>
      </div>

      {/* Pedigree */}
      {pedigree && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Árbol Genealógico
            </h3>
          </div>
          
          <div className="p-8 bg-slate-50">
            <div className="overflow-x-auto">
              <div className="inline-flex items-center gap-6 min-w-max">
                {/* Caballo */}
                <PedigreeNode nombre={caballo.nombre} nivel="principal" />
                
                {/* Línea */}
                <div className="w-8 h-px bg-slate-300"></div>

                {/* Padres */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <PedigreeNode nombre={pedigree.padre?.nombre || "Desconocido"} nivel="padre" sexo="M" />
                    <div className="w-6 h-px bg-slate-300"></div>
                    <div className="space-y-3">
                      <PedigreeNode nombre={pedigree.abueloPaterno?.nombre || "Desconocido"} nivel="abuelo" sexo="M" />
                      <PedigreeNode nombre={pedigree.abuelaPaterna?.nombre || "Desconocido"} nivel="abuelo" sexo="H" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <PedigreeNode nombre={pedigree.madre?.nombre || "Desconocido"} nivel="madre" sexo="H" />
                    <div className="w-6 h-px bg-slate-300"></div>
                    <div className="space-y-3">
                      <PedigreeNode nombre={pedigree.abueloMaterno?.nombre || "Desconocido"} nivel="abuelo" sexo="M" />
                      <PedigreeNode nombre={pedigree.abuelaMaterna?.nombre || "Desconocido"} nivel="abuelo" sexo="H" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PedigreeNode({ 
  nombre, 
  nivel,
  sexo
}: { 
  nombre: string; 
  nivel: "principal" | "padre" | "madre" | "abuelo";
  sexo?: "M" | "H";
}) {
  const esDesconocido = nombre === "Desconocido";
  
  const sizeClasses = {
    principal: "px-6 py-3 min-w-[180px]",
    padre: "px-5 py-2.5 min-w-[160px]",
    madre: "px-5 py-2.5 min-w-[160px]",
    abuelo: "px-4 py-2 min-w-[140px]"
  };

  const colorClasses = nivel === "principal"
    ? "bg-slate-900 text-white border-2 border-slate-700 shadow-lg"
    : esDesconocido
    ? "bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300"
    : sexo === "M"
    ? "bg-white text-blue-900 border-2 border-blue-200 hover:shadow-md hover:border-blue-300"
    : "bg-white text-pink-900 border-2 border-pink-200 hover:shadow-md hover:border-pink-300";

  return (
    <div className={`${sizeClasses[nivel]} ${colorClasses} rounded-lg transition-all duration-200 ${!esDesconocido && 'cursor-pointer'}`}>
      <div className="flex items-center gap-2">
        {sexo && !esDesconocido && (
          <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            sexo === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
          }`}>
            {sexo}
          </span>
        )}
        <p className={`font-bold truncate ${nivel === "principal" ? "text-base" : "text-sm"}`}>
          {nombre}
        </p>
      </div>
    </div>
  );
}
