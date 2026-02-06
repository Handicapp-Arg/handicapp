
"use client";

import React from "react";
import Image from "next/image";
import { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import QrCanvas from "@/components/common/QrCanvas";

function InfoField({ label, value, monospace = false, icon }: { label: string; value: string; monospace?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="group relative bg-white rounded-xl border-2 border-slate-200/60 hover:border-[#af936f]/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#af936f]/0 to-blue-500/0 group-hover:from-[#af936f]/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
      
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
          {icon && <div className="text-[#af936f] opacity-40 group-hover:opacity-70 transition-opacity">{icon}</div>}
        </div>
        <div className={`text-lg font-bold text-[#0f172a] ${monospace ? "font-mono" : ""}`}>{value}</div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-[#af936f]/0 via-[#af936f]/50 to-[#af936f]/0 group-hover:via-[#af936f] transition-all duration-300"></div>
    </div>
  );
}

interface CaballoFichaProps {
  caballo: Caballo;
  origin: string;
  pedigree?: CaballoPedigree | null;
}

export default function CaballoFicha({ caballo, origin, pedigree }: CaballoFichaProps) {
  const calcularEdad = (fechaNacimiento: string | null): string => {
    if (!fechaNacimiento) return "—";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) edad -= 1;   
    return `${edad} años`;
  };

  // Función para obtener la URL de la imagen con cache-busting
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    // Si la URL ya incluye el dominio del backend, usarla directamente
    if (url.startsWith('http')) {
      return `${url}?t=${Date.now()}`;
    }
    // Si es una ruta relativa, agregarla
    return `${url}?t=${Date.now()}`;
  };

  if (!caballo) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl shadow-xl border border-slate-200/50 p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-[#0f172a] mb-2">No se encontró información del caballo</p>
          <p className="text-sm text-slate-600">Por favor, verifica que el ID sea correcto</p>
        </div>
      </div>
    );
  }

  return (
    <div id="ficha-caballo" className="space-y-6 print:bg-white">
      {/* Sección principal con imagen e información */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-2xl border-2 border-slate-200/80">
        {/* Header decorativo */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-[#af936f] to-purple-600"></div>
        
        <div className="relative p-8 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Imagen y QR */}
            <div className="space-y-6">
              {/* Imagen del caballo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-[#af936f] to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
                <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  {caballo.foto_url ? (
                    <Image
                      src={getImageUrl(caballo.foto_url) || caballo.foto_url}
                      alt={caballo.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
                      <div className="text-center text-slate-400">
                        <svg className="w-24 h-24 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-semibold">Sin imagen disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="relative group bg-gradient-to-br from-slate-800 via-[#0f172a] to-slate-900 p-6 rounded-2xl border-2 border-[#af936f]/30 hover:border-[#af936f]/60 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#af936f]/0 to-blue-500/0 group-hover:from-[#af936f]/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-300"></div>
                <div className="relative">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <svg className="w-5 h-5 text-[#af936f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="text-sm font-bold text-white uppercase tracking-wide">Código QR</span>
                    </div>
                  </div>
                  <div className="flex justify-center bg-white p-5 rounded-xl shadow-lg">
                    <QrCanvas
                      value={origin ? `${origin}/public/caballos/${caballo.id}` : `https://handicapp.com/caballos/${caballo.id}`}
                      label=""
                      size={160}
                    />
                  </div>
                  <p className="text-xs text-white/60 text-center mt-4 font-medium">
                    Escanea para ver perfil público
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Información */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="relative">
                <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-[#0f172a] via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {caballo.nombre}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ring-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    caballo.estado_global === "activo"
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 hover:ring-emerald-500/50"
                      : caballo.estado_global === "inactivo"
                      ? "bg-amber-500/10 text-amber-700 ring-amber-500/30 hover:ring-amber-500/50"
                      : caballo.estado_global === "vendido"
                      ? "bg-blue-500/10 text-blue-700 ring-blue-500/30 hover:ring-blue-500/50"
                      : "bg-slate-500/10 text-slate-700 ring-slate-500/30 hover:ring-slate-500/50"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                      caballo.estado_global === "activo" ? "bg-emerald-500" :
                      caballo.estado_global === "inactivo" ? "bg-amber-500" :
                      caballo.estado_global === "vendido" ? "bg-blue-500" :
                      "bg-slate-500"
                    }`}></span>
                    {caballo.estado_global ? caballo.estado_global.toUpperCase() : "SIN ESTADO"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#af936f]/10 to-blue-500/10 text-[#0f172a] rounded-lg font-bold text-sm ring-2 ring-[#af936f]/20 hover:ring-[#af936f]/40 transition-all duration-300 hover:scale-105">
                    <svg className="w-4 h-4 text-[#af936f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {calcularEdad(caballo.fecha_nacimiento)}
                  </span>
                </div>
              </div>

              {/* Microchip */}
              {caballo.microchip && (
                <div className="relative group bg-gradient-to-br from-[#0f172a]/5 to-blue-500/5 p-4 rounded-xl border border-[#af936f]/20 hover:border-[#af936f]/40 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#af936f]/0 to-blue-500/0 group-hover:from-[#af936f]/5 group-hover:to-blue-500/5 rounded-xl transition-all duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Microchip</div>
                      <div className="text-lg font-mono font-bold text-[#0f172a]">{caballo.microchip}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid de información básica */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField
                  label="Sexo"
                  value={caballo.sexo === "macho" ? "Macho" : caballo.sexo === "hembra" ? "Hembra" : "No especificado"}  
                />
                <InfoField
                  label="Raza"
                  value={caballo.raza || "No especificada"}
                />
                <InfoField
                  label="Pelaje"
                  value={caballo.pelaje || "No especificado"}
                />
                <InfoField
                  label="Disciplina"
                  value={caballo.disciplina ? caballo.disciplina.charAt(0).toUpperCase() + caballo.disciplina.slice(1) : "No especificada"}                                                                                                                       />
                <InfoField
                  label="Fecha Nacimiento"
                  value={caballo.fecha_nacimiento ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR', {     
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : "No especificada"}
                />
                <InfoField
                  label="ID"
                  value={`#${caballo.id}`}
                  monospace
                />
              </div>

              {/* Datos físicos */}
              {(caballo.altura || caballo.peso) && (
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/50">
                  {caballo.altura && (
                    <InfoField
                      label="Altura"
                      value={`${caballo.altura} cm`}
                      monospace
                    />
                  )}
                  {caballo.peso && (
                    <InfoField
                      label="Peso"
                      value={`${caballo.peso} kg`}
                      monospace
                    />
                  )}
                </div>
              )}

              {/* Documentación oficial */}
              {(caballo.rp || caballo.sba || caballo.adn || caballo.pasaporte || caballo.numero_fei || caballo.ueln) && (
                <div className="pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Documentación Oficial</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caballo.rp && (
                      <InfoField
                        label="RP (Registro Pedigree)"
                        value={caballo.rp}
                        monospace
                      />
                    )}
                    {caballo.sba && (
                      <InfoField
                        label="SBA (Stud Book)"
                        value={caballo.sba}
                        monospace
                      />
                    )}
                    {caballo.adn && (
                      <InfoField
                        label="ADN (Verificación)"
                        value={caballo.adn}
                        monospace
                      />
                    )}
                    {caballo.pasaporte && (
                      <InfoField
                        label="Pasaporte Equino"
                        value={caballo.pasaporte}
                        monospace
                      />
                    )}
                    {caballo.numero_fei && (
                      <InfoField
                        label="N° FEI"
                        value={caballo.numero_fei}
                        monospace
                      />
                    )}
                    {caballo.ueln && (
                      <InfoField
                        label="UELN (ID Universal)"
                        value={caballo.ueln}
                        monospace
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pedigree Section */}
      {pedigree && (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          
          {/* Header del pedigree */}
          <div className="relative bg-gradient-to-br from-[#0f172a] via-slate-800 to-[#0f172a] p-6 border-b border-[#af936f]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#af936f] to-amber-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Árbol Genealógico</h3>
            </div>
          </div>

          <div className="relative p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-5xl">
                {/* Tree structure horizontal */}
                <div className="flex items-center gap-4">
                  {/* Caballo Principal */}
                  <div className="w-1/4 flex justify-end">
                    <PedigreeNode
                      nombre={caballo.nombre}
                      id={caballo.id}
                      nivel="principal"
                    />
                  </div>

                  {/* Conectores y Padres */}
                  <div className="w-1/4">
                    <div className="space-y-12">
                      {/* Padre */}
                      <div className="relative">
                        <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                        <PedigreeNode
                          nombre={pedigree.padre?.nombre || "Desconocido"}
                          id={pedigree.padre?.id}
                          nivel="padre"
                          sexo="M"
                        />
                      </div>
                      {/* Madre */}
                      <div className="relative">
                        <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                        <PedigreeNode
                          nombre={pedigree.madre?.nombre || "Desconocido"}
                          id={pedigree.madre?.id}
                          nivel="madre"
                          sexo="H"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Abuelos */}
                  <div className="w-1/2">
                    <div className="space-y-6">
                      {/* Abuelos Paternos */}
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                          <PedigreeNode
                            nombre={pedigree.abueloPaterno?.nombre || "Desconocido"}
                            id={pedigree.abueloPaterno?.id}
                            nivel="abuelo"
                            sexo="M"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                          <PedigreeNode
                            nombre={pedigree.abuelaPaterna?.nombre || "Desconocido"}
                            id={pedigree.abuelaPaterna?.id}
                            nivel="abuelo"
                            sexo="H"
                          />
                        </div>
                      </div>

                      {/* Abuelos Maternos */}
                      <div className="space-y-3 mt-8">
                        <div className="relative">
                          <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                          <PedigreeNode
                            nombre={pedigree.abueloMaterno?.nombre || "Desconocido"}
                            id={pedigree.abueloMaterno?.id}
                            nivel="abuelo"
                            sexo="M"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                          <PedigreeNode
                            nombre={pedigree.abuelaMaterna?.nombre || "Desconocido"}
                            id={pedigree.abuelaMaterna?.id}
                            nivel="abuelo"
                            sexo="H"
                          />
                        </div>
                      </div>
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

// Componente para nodos del pedigree - Diseño profesional
function PedigreeNode({
  nombre,
  id,
  nivel,
  sexo
}: {
  nombre: string;
  id?: number;
  nivel: "principal" | "padre" | "madre" | "abuelo";
  sexo?: "M" | "H";
}) {
  const esDesconocido = nombre === "Desconocido";

  const sizeClasses = {
    principal: "p-4 text-base",
    padre: "p-3 text-sm",
    madre: "p-3 text-sm",
    abuelo: "p-2.5 text-xs"
  };

  const colorClasses = nivel === "principal"
    ? "bg-gradient-to-br from-[#0f172a] to-slate-800 text-white border-2 border-[#af936f] shadow-xl hover:shadow-2xl hover:scale-105"
    : esDesconocido
    ? "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 border-2 border-dashed border-slate-300"
    : sexo === "M"
    ? "bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-900 border-2 border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-105"
    : "bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-900 border-2 border-pink-300 hover:border-pink-400 hover:shadow-lg hover:scale-105";

  return (
    <div className={`${sizeClasses[nivel]} ${colorClasses} rounded-lg transition-all duration-300 ${!esDesconocido && 'cursor-pointer'} w-full`}>
      <div className="flex items-center gap-2">
        {sexo && !esDesconocido && (
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
            sexo === "M"
              ? "bg-blue-500 text-white"
              : "bg-pink-500 text-white"
          }`}>
            {sexo}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${nivel === "principal" ? "text-lg" : ""}`}>
            {nombre}
          </p>
          {id && (
            <p className={`text-xs opacity-60 font-mono ${nivel === "principal" ? "text-white/80" : ""}`}>
              #{id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
