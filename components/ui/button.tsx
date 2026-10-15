import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /*
         * "Mono Grid" — sharp corners with corner blocks, like a technical
         * viewfinder readout (Deny, ARAH B → revised to solid blocks, Deny "c").
         * 1px `--primary` box, transparent fill, two 8x8 solid `--primary`
         * blocks in opposite corners (top-left, bottom-right).
         *
         * Blocks, not 2px lines: the earlier hairline brackets measured
         * 3.15–5.55:1 against the frosted bar, dipping to 2.56–3.52:1 on a
         * white photo behind it — below the 3:1 non-text floor (WCAG 1.4.11).
         * A filled block carries far more contrasting pixels, so `--primary`
         * solid clears the floor on every backdrop without a new token.
         *
         * Deliberately NOT token-level: `--radius` is global (`--radius-md` is
         * `calc(var(--radius) - 2px)`), so changing it would also square off
         * Card/Input/Dialog/Sheet across the site. This is a variant, exactly
         * how shadcn itself adds a look — no fork of the component.
         *
         * `before`/`after` here are Tailwind's own pseudo-element variants, not
         * bare CSS: a bare `before:` class emits no rule, so the blocks would
         * silently never render. Both are generated with `content-['']` so
         * `::before`/`::after` actually exist.
         *
         * Blocks are 8x8 (h-2 w-2) inside the 44px box — wider blocks on a
         * button this small read as a frame, not a corner accent. z-10 lift:
         * an absolutely positioned pseudo paints above in-flow content, and the
         * lucide `Menu` glyph sits within 8px of both corners, so without it
         * the glyph strokes sit under the blocks.
         */
        technical:
          "relative rounded-none border border-primary bg-transparent text-foreground hover:bg-primary/10 " +
          "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:content-[''] " +
          "before:h-2 before:w-2 before:bg-primary after:pointer-events-none " +
          "after:absolute after:bottom-0 after:right-0 after:z-10 after:content-[''] after:h-2 after:w-2 " +
          "after:bg-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
