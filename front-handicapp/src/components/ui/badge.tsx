import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        // Base
        default:
          "border-transparent bg-slate-800 text-white",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-600",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline:
          "border-slate-200 text-slate-600 bg-transparent",

        // Estados de tarea/evento
        pendiente:
          "border-amber-200 bg-amber-50 text-amber-700",
        en_progreso:
          "border-blue-200 bg-blue-50 text-blue-700",
        completado:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        cancelado:
          "border-slate-200 bg-slate-100 text-slate-500",
        rechazado:
          "border-red-200 bg-red-50 text-red-600",
        aprobado:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        draft:
          "border-slate-200 bg-slate-50 text-slate-500",

        // Prioridad
        alta:
          "border-red-200 bg-red-50 text-red-700",
        media:
          "border-amber-200 bg-amber-50 text-amber-700",
        baja:
          "border-emerald-200 bg-emerald-50 text-emerald-600",
        critica:
          "border-red-300 bg-red-100 text-red-800",

        // Gravedad médica
        leve:
          "border-blue-200 bg-blue-50 text-blue-700",
        moderado:
          "border-amber-200 bg-amber-50 text-amber-700",
        grave:
          "border-orange-200 bg-orange-50 text-orange-700",
        critico:
          "border-red-300 bg-red-100 text-red-700",

        // Informativos
        info:
          "border-blue-200 bg-blue-50 text-blue-700",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700",
        danger:
          "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
