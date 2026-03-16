"use client";

import React from "react";
import Image from "next/image";
import type { Caballo } from "@/lib/services/horseService";
import QrCanvas from "@/components/common/QrCanvas";

interface Props {
  caballo: Caballo;
  origin: string;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[55%] truncate">{value || '—'}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

export default function CaballoFicha({ caballo, origin }: Props) {
  const edad = caballo.fecha_nacimiento
    ? Math.floor((Date.now() - new Date(caballo.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const fechaNac = caballo.fecha_nacimiento
    ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Photo + QR */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative">
          {caballo.foto_url ? (
            <Image
              src={caballo.foto_url}
              alt={caballo.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin foto</div>
          )}
        </div>

        {origin && (
          <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Pasaporte Digital</p>
              <p className="text-xs text-gray-500 mt-0.5">Escanea para ver ficha pública</p>
            </div>
            <QrCanvas value={`${origin}/public/caballos/${caballo.link_uuid || caballo.id}`} size={52} />
          </div>
        )}
      </div>

      {/* Right: Sections */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Section title="Datos Básicos">
          <Row label="Nombre" value={caballo.nombre} />
          <Row label="Sexo" value={caballo.sexo === 'macho' ? 'Macho' : caballo.sexo === 'hembra' ? 'Hembra' : null} />
          <Row label="Raza" value={caballo.raza} />
          <Row label="Pelaje" value={caballo.pelaje} />
          <Row label="Disciplina" value={caballo.disciplina} />
          <Row label="Nacimiento" value={fechaNac} />
          <Row label="Edad" value={edad !== null ? `${edad} años` : null} />
          <Row label="Microchip" value={caballo.microchip} />
        </Section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section title="Genealogía">
            <Row label="Padre" value={caballo.padre?.nombre} />
            <Row label="Madre" value={caballo.madre?.nombre} />
            <Row label="Abuelo Materno" value={caballo.abuelo_materno} />
          </Section>

          <Section title="Ubicación">
            <Row label="Establecimiento" value={caballo.Establecimiento?.nombre} />
            <Row label="Localidad" value={caballo.Establecimiento?.localidad} />
          </Section>
        </div>

        {caballo.observaciones && (
          <Section title="Observaciones">
            <p className="text-sm text-gray-600 py-3 leading-relaxed">{caballo.observaciones}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
