import React from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string; // emoji
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'yellow' | 'pink' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorVariants = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

const iconBgVariants = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  indigo: 'bg-indigo-100',
  yellow: 'bg-yellow-100',
  pink: 'bg-pink-100',
  gray: 'bg-gray-100',
};

export function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs anterior</span>
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBgVariants[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string; // emoji
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'yellow' | 'pink' | 'gray';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

export function ActionCard({ title, description, icon, color, onClick, href, disabled = false }: ActionCardProps) {
  const baseClasses = "bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100";
  const interactiveClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "cursor-pointer hover:scale-[1.02] hover:border-gray-200";

  const content = (
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${iconBgVariants[color]} flex-shrink-0`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-gray-400">→</span>
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