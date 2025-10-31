import React from 'react';
import Link from 'next/link';
import { Plus, LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientFrom: string; // Mantener para compatibilidad (aunque ahora usa color sólido)
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon = Plus,
  onActionClick,
}: PageHeaderProps) {
  const ActionButton = actionLabel ? (
    <button 
      onClick={onActionClick}
      className="px-6 py-3 bg-white text-primary rounded-xl hover:bg-white/90 transition-colors font-medium flex items-center gap-2 shadow-lg"
    >
      <ActionIcon className="w-5 h-5" />
      {actionLabel}
    </button>
  ) : null;

  return (
    <div className="relative overflow-hidden bg-primary rounded-2xl p-6 shadow-lg">
      {/* Efecto de fondo con círculos blur */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#0e445d]/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#af936f]/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {title}
            </h1>
            <p className="text-white/80 text-sm">
              {description}
            </p>
          </div>
        </div>
        {actionHref ? (
          <Link href={actionHref}>
            {ActionButton}
          </Link>
        ) : (
          ActionButton
        )}
      </div>
    </div>
  );
}
