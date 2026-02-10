import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        outline:
          'border-2 border-border bg-transparent hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600',
        secondary:
          'bg-primary-50 text-primary-600 hover:bg-primary-100',
        ghost: 'hover:bg-background-hover hover:text-foreground',
        link: 'text-primary-500 underline-offset-4 hover:underline hover:text-primary-600',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-xs',
        lg: 'h-13 px-8 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
