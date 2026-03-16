import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primario — gray-900
        default:
          "bg-gray-900 text-white shadow-sm hover:bg-gray-700",
        // Destructivo — rojo
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        // Outline — borde visible, bg transparente
        outline:
          "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
        // Secundario — gris suave
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
        // Ghost — sin fondo, solo hover
        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        // Link — texto con underline
        link:
          "text-gray-900 underline-offset-4 hover:underline p-0 h-auto",
        // Brand — acento bronce (propietario, acciones principales)
        brand:
          "bg-[#af936f] text-white shadow-sm hover:bg-[#9d8060]",
        // Soft variants — fondo suave + color
        success:
          "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        danger:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
        info:
          "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
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
