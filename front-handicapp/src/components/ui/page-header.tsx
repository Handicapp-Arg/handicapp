import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
  backHref?: string
  backLabel?: string
  badge?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel,
  badge,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)} {...props}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3 group"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel ?? "Volver"}
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0 flex items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  )
}
