/**
 * DashboardHero - Componente reutilizable para hero sections
 * Diseño profesional y responsive basado en el dashboard de Propietario
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { LOGOS } from '@/lib/constants/logos';

interface CTAButton {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

interface DashboardHeroProps {
  /** Título principal del hero */
  title: string;
  
  /** Descripción/subtítulo */
  description: string;
  
  /** Emoji o icono para el rol */
  roleEmoji?: string;
  
  /** Botones de CTA */
  ctaButtons?: CTAButton[];
  
  /** Mostrar logo en desktop */
  showLogo?: boolean;
  
  /** Color scheme del rol */
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-500 to-cyan-600',
    orb1: 'bg-[#0e445d]/30',
    orb2: 'bg-[#0891b2]/20',
  },
  green: {
    gradient: 'from-emerald-500 to-green-600',
    orb1: 'bg-emerald-600/30',
    orb2: 'bg-green-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    orb1: 'bg-purple-600/30',
    orb2: 'bg-violet-500/20',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    orb1: 'bg-orange-600/30',
    orb2: 'bg-amber-500/20',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-600',
    orb1: 'bg-teal-600/30',
    orb2: 'bg-cyan-500/20',
  },
  red: {
    gradient: 'from-red-500 to-rose-600',
    orb1: 'bg-red-600/30',
    orb2: 'bg-rose-500/20',
  },
};

export function DashboardHero({
  title,
  description,
  roleEmoji,
  ctaButtons = [],
  showLogo = true,
  colorScheme = 'blue',
}: DashboardHeroProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div className="relative overflow-hidden">
      {/* Background oscuro */}
      <div className="absolute inset-0 bg-[#0f172a]"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
      
      {/* Gradient orbs */}
      <div className={`absolute top-0 right-1/4 w-64 h-64 ${colors.orb1} rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-0 left-1/3 w-48 h-48 ${colors.orb2} rounded-full blur-3xl`}></div>
      
      {/* Content - Compacto en móvil/tablet */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Left: Text Content */}
          <div className="flex-1">
            {/* Role emoji badge (mobile/tablet only) */}
            {roleEmoji && (
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-3 lg:hidden">
                <span className="text-3xl sm:text-4xl">{roleEmoji}</span>
              </div>
            )}

            {/* Main Heading - Más compacto en móvil */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {title}
            </h1>

            {/* Description - Texto más pequeño en móvil */}
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-4 sm:mb-6 max-w-2xl leading-relaxed">
              {description}
            </p>

            {/* CTA Buttons - Más compactos en móvil */}
            {ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {ctaButtons.map((button, index) => {
                  const Icon = button.icon;
                  const isPrimary = button.variant !== 'secondary';
                  
                  return (
                    <Link key={index} href={button.href}>
                      <button 
                        className={`group px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm ${
                          isPrimary
                            ? 'bg-white text-slate-900 hover:shadow-xl hover:scale-105'
                            : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 hover:border-white/50'
                        }`}
                      >
                        {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                        <span>{button.label}</span>
                        {isPrimary && (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Logo or Role Icon */}
          {showLogo && (
            <div className="hidden lg:block lg:w-80 xl:w-96 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="relative p-8 flex items-center justify-center">
                  {roleEmoji ? (
                    <div className="relative">
                      <div className={`absolute inset-0 ${colors.orb1} rounded-full blur-3xl`}></div>
                      <div className="relative z-10 text-9xl drop-shadow-2xl">
                        {roleEmoji}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`absolute inset-0 ${colors.orb1} rounded-full blur-3xl`}></div>
                      <Image 
                        src={LOGOS.ICON_WHITE}
                        alt="HandicApp Logo" 
                        width={180} 
                        height={180}
                        className="relative z-10 drop-shadow-2xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
