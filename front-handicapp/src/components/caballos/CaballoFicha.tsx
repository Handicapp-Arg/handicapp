"use client";

import React from "react";
import Image from "next/image";
import { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import QrCanvas from "@/components/common/QrCanvas";

function InfoField({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{label}</div>
      <div className={`text-base font-bold text-gray-900 ${monospace ? "font-mono" : ""}`}>{value}</div>
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">No se encontró información del caballo</p>
          <p className="text-sm">Por favor, verifica que el ID sea correcto</p>
        </div>
      </div>
    );
  }

  return (
    <div id="ficha-caballo" className="space-y-6 print:bg-white">
      {/* Sección principal con imagen e información */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Imagen y QR */}
            <div className="space-y-6">
              {/* Imagen del caballo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0f172a] to-[#af936f] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative aspect-square w-full bg-white rounded-xl overflow-hidden shadow-xl">
                  {caballo.foto_url ? (
                    <Image 
                      src={getImageUrl(caballo.foto_url) || caballo.foto_url} 
                      alt={caballo.nombre} 
                      fill
                      className="object-contain" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-400">
                        <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="text-center mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Código QR</p>
                </div>
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <QrCanvas 
                    value={origin ? `${origin}/public/caballos/${caballo.id}` : `https://handicapp.com/caballos/${caballo.id}`}
                    label=""
                    size={140} 
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">Escanea para ver el perfil</p>
              </div>
            </div>

            {/* Columna Derecha: Información */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">{caballo.nombre}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ring-2 ${
                    caballo.estado_global === "activo" 
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200" 
                      : caballo.estado_global === "inactivo" 
                      ? "bg-amber-50 text-amber-700 ring-amber-200" 
                      : caballo.estado_global === "vendido" 
                      ? "bg-blue-50 text-blue-700 ring-blue-200" 
                      : "bg-gray-50 text-gray-700 ring-gray-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      caballo.estado_global === "activo" ? "bg-emerald-500" :
                      caballo.estado_global === "inactivo" ? "bg-amber-500" :
                      caballo.estado_global === "vendido" ? "bg-blue-500" :
                      "bg-gray-500"
                    }`}></span>
                    {caballo.estado_global ? caballo.estado_global.toUpperCase() : "SIN ESTADO"}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-[#0f172a]/5 text-[#0f172a] rounded-lg font-bold text-sm">
                    {calcularEdad(caballo.fecha_nacimiento)}
                  </span>
                </div>
              </div>

              {/* Microchip */}
              {caballo.microchip && (
                <div className="bg-[#0f172a]/5 p-4 rounded-xl border border-[#af936f]/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Microchip</div>
                  <div className="text-lg font-mono font-bold text-[#0f172a]">{caballo.microchip}</div>
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
                  value={caballo.disciplina ? caballo.disciplina.charAt(0).toUpperCase() + caballo.disciplina.slice(1) : "No especificada"} 
                />
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
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4">Documentación Oficial</h4>
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#0f172a] p-6">
            <h3 className="text-2xl font-bold text-white">Árbol Genealógico</h3>
          </div>
          
          <div className="p-8 bg-gray-50">
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
    ? "bg-[#0f172a] text-white border-2 border-[#af936f] shadow-lg"
    : esDesconocido
    ? "bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300"
    : sexo === "M"
    ? "bg-white text-blue-900 border-2 border-blue-300 hover:shadow-md"
    : "bg-white text-pink-900 border-2 border-pink-300 hover:shadow-md";

  return (
    <div className={`${sizeClasses[nivel]} ${colorClasses} rounded-lg transition-all duration-200 ${!esDesconocido && 'cursor-pointer hover:scale-105'} w-full`}>
      <div className="flex items-center gap-2">
        {sexo && !esDesconocido && (
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            sexo === "M" 
              ? "bg-blue-100 text-blue-700" 
              : "bg-pink-100 text-pink-700"
          }`}>
            {sexo}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${nivel === "principal" ? "text-lg" : ""}`}>
            {nombre}
          </p>
          {id && (
            <p className={`text-xs opacity-60 ${nivel === "principal" ? "text-white/80" : ""}`}>
              #{id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
