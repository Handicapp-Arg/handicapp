"use client";

import React from "react";
import Image from "next/image";
import { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import QrCanvas from "@/components/common/QrCanvas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  IdentificationIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  TrophyIcon, 
  DocumentTextIcon 
} from "@heroicons/react/24/outline";

interface CaballoFichaProps {
  caballo: Caballo;
  origin: string;
  pedigree?: CaballoPedigree | null;
}

const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: React.ElementType }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-slate-400" />}
      <span className="text-slate-500 font-medium">{label}</span>
    </div>
    <div className="text-slate-900 font-semibold text-right">{value || "—"}</div>
  </div>
);

const SectionCard = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
      {Icon && <Icon className="w-5 h-5 text-blue-600" />}
      <h3 className="font-bold text-slate-900">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

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

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) {
      return `${url}?t=${Date.now()}`;
    }
    return `${url}?t=${Date.now()}`;
  };

  if (!caballo) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section: Image & Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Main Image */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
           <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-50">
             {caballo.foto_url ? (
               <Image
                 src={getImageUrl(caballo.foto_url) || ""}
                 alt={caballo.nombre}
                 fill
                 className="object-cover hover:scale-105 transition-transform duration-500"
                 sizes="(max-width: 768px) 100vw, 40vw"
                 priority
               />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                   <UserIcon className="w-16 h-16 opacity-20" />
                   <span className="text-sm font-medium opacity-50">Sin foto de perfil</span>
                </div>
             )}
             
             {/* Badge Over Image */}
             <div className="absolute top-4 left-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md shadow-sm border border-white/20 ${
                 caballo.sexo === "macho" 
                   ? "bg-blue-500/90 text-white" 
                   : caballo.sexo === "hembra"
                   ? "bg-pink-500/90 text-white"
                   : "bg-slate-500/90 text-white"
               }`}>
                 {caballo.sexo === "macho" ? "Macho" : caballo.sexo === "hembra" ? "Hembra" : "—"}
               </span>
             </div>
           </div>
           
           {/* QR Code Mini Card */}
           <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 flex items-center justify-between border border-blue-100 shadow-sm">
              <div className="text-sm text-blue-900">
                 <p className="font-bold">Pasaporte Digital</p>
                 <p className="opacity-70 text-xs mt-0.5">Escanea para ver ficha pública</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                 <QrCanvas
                    value={`${origin}/public/caballos/${caballo.link_uuid || caballo.id}`}
                    size={56}
                 />
              </div>
           </div>
        </div>

        {/* Right: Info Grid */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
           {/* Primary Info Card */}
           <SectionCard title="Información Principal" icon={IdentificationIcon}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                 <DetailRow label="Nombre" value={caballo.nombre} icon={IdentificationIcon} />
                 <DetailRow label="Microchip" value={<span className="font-mono text-slate-600">{caballo.microchip || "—"}</span>} icon={IdentificationIcon} />
                 
                 <DetailRow 
                   label="Fecha Nacimiento" 
                   value={caballo.fecha_nacimiento ? format(new Date(caballo.fecha_nacimiento), "d 'de' MMMM, yyyy", { locale: es }) : "—"} 
                   icon={CalendarIcon} 
                 />
                 <DetailRow label="Edad" value={calcularEdad(caballo.fecha_nacimiento)} icon={CalendarIcon} />
                 
                 <DetailRow label="Raza" value={caballo.raza} icon={TrophyIcon} />
                 <DetailRow label="Pelaje" value={caballo.pelaje} icon={TrophyIcon} />
              </div>
           </SectionCard>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Location & Ownership */}
              <SectionCard title="Ubicación y Propiedad" icon={MapPinIcon}>
                 <div className="flex flex-col gap-2">
                    <DetailRow label="Establecimiento" value={caballo.Establecimiento?.nombre || "—"} icon={MapPinIcon} />
                    <DetailRow label="Ubicación" value={caballo.Establecimiento?.localidad || "—"} icon={MapPinIcon} />
                    <DetailRow label="Propietario" value={caballo.Propietario?.nombre || "—"} icon={UserIcon} />
                 </div>
              </SectionCard>

              {/* Lineage */}
              <SectionCard title="Genealogía" icon={TrophyIcon}>
                 <div className="flex flex-col gap-2">
                    <DetailRow label="Padre" value={caballo.padre?.nombre || "—"} icon={TrophyIcon} />
                    <DetailRow label="Madre" value={caballo.madre?.nombre || "—"} icon={TrophyIcon} />
                    <DetailRow label="Abuelo Materno" value={caballo.abuelo_materno || "—"} icon={TrophyIcon} />
                 </div>
              </SectionCard>
           </div>
        </div>
      </div>
      
      {/* Notes / Extra */}
      {caballo.observaciones && (
         <SectionCard title="Observaciones" icon={DocumentTextIcon}>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{caballo.observaciones}</p>
         </SectionCard>
      )}

    </div>
  );
}
