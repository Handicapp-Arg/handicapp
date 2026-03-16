import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: {
    value: number
    label?: string
    up: boolean
  }
  subtitle?: string
  accentBg?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-gray-500",
  iconBg = "bg-gray-100",
  trend,
  subtitle,
  accentBg: _accentBg,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-slate-200 p-5 border-l-4",
        iconBg === 'bg-emerald-50' ? 'border-l-emerald-400' :
        iconBg === 'bg-amber-50'   ? 'border-l-amber-400' :
        iconBg === 'bg-red-50'     ? 'border-l-red-400' :
        iconBg === 'bg-violet-50'  ? 'border-l-violet-400' :
        iconBg === 'bg-blue-50'    ? 'border-l-blue-400' :
        'border-l-slate-300',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-2xl font-semibold text-slate-800 leading-none tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2.5 text-xs font-semibold px-2 py-0.5 rounded-md",
                trend.up
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              )}
            >
              {trend.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}%</span>
              {trend.label && (
                <span className="font-normal text-[10px] opacity-70">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center",
            iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
