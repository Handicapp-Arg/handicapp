import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

export interface StatCardData {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string; // e.g., 'slate', 'green', 'blue', 'amber'
  badge?: string;
}

interface PageHeroProps {
  title: string;
  description: string;
  stats: StatCardData[];
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  gradientColors?: {
    primary: string; // e.g., 'slate-600/30'
    secondary: string; // e.g., 'gray-500/20'
  };
}

const colorMap = {
  slate: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
  green: { bg: 'bg-green-500/20', text: 'text-green-300' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-300' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  red: { bg: 'bg-red-500/20', text: 'text-red-300' },
};

export function PageHero({ 
  title, 
  description, 
  stats, 
  actionButton,
  gradientColors = {
    primary: 'slate-600/30',
    secondary: 'gray-500/20'
  }
}: PageHeroProps) {
  return (
    <div className="relative overflow-hidden mb-8 rounded-2xl">
      {/* Background oscuro */}
      <div className="absolute inset-0 bg-[#0f172a]"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
      
      {/* Gradient orbs */}
      <div className={`absolute top-0 right-1/4 w-64 h-64 bg-${gradientColors.primary} rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-0 left-1/3 w-48 h-48 bg-${gradientColors.secondary} rounded-full blur-3xl`}></div>
      
      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-white/70">
              {description}
            </p>
          </div>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {actionButton.icon && <actionButton.icon className="w-5 h-5" />}
              {actionButton.label}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.iconColor as keyof typeof colorMap] || colorMap.slate;
            
            return (
              <Card key={index} className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className={`text-[10px] font-semibold ${colors.text} uppercase tracking-wider`}>
                      {stat.label}
                    </CardDescription>
                    <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-3 h-3 ${colors.text}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                  {stat.badge && (
                    <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                      {stat.badge}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
