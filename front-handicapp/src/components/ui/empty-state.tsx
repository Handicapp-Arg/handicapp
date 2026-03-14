import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: "primary" | "secondary"
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  emoji?: string
  title: string
  description?: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  size?: "sm" | "md" | "lg"
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  const sizes = {
    sm: { wrapper: "py-8 px-4", icon: "w-10 h-10", iconInner: "w-5 h-5", title: "text-sm", desc: "text-xs" },
    md: { wrapper: "py-12 px-6", icon: "w-14 h-14", iconInner: "w-6 h-6", title: "text-sm", desc: "text-sm" },
    lg: { wrapper: "py-16 px-8", icon: "w-16 h-16", iconInner: "w-7 h-7", title: "text-base", desc: "text-sm" },
  }
  const s = sizes[size]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "border border-dashed border-slate-200 rounded-2xl bg-slate-50/40",
        s.wrapper,
        className
      )}
      {...props}
    >
      {(Icon || emoji) && (
        <div
          className={cn(
            "rounded-2xl bg-slate-100 flex items-center justify-center mb-4",
            s.icon
          )}
        >
          {Icon ? (
            <Icon className={cn(s.iconInner, "text-slate-400")} />
          ) : (
            <span className="text-2xl">{emoji}</span>
          )}
        </div>
      )}

      <p className={cn("font-semibold text-slate-700", s.title)}>{title}</p>

      {description && (
        <p className={cn("text-slate-500 mt-1 max-w-xs", s.desc)}>{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  action.variant === "secondary"
                    ? "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                )}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  action.variant === "secondary"
                    ? "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                )}
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
