import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primario — slate-800
        default:
          "bg-slate-800 text-white shadow-sm hover:bg-slate-700 hover:shadow-md",
        // Destructivo — rojo
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        // Outline — borde visible, bg transparente
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300",
        // Secundario — gris suave
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
        // Ghost — sin fondo, solo hover
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        // Link — texto con underline
        link:
          "text-slate-800 underline-offset-4 hover:underline p-0 h-auto",
        // Brand — acento bronce (propietario, acciones principales)
        brand:
          "bg-[#af936f] text-white shadow-sm hover:bg-[#9d8060] hover:shadow-md",
        // Soft variants — fondo suave + color
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        danger:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
        info:
          "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
