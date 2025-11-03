import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Activity } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  // icon can be an emoji string or a React node (Heroicon, SVG, etc.)
  icon?: React.ReactNode | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  // allow rendering additional nodes such as a sparkline
  children?: React.ReactNode;
}

/**
 * Modern stat card for dashboard: clean typography, consistent icon badge using the app brown tones,
 * subtle shadow and accessible color for trend.
 */
export function StatCard({ title, value, subtitle, icon, trend, children }: StatCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#5A3420] to-[#3C2013] text-white shadow">
            {icon ? (
              typeof icon === 'string' ? <span className="text-xl leading-none" aria-hidden>{icon}</span> : icon
            ) : (
              <Activity className="h-6 w-6" aria-hidden />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-500 truncate">{title}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{value}</p>
            {trend && (
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
          {/* small sparkline or custom children */}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode | string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

export function ActionCard({ title, description, icon, onClick, href, disabled = false }: ActionCardProps) {
  const baseClasses = "bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-5 border border-gray-100";
  const interactiveClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer hover:translate-y-0.5 hover:shadow-md";

  const content = (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#5A3420] to-[#3C2013] text-white shadow">
          {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-0 truncate text-sm">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
      </div>

      <div className="flex-shrink-0 text-gray-400">
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    </div>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={`${baseClasses} ${interactiveClasses} block`}>
        {content}
      </a>
    );
  }

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={disabled ? undefined : onClick}
    >
      {content}
    </div>
  );
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
        </div>
        
        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <div className={className}>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">{title}</h2>
      {children}
    </div>
  );
}