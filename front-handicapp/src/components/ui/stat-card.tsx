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
  iconColor = "text-slate-500",
  iconBg = "bg-slate-100",
  trend,
  subtitle,
  accentBg,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/70 p-5 relative overflow-hidden group",
        "shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-slate-300/60 transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Decorative blob */}
      <div
        className={cn(
          "absolute -right-5 -top-5 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
          accentBg ?? "bg-slate-100"
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 leading-none tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2.5 text-xs font-semibold px-2 py-0.5 rounded-lg",
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
            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
