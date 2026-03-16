import React from 'react';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  variant?: 'default' | 'compact';
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  variant = 'default',
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className={`bg-gray-900 rounded-md ${variant === 'compact' ? 'mb-6' : 'mb-8'}`}>
        <div className={`px-6 sm:px-8 ${variant === 'compact' ? 'py-6' : 'py-8'}`}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    )}
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-white hover:text-white/80 font-medium">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-300">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className="p-3 bg-gray-700 rounded-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold text-white ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}>
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-300 text-sm sm:text-base max-w-2xl">{description}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">{actions}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHeaderCompact(props: Omit<PageHeaderProps, 'variant'>) {
  return <PageHeader {...props} variant="compact" />;
}
