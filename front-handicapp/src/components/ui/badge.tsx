import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        // Base
        default:
          "border-transparent bg-gray-900 text-white",
        secondary:
          "border-gray-200 bg-gray-100 text-gray-600",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline:
          "border-gray-200 text-gray-600 bg-transparent",

        // Estados de tarea/evento
        pendiente:
          "border-amber-200 bg-amber-50 text-amber-700",
        en_progreso:
          "border-amber-200 bg-amber-50 text-amber-700",
        completado:
          "border-green-200 bg-green-50 text-green-700",
        cancelado:
          "border-gray-200 bg-gray-100 text-gray-500",
        rechazado:
          "border-red-200 bg-red-50 text-red-600",
        aprobado:
          "border-green-200 bg-green-50 text-green-700",
        draft:
          "border-gray-200 bg-gray-50 text-gray-500",

        // Prioridad
        alta:
          "border-red-200 bg-red-50 text-red-700",
        media:
          "border-amber-200 bg-amber-50 text-amber-700",
        baja:
          "border-green-200 bg-green-50 text-green-600",
        critica:
          "border-red-300 bg-red-100 text-red-800",

        // Gravedad médica
        leve:
          "border-gray-200 bg-gray-100 text-gray-700",
        moderado:
          "border-amber-200 bg-amber-50 text-amber-700",
        grave:
          "border-red-200 bg-red-50 text-red-700",
        critico:
          "border-red-300 bg-red-100 text-red-700",

        // Informativos
        info:
          "border-gray-200 bg-gray-100 text-gray-700",
        success:
          "border-green-200 bg-green-50 text-green-700",
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
